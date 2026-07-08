// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {EAS} from "eas-contracts/EAS.sol";
import {SchemaRegistry} from "eas-contracts/SchemaRegistry.sol";
import {ISchemaRegistry} from "eas-contracts/ISchemaRegistry.sol";
import {ISchemaResolver} from "eas-contracts/resolver/ISchemaResolver.sol";
import {IEAS} from "eas-contracts/IEAS.sol";

import {TrancheVault} from "../src/TrancheVault.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @dev Local-only demo seed: deploys EAS + a full example deal to Anvil so the frontend has
///      real data to render (one attested tranche mid-dispute-window, one still pending).
///      Uses Anvil's well-known default private keys — never use these on a real network.
contract DemoSeed is Script {
    uint256 constant INVESTOR_PK = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 constant RECIPIENT_PK = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 constant AGENT_PK = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;
    uint256 constant ARBITRATOR_PK = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6;

    function run() external {
        address investor = vm.addr(INVESTOR_PK);
        address recipient = vm.addr(RECIPIENT_PK);
        address agent = vm.addr(AGENT_PK);
        address arbitrator = vm.addr(ARBITRATOR_PK);

        vm.startBroadcast(INVESTOR_PK);
        SchemaRegistry registry = new SchemaRegistry();
        EAS eas = new EAS(ISchemaRegistry(address(registry)));
        MockERC20 token = new MockERC20();

        bytes32 schemaUID = registry.register(
            "string milestone,uint8 confidence,string evidenceURI", ISchemaResolver(address(0)), true
        );

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 10_000e6;
        amounts[1] = 40_000e6;

        uint64[] memory deadlines = new uint64[](2);
        deadlines[0] = uint64(block.timestamp + 30 days);
        deadlines[1] = uint64(block.timestamp + 90 days);

        uint64[] memory windows = new uint64[](2);
        windows[0] = 3 days;
        windows[1] = 3 days;

        bytes32[] memory schemas = new bytes32[](2);
        schemas[0] = schemaUID;
        schemas[1] = schemaUID;

        TrancheVault vault = new TrancheVault(
            IERC20(address(token)), eas, investor, recipient, agent, arbitrator, amounts, deadlines, windows, schemas
        );

        token.mint(investor, 50_000e6);
        token.approve(address(vault), 50_000e6);
        vault.fund();
        vm.stopBroadcast();

        // NOTE: the agent-attests -> recipient-submits step is deliberately NOT done here.
        // forge script bakes broadcast calldata from a single local simulation pass, and EAS's
        // attestation UID is derived in part from block.timestamp — which differs between the
        // simulation and the real broadcast. That mismatch makes a baked-in submitAttestation
        // call revert against the real on-chain UID. See seed-demo.sh, which does that step with
        // real sequential `cast send` calls instead, reading the actual UID from the tx receipt.

        console.log("SchemaRegistry:", address(registry));
        console.log("EAS:           ", address(eas));
        console.log("MockERC20:     ", address(token));
        console.log("TrancheVault:  ", address(vault));
        console.log("Investor:      ", investor);
        console.log("Recipient:     ", recipient);
        console.log("Agent:         ", agent);
        console.log("Arbitrator:    ", arbitrator);
    }
}
