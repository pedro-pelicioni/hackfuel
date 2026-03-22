import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const RP_NAME = 'HackFuel'
const RP_ID = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

function bufferToHex(buffer: ArrayBuffer): string {
  return '0x' + Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateChallenge(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function createPasskeyCredential(username: string) {
  const challenge = generateChallenge()

  const registration = await startRegistration({
    optionsJSON: {
      rp: { name: RP_NAME, id: RP_ID },
      user: {
        id: generateChallenge(),
        name: username,
        displayName: username,
      },
      challenge,
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'required',
      },
      timeout: 60000,
    },
  })

  return {
    credentialId: registration.id,
    rawId: registration.rawId,
    response: registration.response,
  }
}

export async function authenticateWithPasskey(credentialId?: string) {
  const challenge = generateChallenge()

  const authentication = await startAuthentication({
    optionsJSON: {
      challenge,
      rpId: RP_ID,
      allowCredentials: credentialId
        ? [{ id: credentialId, type: 'public-key' }]
        : [],
      userVerification: 'required',
      timeout: 60000,
    },
  })

  return {
    credentialId: authentication.id,
    signature: authentication.response.signature,
    authenticatorData: authentication.response.authenticatorData,
    clientDataJSON: authentication.response.clientDataJSON,
  }
}
