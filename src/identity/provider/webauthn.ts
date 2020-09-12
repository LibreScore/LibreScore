
import { randomBytes } from 'libp2p-crypto'
import { IdentityProvider } from './'
import { generateIdentityFromSeed, getAppIdForAuth, getAppNameForAuth } from './utils'

import WebAuthnLogo from './img/webauthn.svg'

const CHALLENGE = new Uint8Array(32)

const USER_VERIFICATION: UserVerificationRequirement = 'preferred'

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions/pubKeyCredParams
 */
const PUBKEY_CRED_PARAMS = [
  {
    type: 'public-key' as const,
    alg: -7, // ES256 (ECDSA w/ SHA-256)
  },
  {
    type: 'public-key' as const,
    alg: -257, // RS256 (RSASSA-PKCS1-v1_5 using SHA-256), also used by `libp2p-crypto`
  },
  {
    type: 'public-key' as const,
    alg: -37, // PS256 (RSASSA-PSS w/ SHA-256)
  },
  {
    type: 'public-key' as const,
    alg: -8, // EdDSA
  },
]

const getCredentialsContainer = (): CredentialsContainer => {
  return window.navigator.credentials
}

const requestCredential = (challenge: Uint8Array, timeout?: number): Promise<PublicKeyCredential> => {
  const options: CredentialRequestOptions = {
    publicKey: {
      challenge,
      rpId: getAppIdForAuth(),
      timeout,
      userVerification: USER_VERIFICATION,
    },
  }
  console.info(options)
  return getCredentialsContainer().get(options) as any
}

const createCredential = async (keyName: string, challenge: Uint8Array, requireResidentKey = true, timeout?: number): Promise<PublicKeyCredential> => {
  const appName = getAppNameForAuth()

  const options: CredentialCreationOptions = {
    publicKey: {
      authenticatorSelection: {
        requireResidentKey,
        userVerification: USER_VERIFICATION,
      },
      challenge,
      pubKeyCredParams: PUBKEY_CRED_PARAMS,
      rp: {
        id: getAppIdForAuth(),
        name: appName,
      },
      timeout,
      user: {
        id: randomBytes(32),
        name: keyName,
        displayName: `${appName} User`,
      },
    },
  }
  console.info(options)

  const cre = await getCredentialsContainer().create(options)
  // // Store operation not permitted for PublicKey credentials.
  // await getCredentialsContainer().store(cre)

  return cre as any
}

/**
 * Derive an ed25519 `Identity` from the credential stored in authenticators, using the WebAuthn API
 */
export const WebauthnIdentityProvider: IdentityProvider<'version' | 'keyname'> = {
  type: 'webauthn',
  displayName: 'WebAuthn',
  logo: WebAuthnLogo,

  /**
   * @see https://developers.yubico.com/WebAuthn/WebAuthn_Developer_Guide/Resident_Keys.html
   * @see https://auth0.com/blog/a-look-at-webauthn-resident-credentials/
   */
  summary: 'Require ResidentKey support (Chrome ≥ 76)',

  available () {
    if (!window?.PublicKeyCredential) {
      console.warn('WebAuthn not supported on this browser.')
      return false
    } else {
      return true
    }
  },

  inputs: {
    version: {
      description: 'Auth Provider Version',
      type: 'select',
      options: ['0'],
      default: '0',
      disabled: true,
    },
    keyname: {
      description: 'Credential Name (credential creation only)',
      type: 'text',
      placeholder: 'Locally distinguish different credentials',
    },
  },

  async requestIdentities () {
    const cred = await requestCredential(CHALLENGE)
    const res = cred.response as AuthenticatorAssertionResponse

    // use [`res.userHandle`](https://developer.mozilla.org/en-US/docs/Web/API/AuthenticatorAssertionResponse/userHandle) as the seed
    // so `user.id` must be randomly generated
    const seedMsg = Buffer.from(res.userHandle!)

    const identity = await generateIdentityFromSeed(seedMsg)
    return [identity]
  },

  async createIdentity (inputs) {
    await createCredential(inputs.keyname || 'user', CHALLENGE)
  },
}

export default WebauthnIdentityProvider
