// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {LeaseNotary} from "../src/implementations/LeaseNotary.sol";

contract LeaseNotaryScript is Script {
    LeaseNotary public leaseNotary;

    function setUp() public {}

    function run() public {
        address _usdc = vm.envAddress("ARB_SEPOLIA_USDC");
        address _l2Registry = vm.envAddress("L2REGISTRY_ADDRESS");
        address _l2Registrar = vm.envAddress("L2REGISTRAR_ADDRESS");

        vm.startBroadcast();

        leaseNotary = new LeaseNotary(_usdc, _l2Registry, _l2Registrar);

        vm.stopBroadcast();
    }
}
