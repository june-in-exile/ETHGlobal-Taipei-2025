// SPDX-License-Identifier: MIT
import "../implementations/ERC4907.sol";

interface ILease {
    /// @notice Set rental terms (only landlord)
    function setRentalTerms(
        uint256 _monthlyRent,
        uint256 _durationMonths,
        uint256 _depositInMonths
    ) external;

    /// @notice Apply to rent by depositing security payment
    /// @dev Stores each applicant's terms (start date, duration, etc.)
    /// @param intendedStartDay Timestamp of day before desired start
    function applyToRent(uint256 intendedStartDay) external payable;

    /// @notice Approve tenant and refund others
    function approveTenant(address tenant) external;

    /// @notice Reject applicant and refund deposit
    function rejectApplicant(address applicant) external;

    /// @notice Withdraw application deposit (for applicants)
    function withdrawApplication() external;

    /// @notice Pay rent to the landlord directly
    function payRent() external;

    /// @notice Check if property can be reclaimed
    function canReclaim() external view returns (bool);

    /// @notice Reclaim property (when lease ends)
    function reclaimHouse() external;

    /// @notice Get current tenant info
    function getUserInfo() external view returns (ERC4907.UserInfo memory);
}
