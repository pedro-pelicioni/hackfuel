import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import { chatWithAI, type ChatMessage } from '@/lib/ai'
import { config } from '@/lib/config'
import { useIdeaStore } from '@/stores/ideaStore'
import { useProjectStore } from '@/stores/projectStore'

const QUICK_PROMPTS = [
  'What should I build for the next Monad hackathon?',
  'Suggest a DeFi project that nobody has done yet',
  'What AI + blockchain project would win a hackathon?',
  'Give me a gaming idea for Monad',
]

export function AskAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const ideas = useIdeaStore((s) => s.ideas)
  const registeredProjects = useProjectStore((s) => s.projects)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const allProjects = [
    ...ideas.map((i) => ({ title: i.title, description: i.description, techStack: i.techStack })),
    ...registeredProjects.map((p) => ({ title: p.name, description: p.description, techStack: p.techStack })),
  ]

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const reply = await chatWithAI(newMessages, allProjects)

    if (reply) {
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } else {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, I could not generate a response. Check your Groq API key.' },
      ])
    }

    setLoading(false)
  }

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="py-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-gold" />
          Ask HackFuel AI
        </h2>
        <p className="text-xs text-white/40 mt-0.5">
          Get unique project ideas based on {allProjects.length} existing projects
        </p>
      </div>

      {!config.aiConfigured && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400/80">
            Add <span className="font-mono">VITE_GROQ_API_KEY</span> to .env.
            Free at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com</a>
          </p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pb-2 min-h-0"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <Bot className="w-12 h-12 text-monad-light/30" />
            <p className="text-sm text-white/30">
              Ask me about project ideas for the next Monad hackathon!
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="px-3 py-2 rounded-xl glass text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user'
                ? 'bg-monad/30'
                : 'bg-accent-gold/20'
            }`}>
              {msg.role === 'user'
                ? <User className="w-3.5 h-3.5 text-monad-light" />
                : <Bot className="w-3.5 h-3.5 text-accent-gold" />
              }
            </div>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-monad/20 text-white rounded-tr-sm'
                : 'glass text-white/80 rounded-tl-sm'
            }`}>
              {msg.role === 'assistant' ? (
                <div
                  className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:text-white/70 [&_strong]:text-white [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-white [&_code]:text-monad-light [&_code]:bg-monad/15 [&_code]:px-1 [&_code]:rounded"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
              ) : (
                msg.content
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <motion.div
            className="flex gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-7 h-7 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-accent-gold" />
            </div>
            <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-monad-light/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-monad-light/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-monad-light/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="pt-2 pb-1">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about hackathon ideas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl glass text-white placeholder-white/30
              focus:outline-none focus:ring-2 focus:ring-monad/50 text-sm disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-xl bg-monad hover:bg-monad-dark flex items-center justify-center
              transition-colors disabled:opacity-40 disabled:pointer-events-none flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)/gm, '<li>$1. $2</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^(.+)$/, '<p>$1</p>')
}
