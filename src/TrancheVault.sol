// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {IEAS, AttestationRequest, AttestationRequestData} from "eas-contracts/IEAS.sol";
import {Attestation} from "eas-contracts/Common.sol";

/// @title TrancheVault
/// @notice Condition-gated capital release for venture-style deals. An investor funds a
///         recipient in tranches; each tranche unlocks only once a milestone attestation
///         (posted via EAS by an authorized review agent) has stood unchallenged through a
///         dispute window. This is deliberately NOT a time-based token stream (see Sablier /
///         Superfluid for that, solved problem) — it encodes real diligence conditions.
/// @dev v1 scope: single ERC20-denominated deal per vault instance, one investor, one
///      recipient, one agent, one arbitrator. Multi-deal factory pattern is a v2 concern.
contract TrancheVault {
    enum TrancheStatus {
        Pending, // waiting on an attestation
        Attested, // attestation posted, dispute window running
        Disputed, // investor challenged before the window closed
        Released, // funds sent to recipient
        ClawedBack // funds returned to investor (deadline missed or dispute upheld)
    }

    struct Tranche {
        uint256 amount;
        uint64 deadline; // hard cutoff — if unattested by this time, investor can claw back
        uint64 disputeWindow; // seconds the attestation must stand unchallenged
        bytes32 schemaUID; // EAS schema this tranche's milestone attestation must match
        bytes32 attestationUID; // set once the agent attests
        uint64 attestedAt;
        TrancheStatus status;
    }

    IERC20 public immutable token;
    IEAS public immutable eas;
    address public immutable investor;
    address public immutable recipient;
    address public immutable agent; // address whose EAS attestations are trusted as milestone evidence
    address public immutable arbitrator; // resolves disputes; defaults to investor if none supplied

    Tranche[] public tranches;

    event TrancheCreated(uint256 indexed id, uint256 amount, uint64 deadline, bytes32 schemaUID);
    event TrancheAttested(uint256 indexed id, bytes32 attestationUID, uint64 disputeEndsAt);
    event TrancheDisputed(uint256 indexed id, string reason);
    event DisputeResolved(uint256 indexed id, bool releaseApproved);
    event TrancheReleased(uint256 indexed id, uint256 amount);
    event TrancheClawedBack(uint256 indexed id, uint256 amount);

    error NotInvestor();
    error NotRecipientOrAgent();
    error NotArbitrator();
    error WrongStatus();
    error SchemaMismatch();
    error AttestationRevokedOrExpired();
    error AttestationNotFromAgent();
    error AttestationWrongRecipient();
    error DisputeWindowOpen();
    error DisputeWindowClosed();
    error DeadlineNotPassed();
    error DeadlineAlreadyPassed();
    error TransferFailed();

    modifier onlyInvestor() {
        if (msg.sender != investor) revert NotInvestor();
        _;
    }

    modifier onlyArbitrator() {
        if (msg.sender != arbitrator) revert NotArbitrator();
        _;
    }

    constructor(
        IERC20 _token,
        IEAS _eas,
        address _investor,
        address _recipient,
        address _agent,
        address _arbitrator,
        uint256[] memory _amounts,
        uint64[] memory _deadlines,
        uint64[] memory _disputeWindows,
        bytes32[] memory _schemaUIDs
    ) {
        require(_investor != address(0) && _recipient != address(0) && _agent != address(0), "zero addr");
        require(
            _amounts.length == _deadlines.length && _amounts.length == _disputeWindows.length
                && _amounts.length == _schemaUIDs.length && _amounts.length > 0,
            "length mismatch"
        );

        token = _token;
        eas = _eas;
        investor = _investor;
        recipient = _recipient;
        agent = _agent;
        arbitrator = _arbitrator == address(0) ? _investor : _arbitrator;

        for (uint256 i = 0; i < _amounts.length; i++) {
            tranches.push(
                Tranche({
                    amount: _amounts[i],
                    deadline: _deadlines[i],
                    disputeWindow: _disputeWindows[i],
                    schemaUID: _schemaUIDs[i],
                    attestationUID: bytes32(0),
                    attestedAt: 0,
                    status: TrancheStatus.Pending
                })
            );
            emit TrancheCreated(i, _amounts[i], _deadlines[i], _schemaUIDs[i]);
        }
    }

    /// @notice Fund the vault. Investor must approve the total tranche amount beforehand.
    function fund() external onlyInvestor {
        uint256 total;
        for (uint256 i = 0; i < tranches.length; i++) {
            total += tranches[i].amount;
        }
        if (!token.transferFrom(investor, address(this), total)) revert TransferFailed();
    }

    /// @notice Recipient or agent submits a milestone attestation UID to start the dispute clock.
    /// @dev The attestation must already exist on EAS, be unrevoked, signed by `agent`, match the
    ///      tranche's schema, and reference this tranche (via attestation.refUID or recipient field —
    ///      enforced off-chain by the agent constructing the request; on-chain we check attester +
    ///      schema + recipient as the objective, cheap checks).
    function submitAttestation(uint256 id, bytes32 attestationUID) external {
        if (msg.sender != recipient && msg.sender != agent) revert NotRecipientOrAgent();
        Tranche storage t = tranches[id];
        if (t.status != TrancheStatus.Pending) revert WrongStatus();
        if (block.timestamp > t.deadline) revert DeadlineAlreadyPassed();

        Attestation memory a = eas.getAttestation(attestationUID);
        if (a.attester != agent) revert AttestationNotFromAgent();
        if (a.schema != t.schemaUID) revert SchemaMismatch();
        if (a.recipient != recipient) revert AttestationWrongRecipient();
        if (a.revocationTime != 0 || (a.expirationTime != 0 && a.expirationTime < block.timestamp)) {
            revert AttestationRevokedOrExpired();
        }

        t.attestationUID = attestationUID;
        t.attestedAt = uint64(block.timestamp);
        t.status = TrancheStatus.Attested;

        emit TrancheAttested(id, attestationUID, uint64(block.timestamp) + t.disputeWindow);
    }

    /// @notice Investor challenges an attestation before the dispute window closes. Reason is
    ///         emitted for off-chain record — arbitration substance happens outside this contract
    ///         in v1 (e.g. investor + arbitrator review the evidence URI referenced in the attestation).
    function dispute(uint256 id, string calldata reason) external onlyInvestor {
        Tranche storage t = tranches[id];
        if (t.status != TrancheStatus.Attested) revert WrongStatus();
        if (block.timestamp > t.attestedAt + t.disputeWindow) revert DisputeWindowClosed();

        t.status = TrancheStatus.Disputed;
        emit TrancheDisputed(id, reason);
    }

    /// @notice Arbitrator resolves a disputed tranche.
    function resolveDispute(uint256 id, bool approveRelease) external onlyArbitrator {
        Tranche storage t = tranches[id];
        if (t.status != TrancheStatus.Disputed) revert WrongStatus();

        if (approveRelease) {
            t.status = TrancheStatus.Released;
            emit DisputeResolved(id, true);
            _payout(id, recipient);
        } else {
            t.status = TrancheStatus.ClawedBack;
            emit DisputeResolved(id, false);
            _payout(id, investor);
        }
    }

    /// @notice Anyone can trigger release once an attestation has stood unchallenged past the window.
    function release(uint256 id) external {
        Tranche storage t = tranches[id];
        if (t.status != TrancheStatus.Attested) revert WrongStatus();
        if (block.timestamp <= t.attestedAt + t.disputeWindow) revert DisputeWindowOpen();

        t.status = TrancheStatus.Released;
        _payout(id, recipient);
    }

    /// @notice Investor reclaims a tranche whose deadline passed with no milestone attested.
    function clawback(uint256 id) external onlyInvestor {
        Tranche storage t = tranches[id];
        if (t.status != TrancheStatus.Pending) revert WrongStatus();
        if (block.timestamp <= t.deadline) revert DeadlineNotPassed();

        t.status = TrancheStatus.ClawedBack;
        _payout(id, investor);
    }

    function trancheCount() external view returns (uint256) {
        return tranches.length;
    }

    function _payout(uint256 id, address to) private {
        uint256 amount = tranches[id].amount;
        if (!token.transfer(to, amount)) revert TransferFailed();
        if (to == recipient) {
            emit TrancheReleased(id, amount);
        } else {
            emit TrancheClawedBack(id, amount);
        }
    }
}
