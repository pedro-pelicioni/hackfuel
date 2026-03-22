import { createConfig, http } from 'wagmi'
import { monadTestnet } from './monad'

export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
})
