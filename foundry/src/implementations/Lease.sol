// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILease.sol";
import "./LeaseNotary.sol";
import "./ERC4907.sol";

contract Lease is ILease, Ownable {
    struct LeaseInfo {
        uint256 starts; // unix timestamp, lease starts
        uint256 monthlyRent; // amount of USDC tenant should pay monthly
        uint256 durationMonths; // amount of months the lease should be valid
        uint256 depositInMonths; // deposit for how many months
    }

    IERC20 public immutable USDC;
    address public immutable leaseNotary;
    uint256 public immutable tokenId;
    string public houseAddr;

    uint256 public monthlyRent;
    uint256 public durationMonths;
    uint256 public depositInMonths;

    ERC4907.UserInfo private _info;
    uint256 private _remainingDeposit;
    uint256 private _rentPaid;

    mapping(address => LeaseInfo) _leases;

    constructor(
        address _usdc,
        address _leaseNotary,
        uint256 _tokenId
    ) Ownable(msg.sender) {
        leaseNotary = _leaseNotary;
        tokenId = _tokenId;
        _info.user = address(0);
        _info.expires = 0;

        LeaseNotary notary = LeaseNotary(_leaseNotary);
        USDC = IERC20(_usdc);
        houseAddr = notary.house(_tokenId);
    }

    function setRentalTerms(
        uint256 _monthlyRent,
        uint256 _durationMonths,
        uint256 _depositInMonths
    ) public onlyOwner {
        require(_monthlyRent >= 0, "_monthlyRent is negative");
        require(_durationMonths > 0, "_durationMonths is less than 1");
        require(_depositInMonths >= 0, "_durationMonths is negative");
        monthlyRent = _monthlyRent;
        durationMonths = _durationMonths;
        depositInMonths = _depositInMonths;
    }

    function applyToRent(uint256 intendedStartDay) public payable {
        require(msg.sender != owner(), "Caller is the landlord");

        uint256 _starts = getNextTaiwanDay(intendedStartDay);
        require(block.timestamp < _starts, "Lease start time has passed");

        uint256 depositAmount = monthlyRent * depositInMonths;

        require(
            USDC.balanceOf(msg.sender) >= depositAmount,
            "Insufficient USDC balance"
        );

        require(
            USDC.allowance(msg.sender, address(this)) >= depositAmount,
            "Insufficient USDC allowance"
        );

        bool success = USDC.transferFrom(
            msg.sender,
            address(this),
            depositAmount
        );

        require(success, "USDC transfer failed");
    }

    function getNextTaiwanDay(
        uint256 timestamp
    ) internal pure returns (uint256) {
        timestamp += 8 hours;
        timestamp = timestamp - (timestamp % 1 days) + 1 days;
        timestamp -= 8 hours;
        return timestamp;
    }
}
