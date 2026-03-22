const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const config = {
  get registryDeployed() {
    const addr = import.meta.env.VITE_REGISTRY_ADDRESS || ZERO_ADDRESS
    return addr !== ZERO_ADDRESS
  },
  get votingDeployed() {
    const addr = import.meta.env.VITE_VOTING_ADDRESS || ZERO_ADDRESS
    return addr !== ZERO_ADDRESS
  },
  get faucetConfigured() {
    const mnemonic = import.meta.env.VITE_FAUCET_MNEMONIC as string | undefined
    return !!mnemonic && mnemonic.trim().split(' ').length >= 12
  },
  get aiConfigured() {
    return !!import.meta.env.VITE_GROQ_API_KEY
  },
  get nftDeployed() {
    const addr = import.meta.env.VITE_NFT_ADDRESS || ZERO_ADDRESS
    return addr !== ZERO_ADDRESS
  },
  get contractsReady() {
    return this.registryDeployed && this.votingDeployed
  },
}
