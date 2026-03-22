import { type Hex, type Abi } from 'viem'
import { useAuthStore } from '@/stores/authStore'
import { getWalletClientFromKey, publicClient } from './smartAccount'
import { REGISTRY_ADDRESS, VOTING_ADDRESS, REGISTRY_ABI, VOTING_ABI } from './contracts'

function getPrivateKey(): Hex | null {
  const state = useAuthStore.getState()
  return (state.derivedPrivateKey as Hex) || null
}

export async function writeToContract(
  address: Hex,
  abi: Abi,
  functionName: string,
  args: unknown[]
): Promise<Hex | null> {
  const privateKey = getPrivateKey()
  if (!privateKey) {
    console.error('No private key available for transaction')
    return null
  }

  try {
    const walletClient = getWalletClientFromKey(privateKey)
    const account = walletClient.account

    if (!account) return null

    const { request } = await publicClient.simulateContract({
      address,
      abi,
      functionName,
      args,
      account,
    })

    const hash = await walletClient.writeContract(request)
    return hash
  } catch (error) {
    console.error(`Contract call ${functionName} failed:`, error)
    return null
  }
}

export async function registerOnChain(
  passkeyPubKeyHash: Hex,
  displayName: string
): Promise<Hex | null> {
  return writeToContract(
    REGISTRY_ADDRESS,
    REGISTRY_ABI as unknown as Abi,
    'registerUser',
    [passkeyPubKeyHash, displayName]
  )
}

export async function matchIdeaOnChain(ideaId: number): Promise<Hex | null> {
  return writeToContract(
    REGISTRY_ADDRESS,
    REGISTRY_ABI as unknown as Abi,
    'matchIdea',
    [BigInt(ideaId)]
  )
}

export async function superLikeIdeaOnChain(ideaId: number): Promise<Hex | null> {
  return writeToContract(
    REGISTRY_ADDRESS,
    REGISTRY_ABI as unknown as Abi,
    'superLikeIdea',
    [BigInt(ideaId)]
  )
}

export async function voteOnChain(proposalId: number): Promise<Hex | null> {
  return writeToContract(
    VOTING_ADDRESS,
    VOTING_ABI as unknown as Abi,
    'vote',
    [BigInt(proposalId)]
  )
}
