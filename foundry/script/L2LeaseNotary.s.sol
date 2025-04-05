// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {L2LeaseNotary} from "../src/implementations/L2LeaseNotary.sol";

contract L2LeaseNotaryScript is Script {
    L2LeaseNotary public l2LeaseNotary;

    function setUp() public {}

    function run() public {
        address _usdc = vm.envAddress("ARB_SEPOLIA_USDC");
        address _l2Registry = vm.envAddress("L2REGISTRY_ADDRESS");

        vm.startBroadcast();

        l2LeaseNotary = new L2LeaseNotary(_usdc, _l2Registry);

        vm.stopBroadcast();
    }
}
