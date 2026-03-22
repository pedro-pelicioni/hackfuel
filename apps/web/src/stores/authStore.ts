import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  isAuthenticated: boolean
  displayName: string | null
  credentialId: string | null
  publicKeyX: string | null
  publicKeyY: string | null
  smartAccountAddress: string | null
  derivedPrivateKey: string | null

  login: (data: {
    displayName: string
    credentialId: string
    publicKeyX: string
    publicKeyY: string
    smartAccountAddress: string
    derivedPrivateKey: string
  }) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      displayName: null,
      credentialId: null,
      publicKeyX: null,
      publicKeyY: null,
      smartAccountAddress: null,
      derivedPrivateKey: null,

      login: (data) =>
        set({
          isAuthenticated: true,
          ...data,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          displayName: null,
          credentialId: null,
          publicKeyX: null,
          publicKeyY: null,
          smartAccountAddress: null,
          derivedPrivateKey: null,
        }),
    }),
    { name: 'hackmatch-auth' }
  )
)
