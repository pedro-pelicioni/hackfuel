import { createWalletClient, http, parseEther, type Hex } from 'viem'
import { mnemonicToAccount } from 'viem/accounts'
import { monadTestnet, MONAD_RPC_URL } from './monad'

const DRIP_AMOUNT = '5'

export async function dripFaucet(recipientAddress: Hex): Promise<Hex | null> {
  const mnemonic = import.meta.env.VITE_FAUCET_MNEMONIC as string | undefined

  if (!mnemonic || mnemonic.trim().split(' ').length < 12) {
    console.warn('Faucet mnemonic not configured')
    return null
  }

  try {
    const account = mnemonicToAccount(mnemonic.trim(), { addressIndex: 1 })
    const walletClient = createWalletClient({
      account,
      chain: monadTestnet,
      transport: http(MONAD_RPC_URL),
    })

    const hash = await walletClient.sendTransaction({
      to: recipientAddress,
      value: parseEther(DRIP_AMOUNT),
    })

    return hash
  } catch (error) {
    console.error('Faucet drip failed:', error)
    return null
  }
}

export const FAUCET_URL = 'https://faucet.monad.xyz'
export const DRIP_AMOUNT_DISPLAY = `${DRIP_AMOUNT} MON`
