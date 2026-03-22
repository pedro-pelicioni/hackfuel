import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, Clock, Inbox, Sparkles, ExternalLink, Loader2, Image } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { useIdeaStore } from '@/stores/ideaStore'
import { IdeaDetailModal } from './IdeaDetailModal'
import type { Idea } from '@/types/idea'
import type { Match } from '@/types/match'

export function MatchList() {
  const matches = useIdeaStore((s) => s.matches)
  const ideas = useIdeaStore((s) => s.ideas)
  const [selectedMatch, setSelectedMatch] = useState<{ match: Match; idea: Idea } | null>(null)

  if (matches.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Inbox className="w-16 h-16 text-white/20" />
        <h2 className="text-xl font-bold text-white/70">No matches yet</h2>
        <p className="text-white/40 text-sm">
          Swipe right on ideas you're interested in to see them here!
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        className="py-4 space-y-3 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-lg font-bold text-white mb-4">
          Your Matches
          <span className="text-white/30 text-sm font-normal ml-2">({matches.length})</span>
        </h2>

        {matches.map((match, index) => {
          const idea = ideas.find((i) => i.id === match.ideaId)
          if (!idea) return null

          return (
            <motion.div
              key={match.ideaId}
              className="glass rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedMatch({ match, idea })}
            >
              <div className="text-3xl flex-shrink-0">{idea.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white truncate">{idea.title}</h3>
                  {match.superLiked && (
                    <Star className="w-3.5 h-3.5 text-accent-gold flex-shrink-0" fill="currentColor" />
                  )}
                </div>
                <p className="text-xs text-white/40 truncate mt-0.5">{idea.sponsor}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="monad">{idea.prize}</Badge>
                  <span className="flex items-center gap-1 text-[10px] text-white/30">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(match.timestamp).toLocaleDateString()}
                  </span>
                  {match.txHash && (
                    <a
                      href={`https://testnet.monadvision.com/tx/${match.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-[10px] text-monad-light hover:text-monad"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      tx
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                {match.aiLoading && (
                  <Loader2 className="w-3.5 h-3.5 text-monad-light animate-spin" />
                )}
                {match.aiIdea && (
                  <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                )}
                {match.nftTxHash && (
                  <Image className="w-3.5 h-3.5 text-accent-green" />
                )}
                <Heart className="w-4 h-4 text-accent-green" fill="currentColor" />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {selectedMatch && (
        <IdeaDetailModal
          idea={selectedMatch.idea}
          match={selectedMatch.match}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </>
  )
}
