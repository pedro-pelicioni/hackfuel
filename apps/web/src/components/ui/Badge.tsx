interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'monad'
  className?: string
}

const badgeVariants = {
  default: 'bg-white/10 text-white/80',
  success: 'bg-accent-green/15 text-accent-green',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-accent-red/15 text-accent-red',
  monad: 'bg-monad/15 text-monad-light',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${badgeVariants[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}
