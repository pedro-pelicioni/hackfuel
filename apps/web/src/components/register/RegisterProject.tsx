import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, X, Plus, ExternalLink, Check, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { registerProjectNFT } from '@/lib/nft'
import { generateProjectSuggestion } from '@/lib/ai'
import { config } from '@/lib/config'
import { useProjectStore, type RegisteredProject } from '@/stores/projectStore'
import { useIdeaStore } from '@/stores/ideaStore'
import { useAuthStore } from '@/stores/authStore'
import type { Category } from '@/types/idea'

const CATEGORIES: Category[] = ['DeFi', 'NFT', 'Gaming', 'AI', 'Infra', 'Social', 'DAO', 'Privacy', 'Identity']

const EMOJIS = ['🚀', '🔥', '💡', '🛠️', '🌐', '🎮', '🤖', '🔒', '💰', '🎨', '📊', '⚡', '🏗️', '🔗', '🧠']

export function RegisterProject() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState('🚀')
  const [registering, setRegistering] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{
    differentiators: string[]
    originalityTips: string[]
  } | null>(null)

  const { projects, addProject } = useProjectStore()
  const addIdea = useIdeaStore((s) => s.addIdea)
  const displayName = useAuthStore((s) => s.displayName)

  const addTech = () => {
    const tech = techInput.trim()
    if (tech && !techStack.includes(tech)) {
      setTechStack([...techStack, tech])
      setTechInput('')
    }
  }

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech))
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setTechInput('')
    setTechStack([])
    setSelectedTags([])
    setSelectedEmoji('🚀')
    setAiSuggestion(null)
  }

  const handleAISuggest = async () => {
    if (!name.trim()) {
      toast.error('Enter a project name first')
      return
    }

    if (!config.aiConfigured) {
      toast.error('Groq API key not configured', {
        description: 'Add VITE_GROQ_API_KEY to .env (free at console.groq.com)',
      })
      return
    }

    setAiLoading(true)
    try {
      const suggestion = await generateProjectSuggestion(name.trim(), description.trim())
      if (suggestion) {
        setDescription(suggestion.improvedDescription)
        if (suggestion.suggestedTechStack.length > 0) {
          setTechStack((prev) => {
            const combined = new Set([...prev, ...suggestion.suggestedTechStack])
            return Array.from(combined)
          })
        }
        if (suggestion.suggestedTags.length > 0) {
          const validTags = suggestion.suggestedTags.filter((t) =>
            CATEGORIES.includes(t as Category)
          )
          if (validTags.length > 0) {
            setSelectedTags((prev) => {
              const combined = new Set([...prev, ...validTags])
              return Array.from(combined)
            })
          }
        }
        setAiSuggestion({
          differentiators: suggestion.differentiators,
          originalityTips: suggestion.originalityTips,
        })
        toast.success('AI suggestions applied!')
      } else {
        toast.error('AI suggestion failed')
      }
    } catch {
      toast.error('AI suggestion failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Enter a project name')
      return
    }
    if (!description.trim()) {
      toast.error('Enter a project description')
      return
    }
    if (techStack.length === 0) {
      toast.error('Add at least one technology')
      return
    }
    if (selectedTags.length === 0) {
      toast.error('Select at least one category')
      return
    }

    setRegistering(true)
    try {
      const txHash = await registerProjectNFT({
        name: name.trim(),
        description: description.trim(),
        techStack,
        tags: selectedTags,
        emoji: selectedEmoji,
      })

      if (txHash) {
        const project: RegisteredProject = {
          name: name.trim(),
          description: description.trim(),
          techStack,
          tags: selectedTags,
          emoji: selectedEmoji,
          nftTxHash: txHash,
          registeredAt: Date.now(),
        }
        addProject(project)

        // Add to Discover feed so others can see it
        const newIdeaId = 1000 + Date.now() % 100000
        addIdea({
          id: newIdeaId,
          title: name.trim(),
          description: description.trim(),
          prize: 'Community',
          techStack,
          difficulty: 'Intermediate',
          sponsor: displayName || 'Anonymous',
          tags: selectedTags as Category[],
          emoji: selectedEmoji,
        })

        toast.success('Project registered on Monad!', {
          description: 'Your project NFT is minted. It now appears in Discover!',
          action: {
            label: 'View TX',
            onClick: () => window.open(`https://testnet.monadvision.com/tx/${txHash}`, '_blank'),
          },
        })

        resetForm()
      } else {
        toast.error('Registration failed', {
          description: 'Could not mint NFT. Make sure you have MON for gas.',
        })
      }
    } catch {
      toast.error('Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  return (
    <motion.div
      className="py-4 space-y-5 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-monad-light" />
          Register Your Project
        </h2>
        <p className="text-xs text-white/40 mt-1">
          Mint your project as an NFT on Monad to prove originality and avoid plagiarism.
        </p>
      </div>

      {!config.aiConfigured && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80">
            Add <span className="font-mono">VITE_GROQ_API_KEY</span> to .env for AI anti-plagiarism suggestions.
            Free at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a>
          </p>
        </div>
      )}

      {/* Emoji selector */}
      <div>
        <label className="text-xs font-medium text-white/50 mb-2 block">Project Icon</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                selectedEmoji === emoji
                  ? 'glass border-monad/50 scale-110'
                  : 'hover:bg-white/5'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Project name */}
      <div>
        <label className="text-xs font-medium text-white/50 mb-2 block">Project Name</label>
        <input
          type="text"
          placeholder="My Awesome Project"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:ring-monad/50 text-sm"
        />
      </div>

      {/* Description + AI button */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-white/50">Description</label>
          <Button
            onClick={handleAISuggest}
            loading={aiLoading}
            variant="ghost"
            size="sm"
            disabled={!name.trim()}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            Generate with AI
          </Button>
        </div>
        <textarea
          placeholder="Describe what your project does, the problem it solves, and how it works..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl glass text-white placeholder-white/30
            focus:outline-none focus:ring-2 focus:ring-monad/50 text-sm resize-none"
        />
      </div>

      {/* AI Suggestions */}
      {aiSuggestion && (
        <motion.div
          className="glass rounded-xl p-4 space-y-3 border border-accent-gold/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent-gold" />
            <span className="text-xs font-bold text-accent-gold">AI Anti-Plagiarism Tips</span>
          </div>
          {aiSuggestion.differentiators.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-white/40 mb-1">What makes it unique:</p>
              {aiSuggestion.differentiators.map((d, i) => (
                <p key={i} className="text-xs text-white/60 flex items-start gap-1.5 mb-1">
                  <span className="text-accent-green">-</span> {d}
                </p>
              ))}
            </div>
          )}
          {aiSuggestion.originalityTips.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-white/40 mb-1">Originality tips:</p>
              {aiSuggestion.originalityTips.map((t, i) => (
                <p key={i} className="text-xs text-white/60 flex items-start gap-1.5 mb-1">
                  <span className="text-monad-light">{i + 1}.</span> {t}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tech stack */}
      <div>
        <label className="text-xs font-medium text-white/50 mb-2 block">Tech Stack</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Solidity, React..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addTech() }
            }}
            className="flex-1 px-4 py-2.5 rounded-xl glass text-white placeholder-white/30
              focus:outline-none focus:ring-2 focus:ring-monad/50 text-sm"
          />
          <Button onClick={addTech} variant="secondary" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                  bg-monad/15 text-monad-light cursor-pointer hover:bg-monad/25 transition-colors"
                onClick={() => removeTech(tech)}
              >
                {tech}
                <X className="w-3 h-3" />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-medium text-white/50 mb-2 block">Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-monad/30 text-monad-light border border-monad/50'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Register button */}
      <Button
        onClick={handleRegister}
        loading={registering}
        size="lg"
        className="w-full"
      >
        <Rocket className="w-4 h-4" />
        Register on Monad
      </Button>

      {/* Registered projects */}
      {projects.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-monad/15">
          <h3 className="text-sm font-bold text-white/70">
            Your Registered Projects
            <span className="text-white/30 font-normal ml-1">({projects.length})</span>
          </h3>

          {projects.map((project, i) => (
            <motion.div
              key={project.registeredAt}
              className="glass rounded-xl p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{project.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white truncate">{project.name}</h4>
                    <Check className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="monad">{tech}</Badge>
                    ))}
                    {project.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-white/30">
                      {new Date(project.registeredAt).toLocaleDateString()}
                    </span>
                    <a
                      href={`https://testnet.monadvision.com/tx/${project.nftTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-monad-light hover:text-monad"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      View on Explorer
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
