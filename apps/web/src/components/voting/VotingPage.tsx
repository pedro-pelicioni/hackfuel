import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Vote } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useVoteStore } from '@/stores/voteStore'
import { mockIdeas } from '@/data/mockIdeas'

export function VotingPage() {
  const { proposals, initProposals, vote, hasVoted, getResults } = useVoteStore()

  useEffect(() => {
    // Initialize proposals from all ideas
    initProposals(mockIdeas.map((i) => i.id))
  }, [initProposals])

  const results = getResults()
  const maxVotes = results.length > 0 ? results[0].votes : 1

  const handleVote = (proposalId: number, ideaTitle: string) => {
    if (hasVoted(proposalId)) {
      toast.error('Already voted!')
      return
    }
    vote(proposalId)
    toast.success('Vote recorded!', {
      description: `Voted for "${ideaTitle}" — Confirming on Monad...`,
      duration: 2000,
    })
  }

  return (
    <motion.div
      className="py-4 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-monad-light" />
          Community Votes
        </h2>
        <Badge variant="monad">{proposals.length} ideas</Badge>
      </div>

      <p className="text-xs text-white/40">
        Vote for the hackathon ideas you want to see built. One vote per idea.
      </p>

      <div className="space-y-2">
        {results.map((proposal, index) => {
          const idea = mockIdeas.find((i) => i.id === proposal.ideaId)
          if (!idea) return null

          const percentage = Math.round((proposal.votes / maxVotes) * 100)
          const voted = hasVoted(proposal.id)

          return (
            <motion.div
              key={proposal.id}
              className="glass rounded-xl p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              {/* Vote bar background */}
              <div
                className="absolute inset-y-0 left-0 bg-monad/10 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex items-center gap-3">
                <span className="text-lg text-white/30 font-bold w-6 text-right">
                  {index + 1}
                </span>
                <span className="text-2xl">{idea.emoji}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{idea.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-white/40">{idea.sponsor}</span>
                    <Badge variant="default">{idea.prize}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-monad-light">
                    {proposal.votes}
                  </span>
                  <Button
                    onClick={() => handleVote(proposal.id, idea.title)}
                    variant={voted ? 'ghost' : 'secondary'}
                    size="sm"
                    disabled={voted}
                    className={voted ? 'opacity-50' : ''}
                  >
                    <Vote className="w-3.5 h-3.5" />
                    {voted ? 'Voted' : 'Vote'}
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
