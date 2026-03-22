import { createPublicClient, createWalletClient, http, type Hex, type Account } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { monadTestnet, MONAD_RPC_URL } from './monad'

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(MONAD_RPC_URL),
})

export async function createSmartAccount(credentialId: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(credentialId)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  const privateKey = `0x${Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex

  const account = privateKeyToAccount(privateKey)

  const walletClient = createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(MONAD_RPC_URL),
  })

  return {
    address: account.address,
    privateKey,
    account,
    walletClient,
    publicClient,
  }
}

export function getWalletClientFromKey(privateKey: Hex) {
  const account = privateKeyToAccount(privateKey)
  return createWalletClient({
    account,
    chain: monadTestnet,
    transport: http(MONAD_RPC_URL),
  })
}

export function getAccountFromKey(privateKey: Hex): Account {
  return privateKeyToAccount(privateKey)
}
