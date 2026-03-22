// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HackMatchNFT {
    string public name = "HackMatch Ideas";
    string public symbol = "HMIDEA";

    uint256 private _nextTokenId = 1;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => string) private _tokenURIs;
    mapping(address => mapping(uint256 => bool)) public hasMinted;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function mint(uint256 ideaId, string calldata tokenURI_) external returns (uint256) {
        require(!hasMinted[msg.sender][ideaId], "Already minted this idea");

        hasMinted[msg.sender][ideaId] = true;
        uint256 tokenId = _nextTokenId++;

        _owners[tokenId] = msg.sender;
        _balances[msg.sender]++;
        _tokenURIs[tokenId] = tokenURI_;

        emit Transfer(address(0), msg.sender, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Token does not exist");
        return owner;
    }

    function balanceOf(address owner) external view returns (uint256) {
        require(owner != address(0), "Zero address");
        return _balances[owner];
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x80ac58cd || // ERC-721
            interfaceId == 0x01ffc9a7;   // ERC-165
    }
}
