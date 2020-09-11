
import { IdentityProvider } from '.'
import { generateMessageForEntropy, generateIdentityFromSeed } from './utils'

import MetaMaskLogo from './img/metamask-fox.svg'

/**
 * Get the MetaMask API
 */
export const ethereum = (): any => {
  return window['ethereum']
}

/**
 * Check the availability of the MetaMask API (or any Ethereum compatible API)
 */
export const metamaskAvailable = (): boolean => {
  // https://docs.metamask.io/guide/getting-started.html#web3-browser-detection
  return typeof ethereum() !== 'undefined'
}

/**
 * Derive an `Identity` (ed25519 key pair) from the signature signed by the Ethereum (MetaMask) account
 */
export const MetamaskIdentityProvider: IdentityProvider<'version'> = {
  type: 'metamask',
  displayName: 'MetaMask',
  logo: MetaMaskLogo,

  available: metamaskAvailable,

  inputs: {
    version: {
      description: 'Auth Provider Version',
      type: 'select',
      options: ['0'],
      default: '0',
      disabled: true,
    },
  },

  async requestIdentities () {
    // access an ethereum account from MetaMask
    const accounts = await ethereum().request({ method: 'eth_requestAccounts' })
    const account = accounts[0]

    // sign the authentication message
    const msg = generateMessageForEntropy(account)
    const sigHex: string = await ethereum().request({
      method: 'personal_sign',
      params: [account, msg],
    })
    const sig = Buffer.from(sigHex.slice(2) /** remove the `0x` prefix */, 'hex')

    const identity = await generateIdentityFromSeed(sig)
    return [identity]
  },

}

export default MetamaskIdentityProvider
