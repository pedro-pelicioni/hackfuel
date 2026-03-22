import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Heart, Vote, User, PlusCircle, MessageCircle } from 'lucide-react'

const navItems = [
  { path: '/', icon: Compass, label: 'Discover' },
  { path: '/matches', icon: Heart, label: 'Matches' },
  { path: '/register', icon: PlusCircle, label: 'Register' },
  { path: '/ask', icon: MessageCircle, label: 'Ask AI' },
  { path: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="glass-strong fixed bottom-0 left-0 right-0 z-50 px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center gap-1 py-1 px-4"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-monad"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-monad-light' : 'text-white/40'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-monad-light' : 'text-white/40'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
