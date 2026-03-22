import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('HackMatchRegistry', function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners()

    const Registry = await ethers.getContractFactory('HackMatchRegistry')
    const registry = await Registry.deploy()

    return { registry, owner, user1, user2 }
  }

  describe('Registration', function () {
    it('should register a new user', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await expect(registry.connect(user1).registerUser(pubKeyHash, 'Alice'))
        .to.emit(registry, 'UserRegistered')
        .withArgs(user1.address, 'Alice')

      expect(await registry.isRegistered(user1.address)).to.be.true
      expect(await registry.totalUsers()).to.equal(1)
    })

    it('should not allow double registration', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await registry.connect(user1).registerUser(pubKeyHash, 'Alice')

      await expect(
        registry.connect(user1).registerUser(pubKeyHash, 'Alice2')
      ).to.be.revertedWith('Already registered')
    })

    it('should reject empty display name', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await expect(
        registry.connect(user1).registerUser(pubKeyHash, '')
      ).to.be.revertedWith('Empty name')
    })
  })

  describe('Matching', function () {
    it('should allow registered user to match an idea', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await registry.connect(user1).registerUser(pubKeyHash, 'Alice')

      await expect(registry.connect(user1).matchIdea(1))
        .to.emit(registry, 'Matched')
        .withArgs(user1.address, 1)

      const matches = await registry.getUserMatches(user1.address)
      expect(matches.length).to.equal(1)
      expect(matches[0]).to.equal(1)
    })

    it('should not allow unregistered user to match', async function () {
      const { registry, user1 } = await deployFixture()

      await expect(
        registry.connect(user1).matchIdea(1)
      ).to.be.revertedWith('Not registered')
    })

    it('should not allow double matching', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await registry.connect(user1).registerUser(pubKeyHash, 'Alice')
      await registry.connect(user1).matchIdea(1)

      await expect(
        registry.connect(user1).matchIdea(1)
      ).to.be.revertedWith('Already matched')
    })
  })

  describe('Super Likes', function () {
    it('should record super-like and also match', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await registry.connect(user1).registerUser(pubKeyHash, 'Alice')

      await expect(registry.connect(user1).superLikeIdea(1))
        .to.emit(registry, 'SuperLiked')
        .withArgs(user1.address, 1)

      const matches = await registry.getUserMatches(user1.address)
      expect(matches.length).to.equal(1)

      const superLikes = await registry.getUserSuperLikes(user1.address)
      expect(superLikes.length).to.equal(1)
    })
  })

  describe('Ideas', function () {
    it('should allow registered user to create an idea', async function () {
      const { registry, user1 } = await deployFixture()

      const pubKeyHash = ethers.keccak256(ethers.toUtf8Bytes('test-passkey'))
      await registry.connect(user1).registerUser(pubKeyHash, 'Alice')

      await expect(registry.connect(user1).createIdea('Test Idea', 'ipfs://test'))
        .to.emit(registry, 'IdeaCreated')
        .withArgs(1, user1.address, 'Test Idea')
    })
  })
})
