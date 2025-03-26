// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    uint256 private _nextTokenId;

    constructor() ERC721("RealEstateNFT", "REALE") {}

    function mintNFT(
        address recipient,
        string memory tokenURI
    ) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _mint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);

        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}
