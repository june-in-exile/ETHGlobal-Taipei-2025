// SPDX-License-Identifier: MIT
import "../implementations/ERC4907.sol";

interface ILease {
    /// @notice Landlord sets the monthly rent amount, lease term (in months), and deposit (in months of rent)
    function drawUp(
        uint256 monthlyRent_,
        uint256 leaseTerm_,
        uint256 depositMonths_
    ) external;

    /// @notice When a tenant wants to rent the property, they can deposit the security amount (monthlyRent * depositMonths) and wait for landlord approval
    /// @dev Multiple tenants can make deposits simultaneously
    /// @dev Should record each tenant's deposit details including: start date, lease term, deposit amount, expiration date, etc.
    /// @param starts_ Can be any time on the day before the intended lease start date
    function deposit(uint256 starts_) external;

    /// @notice Get the start of the next day in Taiwan Time Zone (GMT+8)
    /// @param time UNIX timestamp
    /// @return The start of the next GMT+8 day as a UNIX timestamp
    function nextTaiwanDay(uint256 time) external pure returns (uint256);

    /// @notice Landlord selects a tenant and returns deposits to all other applicants
    function agree(address tenant_) external;

    /// @notice Landlord rejects a applicant and returns his deposit
    function reject(address applicant_) external;

    /// @notice Tenant withdraws their deposit voluntarily
    function withdraws() external;

    /// @notice Checks if the landlord can reclaim the property
    function reclaimable() external view returns (bool);

    /// @notice Landlord reclaims the property
    function reclaim() external;

    /// @notice Returns an ERC4907.UserInfo struct containing the current tenant's address and lease expiration timestamp
    function user() external view returns (ERC4907.UserInfo memory);
}