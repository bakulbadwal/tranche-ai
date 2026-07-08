// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {ISchemaRegistry} from "eas-contracts/ISchemaRegistry.sol";
import {ISchemaResolver} from "eas-contracts/resolver/ISchemaResolver.sol";
import {IEAS} from "eas-contracts/IEAS.sol";

import {TrancheVault} from "../src/TrancheVault.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

/// @dev Deploys a demo deal to Base Sepolia against the REAL, live EAS predeploys (OP Stack
///      standard addresses — same on every Superchain L2, including Base). Uses one funded
///      deployer address for all four roles (investor/recipient/agent/arbitrator) to avoid
///      needing to fund multiple testnet wallets — the multi-party flow is already fully
///      exercised by the local Anvil test suite and demo seed; this deploy exists to prove the
///      contract works against real, live attestation infrastructure, not to re-demo roles.
contract DeployBaseSepolia is Script {
    address constant SCHEMA_REGISTRY = 0x4200000000000000000000000000000000000020;
    address constant EAS = 0x4200000000000000000000000000000000000021;

    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        MockERC20 token = new MockERC20();

        bytes32 schemaUID = ISchemaRegistry(SCHEMA_REGISTRY)
            .register("string milestone,uint8 confidence,string evidenceURI", ISchemaResolver(address(0)), true);

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
            IERC20(address(token)),
            IEAS(EAS),
            deployer,
            deployer,
            deployer,
            deployer,
            amounts,
            deadlines,
            windows,
            schemas
        );

        token.mint(deployer, 50_000e6);
        token.approve(address(vault), 50_000e6);
        vault.fund();

        vm.stopBroadcast();

        console.log("MockERC20:     ", address(token));
        console.log("TrancheVault:  ", address(vault));
        console.log("SchemaUID:");
        console.logBytes32(schemaUID);
        console.log("Deployer (all roles):", deployer);
        console.log("EAS (real, predeploy):", EAS);
        console.log("SchemaRegistry (real, predeploy):", SCHEMA_REGISTRY);
    }
}
