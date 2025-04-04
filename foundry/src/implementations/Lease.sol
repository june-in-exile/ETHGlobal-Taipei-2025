// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILease.sol";
import "./LeaseNotary.sol";
import "./ERC4907.sol";

contract Lease is ILease, Ownable {
    uint256 private _tokenId;
    string public houseAddr;
    address private _leaseNotary;

    uint256 public monthlyRent;
    uint256 public leaseTerm;
    uint256 public depositMonths;

    constructor(
        address leaseNotary_,
        uint256 tokenId_
    ) Ownable(msg.sender) {
        _leaseNotary = leaseNotary_;
        _tokenId = tokenId_;

        LeaseNotary notary = LeaseNotary(leaseNotary_);
        houseAddr = notary.house(tokenId_);
    }
    
    function setLease(
        uint256 monthlyRent_,
        uint256 leaseTerm_,
        uint256 depositMonths_
    ) public onlyOwner {
        monthlyRent = monthlyRent_;
        leaseTerm = leaseTerm_;
        depositMonths = depositMonths_;
    }

    



    function user() public view returns (ERC4907.UserInfo memory) {
    }

}
