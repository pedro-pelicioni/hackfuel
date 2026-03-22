// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MatchVoting {
    struct Proposal {
        uint256 ideaId;
        uint256 votes;
        bool exists;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256[] public proposalIds;
    uint256 public nextProposalId = 1;

    event ProposalCreated(uint256 indexed proposalId, uint256 indexed ideaId);
    event Voted(address indexed voter, uint256 indexed proposalId);

    function createProposal(uint256 ideaId) external returns (uint256) {
        uint256 proposalId = nextProposalId++;

        proposals[proposalId] = Proposal({
            ideaId: ideaId,
            votes: 0,
            exists: true
        });

        proposalIds.push(proposalId);
        emit ProposalCreated(proposalId, ideaId);

        return proposalId;
    }

    function vote(uint256 proposalId) external {
        require(proposals[proposalId].exists, "Proposal not found");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;
        proposals[proposalId].votes++;

        emit Voted(msg.sender, proposalId);
    }

    function getResults() external view returns (Proposal[] memory) {
        Proposal[] memory results = new Proposal[](proposalIds.length);
        for (uint256 i = 0; i < proposalIds.length; i++) {
            results[i] = proposals[proposalIds[i]];
        }
        return results;
    }

    function getProposalCount() external view returns (uint256) {
        return proposalIds.length;
    }
}
