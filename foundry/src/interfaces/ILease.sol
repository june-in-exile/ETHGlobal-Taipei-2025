// SPDX-License-Identifier: MIT
import "../ERC4907.sol";

interface ILease {
    function user() external returns (ERC4907.UserInfo memory);

    function userAt(uint256 time) external returns (ERC4907.UserInfo memory);
}
