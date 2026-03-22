import { ethers } from 'hardhat'
import fs from 'fs'
import path from 'path'

const IDEAS = [
  { title: 'MonadSwap AMM', uri: 'ipfs://idea-1' },
  { title: 'NFT Royalty Splitter', uri: 'ipfs://idea-2' },
  { title: 'On-Chain Battle Royale', uri: 'ipfs://idea-3' },
  { title: 'AI Model Marketplace', uri: 'ipfs://idea-4' },
  { title: 'Gas-Free Social Feed', uri: 'ipfs://idea-5' },
  { title: 'DAO Treasury Dashboard', uri: 'ipfs://idea-6' },
  { title: 'ZK Identity Passport', uri: 'ipfs://idea-7' },
  { title: 'Monad Name Service', uri: 'ipfs://idea-8' },
  { title: 'Prediction Market', uri: 'ipfs://idea-9' },
  { title: 'NFT Music Streaming', uri: 'ipfs://idea-10' },
]

async function main() {
  const deploymentsPath = path.join(__dirname, '..', 'deployments.json')
  if (!fs.existsSync(deploymentsPath)) {
    console.error('Deploy contracts first: npm run deploy')
    process.exit(1)
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'))
  const [signer] = await ethers.getSigners()

  // Register seeder as user
  const registry = await ethers.getContractAt('HackMatchRegistry', addresses.HackMatchRegistry)
  const isRegistered = await registry.isRegistered(signer.address)

  if (!isRegistered) {
    const tx = await registry.registerUser(
      ethers.keccak256(ethers.toUtf8Bytes('seeder-passkey')),
      'HackMatch Seeder'
    )
    await tx.wait()
    console.log('Registered seeder user')
  }

  // Create ideas
  for (const idea of IDEAS) {
    const tx = await registry.createIdea(idea.title, idea.uri)
    await tx.wait()
    console.log(`Created idea: ${idea.title}`)
  }

  // Create proposals for voting
  const voting = await ethers.getContractAt('MatchVoting', addresses.MatchVoting)
  for (let i = 1; i <= IDEAS.length; i++) {
    const tx = await voting.createProposal(i)
    await tx.wait()
    console.log(`Created proposal for idea ${i}`)
  }

  console.log('\nSeeding complete!')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
