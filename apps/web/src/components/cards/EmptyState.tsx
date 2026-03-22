import { motion } from 'framer-motion'
import { PartyPopper, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useIdeaStore } from '@/stores/ideaStore'

export function EmptyState() {
  const resetDeck = useIdeaStore((s) => s.resetDeck)

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full gap-6 text-center px-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <PartyPopper className="w-20 h-20 text-monad-light" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">You've seen all ideas!</h2>
        <p className="text-white/50 text-sm">
          Check your matches or come back later for new hackathon bounties.
        </p>
      </div>

      <Button onClick={resetDeck} variant="secondary" size="lg">
        <RotateCcw className="w-4 h-4" />
        Reset Deck
      </Button>
    </motion.div>
  )
}
