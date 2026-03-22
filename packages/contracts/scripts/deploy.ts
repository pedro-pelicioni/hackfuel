import { ethers } from 'hardhat'
import fs from 'fs'
import path from 'path'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying with:', deployer.address)

  // Deploy P256Verifier
  const P256Verifier = await ethers.getContractFactory('P256Verifier')
  const p256 = await P256Verifier.deploy()
  await p256.waitForDeployment()
  const p256Address = await p256.getAddress()
  console.log('P256Verifier:', p256Address)

  // Deploy HackMatchRegistry
  const Registry = await ethers.getContractFactory('HackMatchRegistry')
  const registry = await Registry.deploy()
  await registry.waitForDeployment()
  const registryAddress = await registry.getAddress()
  console.log('HackMatchRegistry:', registryAddress)

  // Deploy MatchVoting
  const Voting = await ethers.getContractFactory('MatchVoting')
  const voting = await Voting.deploy()
  await voting.waitForDeployment()
  const votingAddress = await voting.getAddress()
  console.log('MatchVoting:', votingAddress)

  // Deploy HackMatchNFT
  const NFT = await ethers.getContractFactory('HackMatchNFT')
  const nft = await NFT.deploy()
  await nft.waitForDeployment()
  const nftAddress = await nft.getAddress()
  console.log('HackMatchNFT:', nftAddress)

  // Write addresses to JSON
  const addresses = {
    P256Verifier: p256Address,
    HackMatchRegistry: registryAddress,
    MatchVoting: votingAddress,
    HackMatchNFT: nftAddress,
    network: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  }

  const outputPath = path.join(__dirname, '..', 'deployments.json')
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2))
  console.log('\nAddresses saved to deployments.json')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
