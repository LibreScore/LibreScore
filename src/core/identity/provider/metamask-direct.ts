
import crypto from 'libp2p-crypto'
import sha from 'multihashing-async/src/sha'
import secp256k1 from 'secp256k1'

import { Identity } from '..'
import { IdentityProvider } from '.'
import { ethereum, metamaskAvailable } from './metamask'

import MetaMaskLogo from './img/metamask-fox.svg'

/**
 * Convert signature format of the `eth_sign` RPC method (65 bytes) to DER format (72 bytes)
 * @see https://github.com/ethereumjs/ethereumjs-util/blob/master/src/signature.ts#L67-L90
 * @see https://github.com/ethereumjs/ethereumjs-util/blob/master/src/signature.ts#L13-L31
 */
const _exportSig = (sig: Uint8Array) => {
  // the actual signature `(r, s)`
  const signature = sig.slice(0, 64)
  const recid = sig[64] - 27
  return {
    signature,
    recid,
    der: secp256k1.signatureExport(signature),
  }
}

const _recoverPublicKey = (signature: Uint8Array, recid: number, message: Uint8Array): crypto.PublicKey => {
  const pubKey = Buffer.from(secp256k1.ecdsaRecover(signature, recid, message, true))
  return crypto.keys.supportedKeys.secp256k1.unmarshalSecp256k1PublicKey(pubKey)
}

/**
 * @param account ethereum address
 */
const _buildEthereumIdentity = (account: string): Identity => {
  const _getSig = async (msgHash: Uint8Array) => {
    // `msgHash` must be 32 bytes
    // https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/secp256k1/index.d.ts#L118
    const sigHex: string = await ethereum().request({
      method: 'eth_sign',
      params: [account, msgHash],
    })
    const sig = Buffer.from(sigHex.slice(2) /** remove the `0x` prefix */, 'hex')
    return _exportSig(sig)
  }

  let publicKey: crypto.PublicKey | undefined

  const identity: Identity = {
    async publicKey () {
      if (publicKey) {
        return publicKey
      }

      // sign a pre-defined message, and derive the public key from the signature and the message hash
      const msg = new Uint8Array(32)
      const { signature, recid } = await _getSig(msg)
      return _recoverPublicKey(signature, recid, msg)
    },

    async sign (data) {
      // the hash of `data`
      // https://github.com/libp2p/js-libp2p-crypto/blob/master/src/keys/secp256k1.js#L19
      const msgHash: Uint8Array = await sha.digest(data, 'sha2-256')
      const { der, signature, recid } = await _getSig(msgHash)
      publicKey = _recoverPublicKey(signature, recid, msgHash)
      return Buffer.from(der)
    },
  }

  return identity
}

/**
 * Make use of the key pair of the account in the Ethereum (MetaMask) wallet directly
 */
export const MetamaskDirectIdentityProvider: IdentityProvider = {
  type: 'metamask-direct',
  displayName: 'MetaMask (direct)',
  logo: MetaMaskLogo,

  available: metamaskAvailable,

  inputs: {},

  async requestIdentities () {
    const accounts = await ethereum().request({ method: 'eth_requestAccounts' })
    return [_buildEthereumIdentity(accounts[0])]
  },

}

export default MetamaskDirectIdentityProvider
