// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount;
    uint public immutable feePercent;
    uint public itemCount;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        uint cost;
        address payable seller;
        bool sold;
    }

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint cost,
        address indexed seller
    );

    mapping(uint => Item) public items;

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem(
        IERC721 _nft,
        uint _tokenId,
        uint _cost
    ) external nonReentrant {
        require(_cost > 0, "Cost must be greater than 0");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _cost,
            payable(msg.sender),
            false
        );

        emit Offered(itemCount, address(_nft), _tokenId, _cost, msg.sender);
    }
}
