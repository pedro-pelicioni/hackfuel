export const REGISTRY_ADDRESS = (import.meta.env.VITE_REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`
export const VOTING_ADDRESS = (import.meta.env.VITE_VOTING_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`
export const P256_ADDRESS = (import.meta.env.VITE_P256_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`
export const NFT_ADDRESS = (import.meta.env.VITE_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`

export const REGISTRY_ABI = [
  {
    type: 'function',
    name: 'registerUser',
    inputs: [
      { name: 'passkeyPubKeyHash', type: 'bytes32' },
      { name: 'displayName', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'matchIdea',
    inputs: [{ name: 'ideaId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'superLikeIdea',
    inputs: [{ name: 'ideaId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getUserMatches',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'UserRegistered',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'displayName', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'Matched',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'ideaId', type: 'uint256', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'SuperLiked',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'ideaId', type: 'uint256', indexed: true },
    ],
  },
] as const

export const NFT_ABI = [
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'ideaId', type: 'uint256' },
      { name: 'tokenURI_', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasMinted',
    inputs: [
      { name: '', type: 'address' },
      { name: '', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'tokenURI',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: true },
    ],
  },
] as const

export const VOTING_ABI = [
  {
    type: 'function',
    name: 'vote',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getResults',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'ideaId', type: 'uint256' },
          { name: 'votes', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'Voted',
    inputs: [
      { name: 'voter', type: 'address', indexed: true },
      { name: 'proposalId', type: 'uint256', indexed: true },
    ],
  },
] as const
