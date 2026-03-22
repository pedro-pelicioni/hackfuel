export interface AuthState {
  isAuthenticated: boolean
  displayName: string | null
  credentialId: string | null
  publicKeyX: string | null
  publicKeyY: string | null
  smartAccountAddress: string | null
}
