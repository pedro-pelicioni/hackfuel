import { motion } from 'framer-motion'
import { X, Heart, Star } from 'lucide-react'

interface ActionButtonsProps {
  onSkip: () => void
  onLike: () => void
  onSuperLike: () => void
  disabled?: boolean
}

export function ActionButtons({ onSkip, onLike, onSuperLike, disabled }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-5 py-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        onClick={onSkip}
        disabled={disabled}
        className="w-14 h-14 rounded-full glass flex items-center justify-center
          border border-accent-red/30 hover:border-accent-red/60
          hover:bg-accent-red/10 transition-colors disabled:opacity-40"
      >
        <X className="w-7 h-7 text-accent-red" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        onClick={onSuperLike}
        disabled={disabled}
        className="w-12 h-12 rounded-full glass flex items-center justify-center
          border border-accent-gold/30 hover:border-accent-gold/60
          hover:bg-accent-gold/10 transition-colors disabled:opacity-40"
      >
        <Star className="w-5 h-5 text-accent-gold" fill="currentColor" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        onClick={onLike}
        disabled={disabled}
        className="w-14 h-14 rounded-full glass flex items-center justify-center
          border border-accent-green/30 hover:border-accent-green/60
          hover:bg-accent-green/10 transition-colors disabled:opacity-40"
      >
        <Heart className="w-7 h-7 text-accent-green" fill="currentColor" />
      </motion.button>
    </div>
  )
}
