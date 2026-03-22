import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from '@/lib/wagmi'
import { AppShell } from '@/components/layout/AppShell'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PasskeyRegister } from '@/components/auth/PasskeyRegister'
import { SwipeContainer } from '@/components/cards/SwipeContainer'
import { MatchList } from '@/components/profile/MatchList'
import { VotingPage } from '@/components/voting/VotingPage'
import { ProfilePage } from '@/components/profile/ProfilePage'
import { RegisterProject } from '@/components/register/RegisterProject'
import { AskAI } from '@/components/ask/AskAI'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<PasskeyRegister />} />
            <Route
              element={
                <AuthGuard>
                  <AppShell />
                </AuthGuard>
              }
            >
              <Route index element={<SwipeContainer />} />
              <Route path="matches" element={<MatchList />} />
              <Route path="register" element={<RegisterProject />} />
              <Route path="ask" element={<AskAI />} />
              <Route path="vote" element={<VotingPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
