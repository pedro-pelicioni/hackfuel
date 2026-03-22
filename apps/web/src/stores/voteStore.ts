import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { voteOnChain } from '@/lib/transactions'
import { config } from '@/lib/config'
import type { Proposal } from '@/types/match'

interface VoteStore {
  proposals: Proposal[]
  votedIds: number[]

  initProposals: (ideaIds: number[]) => void
  vote: (proposalId: number) => void
  hasVoted: (proposalId: number) => boolean
  getResults: () => Proposal[]
}

export const useVoteStore = create<VoteStore>()(
  persist(
    (set, get) => ({
      proposals: [],
      votedIds: [],

      initProposals: (ideaIds) =>
        set((state) => {
          const existingIds = new Set(state.proposals.map((p) => p.ideaId))
          const newProposals = ideaIds
            .filter((id) => !existingIds.has(id))
            .map((ideaId, i) => ({
              id: state.proposals.length + i + 1,
              ideaId,
              votes: Math.floor(Math.random() * 20) + 1,
              hasVoted: false,
            }))
          return { proposals: [...state.proposals, ...newProposals] }
        }),

      vote: (proposalId) => {
        // Optimistic UI update
        set((state) => ({
          votedIds: [...state.votedIds, proposalId],
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? { ...p, votes: p.votes + 1, hasVoted: true }
              : p
          ),
        }))

        // On-chain vote (fire and forget)
        if (config.contractsReady) {
          voteOnChain(proposalId)
        }
      },

      hasVoted: (proposalId) => get().votedIds.includes(proposalId),

      getResults: () =>
        [...get().proposals].sort((a, b) => b.votes - a.votes),
    }),
    { name: 'hackmatch-votes' }
  )
)
