// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IL2Registry.sol";
import "./L2Registrar.sol";
import "./Lease.sol";
import "./ERC4907.sol";

contract L2LeaseNotary is ERC4907 {
    IERC20 public immutable USDC;
    IL2Registry public immutable l2Registry;

    mapping(uint256 => string) private _houseAddrs;
    uint256 public tokenIdCounter = 0;

    // 定義事件
    event HouseMinted(uint256 indexed tokenId, string houseAddr, address owner);
    event HouseUpdated(uint256 indexed tokenId, string houseAddr);

    constructor(address _usdc, address _l2Registry) ERC4907("HouseNFT", "HSN") {
        USDC = IERC20(_usdc);
        l2Registry = IL2Registry(_l2Registry);
    }

    /// @notice Mint a new NFT with a house address
    /// @param houseAddr The address of the house to associate with the NFT
    /// @return The ID of the newly minted NFT
    function mint(string memory houseAddr) public returns (uint256) {
        uint256 tokenId = ++tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        updateHouse(tokenId, houseAddr);

        Lease lease = new Lease(address(this), tokenId);
        lease.transferOwnership(msg.sender);

        bytes32 node = l2Registry.makeNode(l2Registry.baseNode(), houseAddr);
        bytes memory addr = abi.encodePacked(address(lease)); // Convert address to bytes

        uint256 chainId = 421614; // arbitrum sepolia
        uint256 coinType = (0x80000000 | chainId) >> 0;

        // Set the forward address for the current chain. This is needed for reverse resolution.
        // E.g. if this contract is deployed to Base, set an address for chainId 8453 which is
        // coinType 2147492101 according to ENSIP-11.
        l2Registry.setAddr(node, coinType, addr);

        // Set the forward address for mainnet ETH (coinType 60) for easier debugging.
        l2Registry.setAddr(node, 60, addr);

        // Register the name in the L2 registry
        l2Registry.createSubnode(
            l2Registry.baseNode(),
            houseAddr,
            address(lease),
            new bytes[](0)
        );

        emit HouseMinted(tokenId, houseAddr, msg.sender); // 觸發 HouseMinted 事件

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

        emit HouseUpdated(tokenId, houseAddr); // 觸發 HouseUpdated 事件
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

    function canUse(string memory houseAddr) public returns (bool) {
        Lease lease = Lease(findLease(houseAddr));
        uint256 tokenId = lease.tokenId();
        address user = this.userOf(tokenId);
        if (user == address(0)) {
            // FIX: uuthorized user (e.g., tenant) cannot call syncUser
            syncUser(tokenId);
        }
        return (msg.sender == this.userOf(tokenId));
    }

    /// @notice Sync the user information with the NFT's lease contract
    /// @dev cannot be called properlly
    function syncUser(uint256 tokenId) public {
        Lease lease = Lease(findLease(_houseAddrs[tokenId]));
        ERC4907.UserInfo memory userInfo = lease.getUserInfo();
        _users[tokenId] = ERC4907.UserInfo({
            user: userInfo.user,
            expires: userInfo.expires
        });

        emit UpdateUser(tokenId, userInfo.user, userInfo.expires);
    }

    /// @notice Find the lease contract by its ENS label (i.e., hosueAddr)
    function findLease(string memory label) public view returns (address) {
        string memory ens = string.concat(label, ".leasenotary.eth");
        bytes32 _hash = l2Registry.namehash(ens);
        address lease = l2Registry.addr(_hash);
        return lease;
    }
}
