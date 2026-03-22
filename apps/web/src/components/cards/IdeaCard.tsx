import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import { Coins, Signal, Building2 } from 'lucide-react'
import type { Idea, Difficulty } from '@/types/idea'

interface IdeaCardProps {
  idea: Idea
}

const difficultyColors: Record<Difficulty, string> = {
  Beginner: 'text-accent-green',
  Intermediate: 'text-amber-400',
  Advanced: 'text-orange-400',
  Expert: 'text-accent-red',
}

const difficultyBars: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <div className="w-full h-full select-none">
      <div className="glass gradient-border rounded-3xl h-full flex flex-col overflow-hidden card-shadow">
        {/* Top section with emoji and prize */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-monad/20 rounded-full px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-accent-gold" />
            <span className="text-sm font-semibold text-accent-gold">{idea.prize}</span>
          </div>

          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {idea.emoji}
          </motion.div>

          <h2 className="text-2xl font-bold text-white leading-tight mb-2">
            {idea.title}
          </h2>

          <div className="flex items-center gap-3 text-white/50 text-sm">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {idea.sponsor}
            </span>
            <span className="flex items-center gap-1.5">
              <Signal className={`w-3.5 h-3.5 ${difficultyColors[idea.difficulty]}`} />
              <span className={difficultyColors[idea.difficulty]}>{idea.difficulty}</span>
              <span className="flex gap-0.5 ml-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-${i < difficultyBars[idea.difficulty] ? '3' : '1.5'} rounded-full ${
                      i < difficultyBars[idea.difficulty]
                        ? difficultyColors[idea.difficulty].replace('text-', 'bg-')
                        : 'bg-white/10'
                    }`}
                    style={{ height: i < difficultyBars[idea.difficulty] ? 12 : 6 }}
                  />
                ))}
              </span>
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-4 flex-1">
          <p className="text-white/70 text-sm leading-relaxed">
            {idea.description}
          </p>
        </div>

        {/* Tech stack & tags */}
        <div className="px-6 pb-6 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {idea.techStack.map((tech) => (
              <Badge key={tech} variant="monad">
                {tech}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {idea.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
