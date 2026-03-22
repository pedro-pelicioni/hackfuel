import type { AIGeneratedIdea } from './idea'

export interface Match {
  ideaId: number
  timestamp: number
  superLiked: boolean
  txHash?: string
  aiIdea?: AIGeneratedIdea
  aiLoading?: boolean
  nftTxHash?: string
}

export interface Proposal {
  id: number
  ideaId: number
  votes: number
  hasVoted: boolean
}
