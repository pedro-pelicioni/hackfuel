import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Coins, Building2, Signal, Sparkles, Loader2, ExternalLink, Check, Image } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { mintIdeaNFT } from '@/lib/nft'
import { useIdeaStore } from '@/stores/ideaStore'
import { config } from '@/lib/config'
import type { Idea, Difficulty } from '@/types/idea'
import type { Match } from '@/types/match'

interface IdeaDetailModalProps {
  idea: Idea
  match: Match
  onClose: () => void
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

export function IdeaDetailModal({ idea, match, onClose }: IdeaDetailModalProps) {
  const [minting, setMinting] = useState(false)
  const updateMatchNFT = useIdeaStore((s) => s.updateMatchNFT)
  const alreadyMinted = !!match.nftTxHash

  const handleMint = async () => {
    if (alreadyMinted || minting) return

    setMinting(true)
    try {
      const txHash = await mintIdeaNFT(idea.id, idea, match.aiIdea)
      if (txHash) {
        updateMatchNFT(idea.id, txHash)
        toast.success(config.nftDeployed ? 'NFT Minted on-chain!' : 'Project registered!', {
          description: config.nftDeployed
            ? 'Your project idea is now on Monad'
            : 'Saved locally. Will mint on-chain when contract is deployed.',
        })
      } else {
        toast.error('Mint failed')
      }
    } catch {
      toast.error('Mint failed')
    } finally {
      setMinting(false)
    }
  }

  const modal = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto glass-strong rounded-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 glass-strong rounded-t-2xl px-6 pt-5 pb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{idea.emoji}</span>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{idea.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-white/50 text-xs">
                  <Building2 className="w-3 h-3" />
                  <span>{idea.sponsor}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/50" />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-5">
            {/* Prize & Difficulty */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-monad/20 rounded-full px-3 py-1.5">
                <Coins className="w-3.5 h-3.5 text-accent-gold" />
                <span className="text-sm font-semibold text-accent-gold">{idea.prize}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Signal className={`w-3.5 h-3.5 ${difficultyColors[idea.difficulty]}`} />
                <span className={`text-sm ${difficultyColors[idea.difficulty]}`}>{idea.difficulty}</span>
                <span className="flex gap-0.5 ml-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full ${
                        i < difficultyBars[idea.difficulty]
                          ? difficultyColors[idea.difficulty].replace('text-', 'bg-')
                          : 'bg-white/10'
                      }`}
                      style={{ height: i < difficultyBars[idea.difficulty] ? 12 : 6 }}
                    />
                  ))}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed">{idea.description}</p>

            {/* Tech Stack */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {idea.techStack.map((tech) => (
                  <Badge key={tech} variant="monad">{tech}</Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {idea.tags.map((tag) => (
                  <Badge key={tag} variant="default">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Tx link */}
            {match.txHash && (
              <a
                href={`https://testnet.monadvision.com/tx/${match.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-monad-light hover:text-monad transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View match transaction on Monad Explorer
              </a>
            )}

            {/* AI Section */}
            {(match.aiIdea || match.aiLoading) && (
              <>
                <div className="border-t border-monad/15" />

                {match.aiLoading && (
                  <div className="flex items-center gap-2 text-white/50 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Generating your unique idea variation...</span>
                  </div>
                )}

                {match.aiIdea && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent-gold" />
                      <h3 className="text-sm font-bold text-accent-gold">Your Unique Project Idea</h3>
                    </div>

                    <div>
                      <h4 className="text-base font-semibold text-white">{match.aiIdea.uniqueTitle}</h4>
                      <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
                        {match.aiIdea.uniqueDescription}
                      </p>
                    </div>

                    {match.aiIdea.differentiators.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-white/50 mb-1.5">What makes it unique:</p>
                        <ul className="space-y-1.5">
                          {match.aiIdea.differentiators.map((d, i) => (
                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                              <span className="text-accent-green mt-0.5">-</span>
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {match.aiIdea.suggestedTechStack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {match.aiIdea.suggestedTechStack.map((tech) => (
                          <Badge key={tech} variant="success">{tech}</Badge>
                        ))}
                      </div>
                    )}

                    {match.aiIdea.implementationHints.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-white/50 mb-1.5">How to build it:</p>
                        <ol className="space-y-1.5">
                          {match.aiIdea.implementationHints.map((hint, i) => (
                            <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                              <span className="text-monad-light font-mono text-xs mt-0.5">{i + 1}.</span>
                              {hint}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Mint NFT */}
            <div className="border-t border-monad/15 pt-4">
              {alreadyMinted ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-accent-green">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Project minted as NFT</span>
                  </div>
                  <a
                    href={`https://testnet.monadvision.com/tx/${match.nftTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-monad-light hover:text-monad transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View NFT transaction
                  </a>
                </div>
              ) : (
                <Button
                  onClick={handleMint}
                  loading={minting}
                  size="lg"
                  className="w-full"
                >
                  <Image className="w-4 h-4" />
                  {config.nftDeployed ? 'Mint Project as NFT' : 'Register Project as NFT'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}
