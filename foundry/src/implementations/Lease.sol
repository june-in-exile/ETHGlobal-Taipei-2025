// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/ILease.sol";
import "./LeaseNotary.sol";
import "./ERC4907.sol";

contract Lease is ILease, Ownable {
    struct Application {
        uint256 starts; // unix timestamp, lease starts
        uint256 monthlyRent; // amount of USDC tenant should pay monthly
        uint256 durationMonths; // amount of months the lease should be valid
        uint256 depositInMonths; // deposit for how many months
    }

    struct Agreement {
        address tenant;
        uint256 starts;
        uint256 expires;
        uint256 monthlyRent;
        uint256 durationMonths;
        uint256 depositInMonths;
        uint256 rentPaid;
        uint256 remainingDeposit;
    }

    IERC20 public immutable USDC;
    LeaseNotary public immutable leaseNotary;
    uint256 public immutable tokenId;
    string public houseAddr;

    bool public rented;
    uint256 public monthlyRent;
    uint256 public durationMonths;
    uint256 public depositInMonths;

    /// @dev adjustment for demo purpose
    uint256 private _month =
        // = 30 days;
        1 seconds;

    Agreement private _agreement;
    address[] private _applicants;
    mapping(address => Application) private _applications;
    mapping(address => uint256) private _debtRecords;

    constructor(address _leaseNotary, uint256 _tokenId) Ownable(msg.sender) {
        leaseNotary = LeaseNotary(_leaseNotary);
        tokenId = _tokenId;
        USDC = IERC20(leaseNotary.USDC());
        houseAddr = leaseNotary.house(_tokenId);
    }

    function setRentalTerms(
        uint256 _monthlyRent,
        uint256 _durationMonths,
        uint256 _depositInMonths
    ) public onlyOwner {
        require(!rented, "House is rented");

        require(_monthlyRent > 0, "_monthlyRent is less than 1");
        require(_durationMonths > 0, "_durationMonths is less than 1");
        require(_depositInMonths >= 0, "_durationMonths is negative");
        monthlyRent = _monthlyRent;
        durationMonths = _durationMonths;
        depositInMonths = _depositInMonths;
    }

    /// @dev adjustment for demo purpose
    function applyToRent() public {
        require(!rented, "House is rented");
        require(msg.sender != owner(), "Caller is the landlord");
        require(!_hasApplied(), "Already applied");

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

        _applicants.push(msg.sender);

        Application storage application = _applications[msg.sender];
        application.starts = block.timestamp;
        application.monthlyRent = monthlyRent;
        application.durationMonths = durationMonths;
        application.depositInMonths = depositInMonths;
    }

    function applyToRent(uint256 intendedStartDay) public {
        require(!rented, "House is rented");
        require(msg.sender != owner(), "Caller is the landlord");
        require(!_hasApplied(), "Already applied");

        uint256 _starts = _getNextTaiwanDay(intendedStartDay);
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

        _applicants.push(msg.sender);

        Application storage application = _applications[msg.sender];
        application.starts = _starts;
        application.monthlyRent = monthlyRent;
        application.durationMonths = durationMonths;
        application.depositInMonths = depositInMonths;
    }

    function _getNextTaiwanDay(
        uint256 timestamp
    ) internal view returns (uint256) {
        timestamp += 8 hours;
        timestamp = timestamp - (timestamp % _month) + 1 days;
        timestamp -= 8 hours;
        return timestamp;
    }

    function approveTenant(address tenant) public onlyOwner {
        require(!rented, "House is rented");

        Application memory application = _applications[tenant];

        _agreement = Agreement({
            tenant: tenant,
            starts: application.starts,
            expires: application.starts + application.durationMonths * _month,
            monthlyRent: application.monthlyRent,
            durationMonths: application.durationMonths,
            depositInMonths: application.depositInMonths,
            rentPaid: 0,
            remainingDeposit: application.monthlyRent *
                application.depositInMonths
        });

        for (uint256 i = 0; i < _applicants.length; i++) {
            address applicant = _applicants[i];
            if (applicant != tenant) {
                _refund(applicant);
                delete _applications[applicant];
            }
        }

        delete _applicants;

        rented = true;
    }

    function _refund(address applicant) internal {
        uint256 depositAmount;
        if (msg.sender == owner() && rented) {
            require(applicant == _agreement.tenant, "Refund not to tenant");
            depositAmount = _agreement.remainingDeposit;
        } else {
            depositAmount =
                _applications[applicant].monthlyRent *
                _applications[applicant].depositInMonths;
        }
        if (depositAmount > 0) {
            bool success = USDC.transfer(applicant, depositAmount);
            require(success, "USDC transfer failed");
        }
    }

    function withdrawApplication() public {
        require(_hasApplied(), "Not applied yet");
        _refund(msg.sender);
        delete _applications[msg.sender];
        _removeApplicant(msg.sender);
    }

    function _removeApplicant(address applicant) internal {
        for (uint256 i = 0; i < _applicants.length; i++) {
            if (_applicants[i] == applicant) {
                _applicants[i] = _applicants[_applicants.length - 1];
                _applicants.pop();
                break;
            }
        }
    }

    function _hasApplied() internal view returns (bool) {
        bool result = false;
        for (uint256 i = 0; i < _applicants.length; i++) {
            if (msg.sender == _applicants[i]) {
                result = true;
            }
        }
        return result;
    }

    function payRent(uint256 amount) public {
        require(rented, "House not rented");
        require(
            msg.sender == _agreement.tenant,
            "Caller is not the designated tenant"
        );

        uint256 totalRent = _agreement.monthlyRent * _agreement.durationMonths;

        require(
            amount <= (totalRent - _agreement.rentPaid),
            "Amount exceeds total rent due"
        );

        bool success = USDC.transferFrom(msg.sender, owner(), amount);
        require(success, "USDC transfer failed");

        _agreement.rentPaid += amount;
    }

    function checkDebt() public view returns (uint256 debt) {
        if (
            rented && (msg.sender == owner() || msg.sender == _agreement.tenant)
        ) {
            uint256 rentDue;

            if (block.timestamp < _agreement.starts) {
                rentDue = 0;
            } else if (block.timestamp >= _agreement.expires) {
                rentDue = _agreement.monthlyRent * _agreement.durationMonths;
            } else {
                rentDue =
                    ((block.timestamp - _agreement.starts) / 1 minutes + 1) *
                    _agreement.monthlyRent;
            }
            return
                _debtRecords[_agreement.tenant] +
                (rentDue - _agreement.rentPaid);
        } else {
            return _debtRecords[msg.sender];
        }
    }

    function canReclaim() public view returns (bool) {
        require(rented, "House not rented");
        uint256 debt = checkDebt();

        return (block.timestamp > _agreement.expires ||
            debt > _agreement.remainingDeposit);
    }

    function reclaimHouse() public onlyOwner {
        require(canReclaim(), "Cannot reclaim");

        uint256 debt = checkDebt();

        if (debt <= _agreement.remainingDeposit) {
            USDC.transfer(owner(), debt);
            _agreement.remainingDeposit -= debt;
            _agreement.rentPaid += debt;
            if (_agreement.remainingDeposit > 0) {
                _refund(_agreement.tenant);
            }
        } else {
            // TODO: punishment
            USDC.transfer(owner(), _agreement.remainingDeposit);
            _agreement.rentPaid += _agreement.remainingDeposit;
            _agreement.remainingDeposit = 0;
            _debtRecords[_agreement.tenant] =
                debt -
                _agreement.remainingDeposit;
        }

        _agreement = Agreement({
            tenant: address(0),
            starts: 0,
            expires: 0,
            monthlyRent: 0,
            durationMonths: 0,
            depositInMonths: 0,
            rentPaid: 0,
            remainingDeposit: 0
        });
        rented = false;
    }

    function getUserInfo() external view returns (ERC4907.UserInfo memory) {
        ERC4907.UserInfo memory userInfo;
        if (!rented || block.timestamp > _agreement.expires) {
            userInfo.user = address(0);
            userInfo.expires = 0;
        } else {
            userInfo.user = _agreement.tenant;
            userInfo.expires = uint64(_agreement.expires);
        }
        return userInfo;
    }

    function checkAgreement() external view returns (Agreement memory) {
        require(
            msg.sender == owner() || msg.sender == _agreement.tenant,
            "Not allowed to check"
        );
        return _agreement;
    }
}
