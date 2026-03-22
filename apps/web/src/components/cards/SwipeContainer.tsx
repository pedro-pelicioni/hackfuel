import { useState, useRef, useCallback, useMemo } from 'react'
import TinderCard from 'react-tinder-card'
import { AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { IdeaCard } from './IdeaCard'
import { CardOverlay } from './CardOverlay'
import { ActionButtons } from './ActionButtons'
import { EmptyState } from './EmptyState'
import { useIdeaStore } from '@/stores/ideaStore'
import { config } from '@/lib/config'
import type { Idea } from '@/types/idea'

type SwipeDirection = 'left' | 'right' | 'up' | 'down'

export function SwipeContainer() {
  const { ideas, currentIndex, swipeRight, swipeLeft, superLike } = useIdeaStore()
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const cardRefs = useRef<Record<number, any>>({})

  const visibleCards = useMemo(() => {
    return ideas.slice(currentIndex, currentIndex + 3)
  }, [ideas, currentIndex])

  const canSwipe = currentIndex < ideas.length

  const handleSwipe = useCallback(
    (direction: SwipeDirection, idea: Idea) => {
      setDragDirection(null)

      if (direction === 'right') {
        swipeRight(idea.id)
        toast.success(`Matched with "${idea.title}"`, {
          description: config.contractsReady ? 'Recording on Monad...' : 'Saved locally',
          duration: 2000,
        })
      } else if (direction === 'up') {
        superLike(idea.id)
        toast('Super Liked!', {
          description: config.contractsReady
            ? `"${idea.title}" — Recording on Monad...`
            : `"${idea.title}" — Saved locally`,
          duration: 2000,
          icon: '⭐',
        })
      } else {
        swipeLeft(idea.id)
      }
    },
    [swipeRight, swipeLeft, superLike]
  )

  const handleCardLeftScreen = useCallback((_direction: string, id: number) => {
    delete cardRefs.current[id]
  }, [])

  const triggerSwipe = useCallback(
    async (direction: 'left' | 'right' | 'up') => {
      if (!canSwipe) return
      const currentIdea = ideas[currentIndex]
      const ref = cardRefs.current[currentIdea.id]
      if (ref) {
        await ref.swipe(direction)
      }
    },
    [canSwipe, ideas, currentIndex]
  )

  if (!canSwipe) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Card counter */}
      <div className="flex items-center justify-center py-2">
        <span className="text-xs text-white/30 font-mono">
          {currentIndex + 1} / {ideas.length}
        </span>
      </div>

      {/* Card stack */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative w-full" style={{ height: 'min(500px, 65vh)' }}>
          {visibleCards
            .slice()
            .reverse()
            .map((idea, reverseIndex) => {
              const stackIndex = visibleCards.length - 1 - reverseIndex
              const isTop = stackIndex === 0

              return (
                <div
                  key={idea.id}
                  className="absolute inset-0 swipe-card"
                  style={{
                    zIndex: visibleCards.length - stackIndex,
                    transform: `scale(${1 - stackIndex * 0.04}) translateY(${stackIndex * 8}px)`,
                    opacity: stackIndex > 1 ? 0.5 : 1,
                  }}
                >
                  <TinderCard
                    ref={(ref: any) => {
                      if (ref) cardRefs.current[idea.id] = ref
                    }}
                    onSwipe={(dir) => handleSwipe(dir as SwipeDirection, idea)}
                    onCardLeftScreen={(dir) => handleCardLeftScreen(dir, idea.id)}
                    onSwipeRequirementFulfilled={(dir) => {
                      if (isTop) setDragDirection(dir === 'down' ? null : dir as 'left' | 'right' | 'up')
                    }}
                    onSwipeRequirementUnfulfilled={() => {
                      if (isTop) setDragDirection(null)
                    }}
                    preventSwipe={isTop ? ['down'] : ['left', 'right', 'up', 'down']}
                    swipeRequirementType="position"
                    swipeThreshold={80}
                    className="h-full"
                  >
                    <div className="h-full relative">
                      <IdeaCard idea={idea} />
                      {isTop && (
                        <AnimatePresence>
                          <CardOverlay direction={dragDirection} />
                        </AnimatePresence>
                      )}
                    </div>
                  </TinderCard>
                </div>
              )
            })}
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons
        onSkip={() => triggerSwipe('left')}
        onLike={() => triggerSwipe('right')}
        onSuperLike={() => triggerSwipe('up')}
        disabled={!canSwipe}
      />
    </div>
  )
}
