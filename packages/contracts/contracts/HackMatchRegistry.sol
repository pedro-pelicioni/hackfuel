// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HackMatchRegistry {
    struct User {
        bytes32 passkeyPubKeyHash;
        string displayName;
        bool registered;
    }

    struct Idea {
        uint256 id;
        string title;
        string metadataURI;
        address creator;
        uint256 createdAt;
    }

    mapping(address => User) public users;
    mapping(uint256 => Idea) public ideas;
    mapping(address => uint256[]) private userMatches;
    mapping(address => mapping(uint256 => bool)) private hasMatched;
    mapping(address => uint256[]) private userSuperLikes;
    mapping(address => mapping(uint256 => bool)) private hasSuperLiked;

    uint256 public nextIdeaId = 1;
    uint256 public totalUsers;

    event UserRegistered(address indexed user, string displayName);
    event IdeaCreated(uint256 indexed ideaId, address indexed creator, string title);
    event Matched(address indexed user, uint256 indexed ideaId);
    event SuperLiked(address indexed user, uint256 indexed ideaId);

    modifier onlyRegistered() {
        require(users[msg.sender].registered, "Not registered");
        _;
    }

    function registerUser(bytes32 passkeyPubKeyHash, string calldata displayName) external {
        require(!users[msg.sender].registered, "Already registered");
        require(bytes(displayName).length > 0, "Empty name");

        users[msg.sender] = User({
            passkeyPubKeyHash: passkeyPubKeyHash,
            displayName: displayName,
            registered: true
        });

        totalUsers++;
        emit UserRegistered(msg.sender, displayName);
    }

    function createIdea(string calldata title, string calldata metadataURI) external onlyRegistered {
        require(bytes(title).length > 0, "Empty title");

        uint256 ideaId = nextIdeaId++;
        ideas[ideaId] = Idea({
            id: ideaId,
            title: title,
            metadataURI: metadataURI,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        emit IdeaCreated(ideaId, msg.sender, title);
    }

    function matchIdea(uint256 ideaId) external onlyRegistered {
        require(!hasMatched[msg.sender][ideaId], "Already matched");

        hasMatched[msg.sender][ideaId] = true;
        userMatches[msg.sender].push(ideaId);

        emit Matched(msg.sender, ideaId);
    }

    function superLikeIdea(uint256 ideaId) external onlyRegistered {
        require(!hasSuperLiked[msg.sender][ideaId], "Already super-liked");

        hasSuperLiked[msg.sender][ideaId] = true;
        userSuperLikes[msg.sender].push(ideaId);

        // Super-like also counts as a match
        if (!hasMatched[msg.sender][ideaId]) {
            hasMatched[msg.sender][ideaId] = true;
            userMatches[msg.sender].push(ideaId);
        }

        emit SuperLiked(msg.sender, ideaId);
    }

    function getUserMatches(address user) external view returns (uint256[] memory) {
        return userMatches[user];
    }

    function getUserSuperLikes(address user) external view returns (uint256[] memory) {
        return userSuperLikes[user];
    }

    function isRegistered(address user) external view returns (bool) {
        return users[user].registered;
    }
}
