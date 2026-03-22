import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { LogOut, ExternalLink, Wallet, Trophy, Heart, Coins, Copy, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatEther, type Hex } from 'viem'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { useIdeaStore } from '@/stores/ideaStore'
import { publicClient } from '@/lib/smartAccount'
import { FAUCET_URL } from '@/lib/faucet'

export function ProfilePage() {
  const { displayName, smartAccountAddress, logout } = useAuthStore()
  const { matches } = useIdeaStore()
  const navigate = useNavigate()
  const [balance, setBalance] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (!smartAccountAddress) return
    navigator.clipboard.writeText(smartAccountAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const superLikes = matches.filter((m) => m.superLiked).length

  useEffect(() => {
    if (smartAccountAddress) {
      publicClient
        .getBalance({ address: smartAccountAddress as Hex })
        .then((bal) => setBalance(formatEther(bal)))
        .catch(() => setBalance(null))
    }
  }, [smartAccountAddress])

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <motion.div
      className="py-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Profile header */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-monad to-monad-dark flex items-center justify-center text-3xl font-bold mx-auto mb-4">
          {displayName?.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-white">{displayName}</h2>
        <button
          onClick={copyAddress}
          className="flex items-center justify-center gap-1.5 mt-2 mx-auto px-3 py-1.5 rounded-lg
            glass hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <Wallet className="w-3 h-3 text-white/40" />
          <span className="text-xs text-white/60 font-mono break-all">
            {smartAccountAddress}
          </span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 flex-shrink-0 transition-colors" />
          )}
        </button>
        {balance !== null && (
          <div className="flex items-center justify-center gap-1 mt-2 text-accent-gold text-sm font-semibold">
            <Coins className="w-3.5 h-3.5" />
            {parseFloat(balance).toFixed(4)} MON
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Matches', value: matches.length, icon: Heart, color: 'text-accent-green' },
          { label: 'Super Likes', value: superLikes, icon: Trophy, color: 'text-accent-gold' },
          { label: 'Reviewed', value: matches.length + useIdeaStore.getState().skippedIds.length, icon: ExternalLink, color: 'text-monad-light' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl p-4 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-white/40">{label}</div>
          </div>
        ))}
      </div>

      {/* Chain info */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white/70">Network</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Chain</span>
          <span className="text-sm text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            Monad Testnet
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Chain ID</span>
          <span className="text-sm text-white font-mono">10143</span>
        </div>
        {balance !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">Balance</span>
            <span className="text-sm text-accent-gold font-mono">{parseFloat(balance).toFixed(4)} MON</span>
          </div>
        )}
        <a
          href={`https://testnet.monadvision.com/address/${smartAccountAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-monad-light hover:text-monad transition-colors pt-2"
        >
          View on Explorer <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Get more MON */}
      <a
        href={FAUCET_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="secondary" className="w-full">
          <Coins className="w-4 h-4" />
          Get More Testnet MON
        </Button>
      </a>

      {/* Actions */}
      <Button onClick={handleLogout} variant="danger" className="w-full">
        <LogOut className="w-4 h-4" />
        Disconnect
      </Button>
    </motion.div>
  )
}
