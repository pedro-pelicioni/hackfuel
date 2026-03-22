import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockIdeas } from '@/data/mockIdeas'
import { matchIdeaOnChain, superLikeIdeaOnChain } from '@/lib/transactions'
import { generateUniqueIdea } from '@/lib/ai'
import { config } from '@/lib/config'
import { useAuthStore } from './authStore'
import type { Idea, AIGeneratedIdea } from '@/types/idea'
import type { Match } from '@/types/match'

interface IdeaStore {
  ideas: Idea[]
  currentIndex: number
  matches: Match[]
  skippedIds: number[]

  swipeRight: (ideaId: number) => void
  superLike: (ideaId: number) => void
  swipeLeft: (ideaId: number) => void
  resetDeck: () => void
  getCurrentIdea: () => Idea | null
  getRemainingIdeas: () => Idea[]
  updateMatchTx: (ideaId: number, txHash: string) => void
  updateMatchAI: (ideaId: number, aiIdea: AIGeneratedIdea) => void
  updateMatchNFT: (ideaId: number, nftTxHash: string) => void
  addIdea: (idea: Idea) => void
}

async function triggerOnChainAndAI(
  ideaId: number,
  onChainFn: (id: number) => Promise<string | null>,
  store: { updateMatchTx: (id: number, tx: string) => void; updateMatchAI: (id: number, ai: AIGeneratedIdea) => void },
  allIdeas: Idea[]
) {
  if (config.contractsReady) {
    onChainFn(ideaId).then((txHash) => {
      if (txHash) store.updateMatchTx(ideaId, txHash)
    })
  }

  if (config.aiConfigured) {
    const idea = allIdeas.find((i) => i.id === ideaId)
    const displayName = useAuthStore.getState().displayName || 'anon'
    if (idea) {
      generateUniqueIdea(idea, displayName).then((aiIdea) => {
        if (aiIdea) store.updateMatchAI(ideaId, aiIdea)
      })
    }
  }
}

export const useIdeaStore = create<IdeaStore>()(
  persist(
    (set, get) => ({
      ideas: mockIdeas,
      currentIndex: 0,
      matches: [],
      skippedIds: [],

      swipeRight: (ideaId) => {
        set((state) => ({
          matches: [
            ...state.matches,
            { ideaId, timestamp: Date.now(), superLiked: false, aiLoading: config.aiConfigured },
          ],
          currentIndex: state.currentIndex + 1,
        }))

        triggerOnChainAndAI(ideaId, matchIdeaOnChain, {
          updateMatchTx: get().updateMatchTx,
          updateMatchAI: get().updateMatchAI,
        }, get().ideas)
      },

      superLike: (ideaId) => {
        set((state) => ({
          matches: [
            ...state.matches,
            { ideaId, timestamp: Date.now(), superLiked: true, aiLoading: config.aiConfigured },
          ],
          currentIndex: state.currentIndex + 1,
        }))

        triggerOnChainAndAI(ideaId, superLikeIdeaOnChain, {
          updateMatchTx: get().updateMatchTx,
          updateMatchAI: get().updateMatchAI,
        }, get().ideas)
      },

      swipeLeft: (ideaId) =>
        set((state) => ({
          skippedIds: [...state.skippedIds, ideaId],
          currentIndex: state.currentIndex + 1,
        })),

      resetDeck: () =>
        set({ currentIndex: 0, matches: [], skippedIds: [] }),

      getCurrentIdea: () => {
        const { ideas, currentIndex } = get()
        return currentIndex < ideas.length ? ideas[currentIndex] : null
      },

      getRemainingIdeas: () => {
        const { ideas, currentIndex } = get()
        return ideas.slice(currentIndex)
      },

      updateMatchTx: (ideaId, txHash) =>
        set((state) => ({
          matches: state.matches.map((m) =>
            m.ideaId === ideaId ? { ...m, txHash } : m
          ),
        })),

      updateMatchAI: (ideaId, aiIdea) =>
        set((state) => ({
          matches: state.matches.map((m) =>
            m.ideaId === ideaId ? { ...m, aiIdea, aiLoading: false } : m
          ),
        })),

      updateMatchNFT: (ideaId, nftTxHash) =>
        set((state) => ({
          matches: state.matches.map((m) =>
            m.ideaId === ideaId ? { ...m, nftTxHash } : m
          ),
        })),

      addIdea: (idea) =>
        set((state) => ({
          ideas: [...state.ideas, idea],
        })),
    }),
    { name: 'hackfuel-ideas' }
  )
)
