
import multibase from 'multibase'
import crypto from 'libp2p-crypto'
import { IdentityProvider } from '.'
import { wrapPrivateKey } from './utils'

import Libp2pLogo from './img/libp2p.png'

const ERR_UNKNOWN_ENCODING = new TypeError('unknown encoding')

/**
 * Use raw libp2p private keys (as hex/multibase string)
 */
export const KeyStringIdentityProvider: IdentityProvider<'encoding' | 'key'> = {
  type: 'libp2p-key',
  displayName: 'Import libp2p Private Key',
  summary: 'Never disclose your private keys.',
  logo: Libp2pLogo,

  inputs: {
    encoding: {
      description: 'Encoding',
      type: 'select',
      options: ['multibase', 'hex string'],
      default: 'multibase',
    },
    key: {
      description: 'Private Key',
      type: 'text',
      placeholder: 'Paste your private key string here',
      required: true,
    },
  },

  async requestIdentities (inputs) {
    let keyBuf: Buffer

    switch (inputs.encoding) {
      case 'multibase':
        keyBuf = Buffer.from(multibase.decode(inputs.key))
        break
      case 'hex string':
        keyBuf = Buffer.from(inputs.key, 'hex')
        break
      default:
        throw ERR_UNKNOWN_ENCODING
    }

    const key = await crypto.keys.unmarshalPrivateKey(keyBuf)
    const identity = wrapPrivateKey(key)

    return [identity]
  },
}

export default KeyStringIdentityProvider
