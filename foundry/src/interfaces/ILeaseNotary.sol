// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "./IERC4907.sol";

interface ILeaseNotary {
    /// @notice Gets the L2 registry contract address
    function l2Registry() external view returns (address);

    /// @notice Gets the current token ID counter
    function tokenIdCounter() external view returns (uint256);

    /// @notice Mints a new NFT with associated house address
    /// @param houseAddr The physical address of the property
    /// @return The newly minted token ID
    function mint(string calldata houseAddr) external returns (uint256);

    /// @notice Updates the house address for a token
    /// @param tokenId The NFT token ID
    /// @param houseAddr The new physical address
    function updateHouse(uint256 tokenId, string calldata houseAddr) external;

    /// @notice Gets the house address for a token
    /// @param tokenId The NFT token ID
    /// @return The associated physical address
    function house(uint256 tokenId) external view returns (string memory);

    /// @notice Checks if caller can use the property
    /// @dev Automatically syncs user data if needed
    /// @param tokenId The NFT token ID
    /// @return True if authorized
    function canUse(uint256 tokenId) external returns (bool);

    /// @notice Finds the lease contract for a property
    /// @param label ENS label (house address)
    /// @return The Lease contract instance
    function findLease(string calldata label) external view returns (address);

    // Inherited from ERC4907 (important to include)
    function userOf(uint256 tokenId) external view returns (address);

    function userExpires(uint256 tokenId) external view returns (uint256);

    function setUser(uint256 tokenId, address user, uint64 expires) external;

    function ownerOf(uint256 tokenId) external view returns (address);

    function getApproved(uint256 tokenId) external view returns (address);

    function isApprovedForAll(
        address owner,
        address operator
    ) external view returns (bool);
}
