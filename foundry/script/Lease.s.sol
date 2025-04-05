// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Lease} from "../src/implementations/Lease.sol";

contract LeaseScript is Script {
    Lease public lease;

    function setUp() public {}

    function run() public {
        address _leaseNotary = vm.envAddress("LEASE_NOTARY_ADDRESS");
        uint256 tokenId = 1;

        vm.startBroadcast();

        lease = new Lease(_leaseNotary, tokenId);

        vm.stopBroadcast();
    }
}
