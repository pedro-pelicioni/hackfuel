import { type Hex, type Abi } from 'viem'
import { writeToContract } from './transactions'
import { NFT_ADDRESS, NFT_ABI } from './contracts'
import { publicClient } from './smartAccount'
import { useAuthStore } from '@/stores/authStore'
import type { Idea, AIGeneratedIdea } from '@/types/idea'

function buildTokenURI(idea: Idea, aiIdea?: AIGeneratedIdea): string {
  const metadata = {
    name: aiIdea?.uniqueTitle || idea.title,
    description: aiIdea?.uniqueDescription || idea.description,
    attributes: [
      { trait_type: 'Base Idea', value: idea.title },
      { trait_type: 'Sponsor', value: idea.sponsor },
      { trait_type: 'Prize', value: idea.prize },
      { trait_type: 'Difficulty', value: idea.difficulty },
      ...idea.tags.map((tag) => ({ trait_type: 'Category', value: tag })),
      ...idea.techStack.map((tech) => ({ trait_type: 'Tech', value: tech })),
    ],
    ...(aiIdea && {
      unique_variation: {
        title: aiIdea.uniqueTitle,
        description: aiIdea.uniqueDescription,
        differentiators: aiIdea.differentiators,
        suggested_tech_stack: aiIdea.suggestedTechStack,
        implementation_hints: aiIdea.implementationHints,
      },
    }),
  }

  const json = JSON.stringify(metadata)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  return `data:application/json;base64,${base64}`
}

export async function mintIdeaNFT(
  ideaId: number,
  idea: Idea,
  aiIdea?: AIGeneratedIdea
): Promise<Hex | null> {
  const tokenURI = buildTokenURI(idea, aiIdea)

  return writeToContract(
    NFT_ADDRESS,
    NFT_ABI as unknown as Abi,
    'mint',
    [BigInt(ideaId), tokenURI]
  )
}

export interface ProjectData {
  name: string
  description: string
  techStack: string[]
  tags: string[]
  emoji: string
}

export async function registerProjectNFT(project: ProjectData): Promise<Hex | null> {
  const ideaId = Date.now() % 1000000000 // unique ID from timestamp

  const metadata = {
    name: project.name,
    description: project.description,
    attributes: [
      ...project.tags.map((tag) => ({ trait_type: 'Category', value: tag })),
      ...project.techStack.map((tech) => ({ trait_type: 'Tech', value: tech })),
    ],
    emoji: project.emoji,
    registered_at: new Date().toISOString(),
    type: 'hackfuel-project',
  }

  const json = JSON.stringify(metadata)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  const tokenURI = `data:application/json;base64,${base64}`

  return writeToContract(
    NFT_ADDRESS,
    NFT_ABI as unknown as Abi,
    'mint',
    [BigInt(ideaId), tokenURI]
  )
}

export async function hasUserMintedIdea(ideaId: number): Promise<boolean> {
  const address = useAuthStore.getState().smartAccountAddress as Hex | null
  if (!address) return false

  try {
    const result = await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: NFT_ABI,
      functionName: 'hasMinted',
      args: [address, BigInt(ideaId)],
    })
    return result as boolean
  } catch {
    return false
  }
}
