import { motion } from 'framer-motion'

interface CardOverlayProps {
  direction: 'left' | 'right' | 'up' | null
}

export function CardOverlay({ direction }: CardOverlayProps) {
  if (!direction) return null

  const config = {
    left: {
      text: 'SKIP',
      color: 'from-accent-red/40',
      borderColor: 'border-accent-red',
      textColor: 'text-accent-red',
      rotation: -12,
    },
    right: {
      text: 'INTERESTED',
      color: 'from-accent-green/40',
      borderColor: 'border-accent-green',
      textColor: 'text-accent-green',
      rotation: 12,
    },
    up: {
      text: 'SUPER LIKE',
      color: 'from-accent-gold/40',
      borderColor: 'border-accent-gold',
      textColor: 'text-accent-gold',
      rotation: 0,
    },
  }

  const c = config[direction]

  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl overflow-hidden pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`absolute inset-0 bg-gradient-to-b ${c.color} to-transparent`} />
      <motion.div
        className={`border-4 ${c.borderColor} rounded-xl px-6 py-3`}
        initial={{ scale: 0.5, rotate: c.rotation, opacity: 0 }}
        animate={{ scale: 1, rotate: c.rotation, opacity: 1 }}
        style={{ transform: `rotate(${c.rotation}deg)` }}
      >
        <span className={`text-3xl font-extrabold ${c.textColor} tracking-wider`}>
          {c.text}
        </span>
      </motion.div>
    </motion.div>
  )
}
