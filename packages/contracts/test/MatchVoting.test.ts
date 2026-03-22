import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('MatchVoting', function () {
  async function deployFixture() {
    const [owner, voter1, voter2] = await ethers.getSigners()

    const Voting = await ethers.getContractFactory('MatchVoting')
    const voting = await Voting.deploy()

    return { voting, owner, voter1, voter2 }
  }

  describe('Proposals', function () {
    it('should create a proposal', async function () {
      const { voting, owner } = await deployFixture()

      await expect(voting.createProposal(1))
        .to.emit(voting, 'ProposalCreated')
        .withArgs(1, 1)

      expect(await voting.getProposalCount()).to.equal(1)
    })
  })

  describe('Voting', function () {
    it('should allow voting on a proposal', async function () {
      const { voting, voter1 } = await deployFixture()

      await voting.createProposal(1)

      await expect(voting.connect(voter1).vote(1))
        .to.emit(voting, 'Voted')
        .withArgs(voter1.address, 1)

      const results = await voting.getResults()
      expect(results[0].votes).to.equal(1)
    })

    it('should not allow double voting', async function () {
      const { voting, voter1 } = await deployFixture()

      await voting.createProposal(1)
      await voting.connect(voter1).vote(1)

      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith('Already voted')
    })

    it('should not allow voting on non-existent proposal', async function () {
      const { voting, voter1 } = await deployFixture()

      await expect(
        voting.connect(voter1).vote(99)
      ).to.be.revertedWith('Proposal not found')
    })

    it('should count votes from multiple voters', async function () {
      const { voting, voter1, voter2 } = await deployFixture()

      await voting.createProposal(1)
      await voting.connect(voter1).vote(1)
      await voting.connect(voter2).vote(1)

      const results = await voting.getResults()
      expect(results[0].votes).to.equal(2)
    })
  })
})
