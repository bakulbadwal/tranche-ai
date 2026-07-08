// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {IEAS} from "eas-contracts/IEAS.sol";
import {TrancheVault} from "../src/TrancheVault.sol";

/// @dev Example deployment. Reads deal parameters from env vars so the same script works for
///      any deal without editing code. See README for the EAS schema you need to register first.
contract DeployTrancheVault is Script {
    function run() external returns (TrancheVault vault) {
        address token = vm.envAddress("TOKEN_ADDRESS");
        address eas = vm.envAddress("EAS_ADDRESS"); // per-chain EAS deployment, see docs.attest.org
        address investor = vm.envAddress("INVESTOR_ADDRESS");
        address recipient = vm.envAddress("RECIPIENT_ADDRESS");
        address agent = vm.envAddress("AGENT_ADDRESS"); // the review agent's signing address
        address arbitrator = vm.envOr("ARBITRATOR_ADDRESS", address(0)); // 0 => defaults to investor
        bytes32 schemaUID = vm.envBytes32("MILESTONE_SCHEMA_UID");

        uint256[] memory amounts = vm.envUint("TRANCHE_AMOUNTS", ",");
        uint64[] memory deadlines = _toU64(vm.envUint("TRANCHE_DEADLINES", ","));
        uint64[] memory windows = _toU64(vm.envUint("DISPUTE_WINDOWS_SECONDS", ","));

        bytes32[] memory schemas = new bytes32[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            schemas[i] = schemaUID;
        }

        vm.startBroadcast();
        vault = new TrancheVault(
            IERC20(token), IEAS(eas), investor, recipient, agent, arbitrator, amounts, deadlines, windows, schemas
        );
        vm.stopBroadcast();

        console.log("TrancheVault deployed:", address(vault));
    }

    function _toU64(uint256[] memory arr) private pure returns (uint64[] memory out) {
        out = new uint64[](arr.length);
        for (uint256 i = 0; i < arr.length; i++) {
            out[i] = uint64(arr[i]);
        }
    }
}
