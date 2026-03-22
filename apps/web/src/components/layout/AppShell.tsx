import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { Toaster } from 'sonner'

export function AppShell() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg-primary">
      <Header />
      <main className="flex-1 pt-16 pb-20 overflow-y-auto">
        <div className="max-w-lg mx-auto h-full px-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(26, 17, 40, 0.9)',
            border: '1px solid rgba(131, 110, 249, 0.25)',
            color: '#fff',
            backdropFilter: 'blur(20px)',
          },
        }}
      />
    </div>
  )
}
