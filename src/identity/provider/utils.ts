
import crypto from 'libp2p-crypto'
import sha from 'multihashing-async/src/sha'
import { Identity } from '../'

const ed25519 = crypto.keys.supportedKeys.ed25519

/**
 * Convert the `PrivateKey` to an `Identity`
 */
export const wrapPrivateKey = (key: crypto.PrivateKey): Identity => {
  const identity: Identity = {
    async publicKey () { // eslint-disable-line @typescript-eslint/require-await
      return key.public
    },
    async sign (data) {
      const buf = await key.sign(data)
      return Buffer.from(buf)
    },
  }
  return identity
}

/**
 * Generate an ed25519 identity from the seed message
 */
export const generateIdentityFromSeed = async (seedMsg: Buffer): Promise<Identity> => {
  // we hash the msg to generate the 32-byte seed
  const seed: Uint8Array = await sha.digest(seedMsg, 'sha2-256')

  const key = await ed25519.generateKeyPairFromSeed(Buffer.from(seed))
  return wrapPrivateKey(key)
}

/**
 * @returns The environment variable `VUE_APP_ID` (its value can only be a suffix of the current origin's domain)  
 *       or `location.hostname` (the domain name of the current website)
 */
export const getAppIdForAuth = (): string => {
  return process?.env?.VUE_APP_ID || location.hostname
}

/**
 * @returns The environment variable `VUE_APP_NAME`
 */
export const getAppNameForAuth = (): string => {
  return process?.env?.VUE_APP_NAME || getAppIdForAuth()
}

/**
 * Generate the authentication message to sign  
 * reference: https://github.com/textileio/js-examples/blob/master/metamask-identities-ed25519/src/App.tsx#L28
 */
export const generateMessageForEntropy = (address: string, appId: string = getAppIdForAuth(), appName: string = getAppNameForAuth()): string => {
  return (
    '******************************************************************************** \n' +
    'READ THIS MESSAGE CAREFULLY. \n' +
    'DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND WRITE \n' +
    'ACCESS TO THIS APPLICATION. \n' +
    'DO NOT SIGN THIS MESSAGE IF THE FOLLOWING IS NOT TRUE OR YOU DO NOT CONSENT \n' +
    'TO THE CURRENT APPLICATION HAVING ACCESS TO THE FOLLOWING APPLICATION. \n' +
    '******************************************************************************** \n' +
    'The Ethereum address used by this application is: \n' +
    '\n' +
    address +
    '\n' +
    '\n' +
    '\n' +
    'By signing this message, you authorize the current application to use the \n' +
    'following app associated with the above address: \n' +
    '\n' +
    `${appName} (${appId})` +
    '\n' +
    '\n' +
    '\n' +
    '******************************************************************************** \n' +
    'ONLY SIGN THIS MESSAGE IF YOU CONSENT TO THE CURRENT PAGE ACCESSING THE KEYS \n' +
    'ASSOCIATED WITH THE ABOVE ADDRESS AND APPLICATION. \n' +
    'AGAIN, DO NOT SHARE THIS SIGNED MESSAGE WITH ANYONE OR THEY WILL HAVE READ AND \n' +
    'WRITE ACCESS TO THIS APPLICATION. \n' +
    '******************************************************************************** \n'
  )
}
