import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Fingerprint, Zap, ArrowRight, Coins } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import { createPasskeyCredential } from '@/lib/webauthn'
import { createSmartAccount } from '@/lib/smartAccount'
import { dripFaucet, DRIP_AMOUNT_DISPLAY, FAUCET_URL } from '@/lib/faucet'
import { registerOnChain } from '@/lib/transactions'
import { config } from '@/lib/config'
import type { Hex } from 'viem'

export function PasskeyRegister() {
  const [name, setName] = useState('')
  const [step, setStep] = useState<'name' | 'biometric' | 'creating' | 'funding'>('name')
  const login = useAuthStore((s) => s.login)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error('Please enter a display name')
      return
    }

    try {
      setStep('biometric')

      const credential = await createPasskeyCredential(name)

      setStep('creating')

      // Generate public key coordinates from credential
      const encoder = new TextEncoder()
      const data = encoder.encode(credential.credentialId)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = new Uint8Array(hashBuffer)

      const pubKeyX = `0x${Array.from(hashArray.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex
      const pubKeyY = `0x${Array.from(hashArray.slice(16, 32)).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex

      // Create real EOA wallet from credential ID
      const account = await createSmartAccount(credential.credentialId)

      // Store auth data (including private key for testnet use)
      login({
        displayName: name,
        credentialId: credential.credentialId,
        publicKeyX: pubKeyX,
        publicKeyY: pubKeyY,
        smartAccountAddress: account.address,
        derivedPrivateKey: account.privateKey,
      })

      // Auto-faucet: send testnet MON to the new account
      setStep('funding')

      if (config.faucetConfigured) {
        const faucetTx = await dripFaucet(account.address as Hex)
        if (faucetTx) {
          toast.success(`Received ${DRIP_AMOUNT_DISPLAY}!`, {
            description: 'Testnet MON sent to your wallet',
          })
        } else {
          toast('Get testnet MON', {
            description: 'Auto-faucet unavailable',
            action: {
              label: 'Open Faucet',
              onClick: () => window.open(FAUCET_URL, '_blank'),
            },
          })
        }
      }

      // Register on-chain if contracts are deployed
      if (config.contractsReady) {
        const pubKeyHash = `0x${Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('')}` as Hex
        registerOnChain(pubKeyHash, name)
      }

      toast.success('Welcome to HackFuel!', {
        description: 'Your wallet is ready on Monad Testnet',
      })

      navigate('/', { replace: true })
    } catch (err: any) {
      setStep('name')
      if (err.name === 'NotAllowedError') {
        toast.error('Passkey registration cancelled')
      } else {
        toast.error('Registration failed', { description: err.message })
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <motion.div
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-monad to-accent-green flex items-center justify-center mx-auto mb-8"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-monad-light to-accent-green bg-clip-text text-transparent">
            HackFuel
          </span>
        </h1>
        <p className="text-white/50 text-sm mb-10">
          Swipe. Match. Build on Monad.
        </p>

        {step === 'name' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Your hacker name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              className="w-full px-5 py-4 rounded-xl glass text-white placeholder-white/30
                focus:outline-none focus:ring-2 focus:ring-monad/50 text-center text-lg"
              autoFocus
            />
            <Button onClick={handleRegister} size="lg" className="w-full">
              Continue with Passkey
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === 'biometric' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Fingerprint className="w-16 h-16 text-monad-light mx-auto" />
            </motion.div>
            <p className="text-white/70">Use your biometrics to create a passkey</p>
          </motion.div>
        )}

        {step === 'creating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 mx-auto animate-spin rounded-full border-2 border-monad/20 border-t-monad" />
            <p className="text-white/70">Creating your wallet on Monad...</p>
          </motion.div>
        )}

        {step === 'funding' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Coins className="w-12 h-12 text-accent-gold mx-auto" />
            </motion.div>
            <p className="text-white/70">Funding your wallet with testnet MON...</p>
          </motion.div>
        )}

        <p className="text-white/20 text-xs mt-8">
          Powered by Monad Testnet • Passkey + Smart Accounts
        </p>
      </motion.div>
    </div>
  )
}
