// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "../interfaces/IL2Registry.sol";
import "./Lease.sol";
import "./ERC4907.sol";

contract LeaseNotary is ERC4907 {
    IL2Registry l2Registry =
        IL2Registry(0x257Ed5B68C2A32273Db8490e744028a63aCC771F);

    mapping(uint256 => string) private _houseAddrs;
    uint256 private _tokenIdCounter = 0;

    constructor() ERC4907("HouseNFT", "HSN") {}

    /// @notice Mint a new NFT with a house address
    /// @param houseAddr The address of the house to associate with the NFT
    /// @return The ID of the newly minted NFT
    function mint(string memory houseAddr) public returns (uint256) {
        uint256 tokenId = ++_tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        updateHouse(tokenId, houseAddr);
        return tokenId;
    }

    /// @notice Update the house address for a given tokenId
    /// @dev Throws if `tokenId` is not valid NFT
    /// @param tokenId The ID of the NFT
    /// @param houseAddr The new house address to set
    function updateHouse(uint256 tokenId, string memory houseAddr) public {
        require(
            _isAuthorized(_ownerOf(tokenId), msg.sender, tokenId),
            "ERC721: update caller is not owner nor approved"
        );
        _houseAddrs[tokenId] = houseAddr;
    }

    /// @notice Get the house address for a given tokenId
    /// @dev Throws if `tokenId` is not valid NFT
    /// @param tokenId The ID of the NFT
    /// @return The house address for this NFT
    function house(uint256 tokenId) public view returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "ERC721Metadata: House query for nonexistent token"
        );
        return _houseAddrs[tokenId];
    }

    /// @notice Sync the user information with the NFT's lease contract
    function syncUser(uint256 tokenId) internal {
        Lease lease = findLease(_houseAddrs[tokenId]);
        ERC4907.UserInfo memory info = lease.getUserInfo();
        ERC4907.setUser(tokenId, info.user, info.expires);
    }

    /// @notice Find the lease contract by its ENS label (i.e., hosueAddr)
    function findLease(string memory label) public view returns (Lease) {
        string memory ens = string.concat(label, ".leasenotary.eth");
        bytes32 _hash = l2Registry.namehash(ens);
        address lease = l2Registry.addr(_hash);
        return Lease(lease);
    }
}
