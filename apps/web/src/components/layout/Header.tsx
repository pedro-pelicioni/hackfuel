import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Coins } from 'lucide-react'
import { formatEther, type Hex } from 'viem'
import { useAuthStore } from '@/stores/authStore'
import { publicClient } from '@/lib/smartAccount'

export function Header() {
  const { isAuthenticated, displayName, smartAccountAddress } = useAuthStore()
  const [balance, setBalance] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !smartAccountAddress) return

    const fetchBalance = () => {
      publicClient
        .getBalance({ address: smartAccountAddress as Hex })
        .then((bal) => setBalance(formatEther(bal)))
        .catch(() => {})
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated, smartAccountAddress])

  return (
    <header className="glass-strong fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-monad to-accent-green flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-monad-light to-accent-green bg-clip-text text-transparent">
            HackFuel
          </h1>
        </motion.div>

        {isAuthenticated && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="text-right">
              <p className="text-sm font-medium text-white/90">{displayName}</p>
              <div className="flex items-center justify-end gap-1.5">
                {balance !== null && (
                  <span className="flex items-center gap-0.5 text-[10px] text-accent-gold font-mono">
                    <Coins className="w-2.5 h-2.5" />
                    {parseFloat(balance).toFixed(3)}
                  </span>
                )}
                <p className="text-[10px] text-white/40 font-mono">
                  {smartAccountAddress?.slice(0, 6)}...{smartAccountAddress?.slice(-4)}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-monad to-monad-dark flex items-center justify-center text-sm font-bold">
              {displayName?.charAt(0).toUpperCase()}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
