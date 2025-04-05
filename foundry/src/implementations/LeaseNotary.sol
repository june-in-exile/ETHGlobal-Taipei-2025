// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IL2Registry.sol";
import "./L2Registrar.sol";
import "./Lease.sol";
import "./ERC4907.sol";

contract LeaseNotary is ERC4907 {
    IERC20 public immutable USDC;
    IL2Registry public immutable l2Registry;
    L2Registrar public immutable l2Registrar;

    mapping(uint256 => string) private _houseAddrs;
    mapping(uint256 => address) public leases;
    uint256 public tokenIdCounter = 0;

    constructor(
        address _usdc,
        address _l2Registry,
        address _l2Registrar
    ) ERC4907("HouseNFT", "HSN") {
        USDC = IERC20(_usdc);
        l2Registry = IL2Registry(_l2Registry);
        l2Registrar = L2Registrar(_l2Registrar);
    }

    /// @notice Mint a new NFT with a house address
    /// @param houseAddr The address of the house to associate with the NFT
    /// @return The ID of the newly minted NFT
    function mint(string memory houseAddr) public returns (uint256) {
        require(
            l2Registrar.available(houseAddr),
            "house address already registered"
        );

        uint256 tokenId = ++tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        updateHouse(tokenId, houseAddr);

        Lease lease = new Lease(address(this), tokenId);
        lease.transferOwnership(msg.sender);
        leases[tokenId] = address(lease);

        // l2Registrar.register(houseAddr, address(lease));

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

    function canUse(uint256 tokenId) public returns (bool) {
        address user = ERC4907.userOf(tokenId);
        if (user == address(0)) {
            syncUser(tokenId);
        }
        return (msg.sender == ERC4907.userOf(tokenId));
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
