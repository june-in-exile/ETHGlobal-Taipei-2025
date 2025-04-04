// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Lease} from "../src/implementations/Lease.sol";

contract LeaseScript is Script {
    Lease public lease;

    function setUp() public {}

    function run() public {
        address _l2leaseNotary = vm.envAddress("L2LEASE_NOTARY_ADDRESS");
        uint256 tokenId = 1;

        vm.startBroadcast();

        lease = new Lease(_l2leaseNotary, tokenId);

        vm.stopBroadcast();
    }
}
