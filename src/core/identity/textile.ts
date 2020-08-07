
/**
 * demo only
 */

import { Libp2pCryptoIdentity } from '@textile/threads-core'
import { Identity } from './index'
import crypto from 'libp2p-crypto'

/**
 * IMPORTANT!
 * this key is for demo only
 */
const IDENTITY_STR = 'bbaareygsnb5roam3l6h3waeq4ffvqmvs3xyluphl3fdmxxtoix2mrdenjrxgqjvab3c5io5twmajvynb3oqogvujfo4yhj4zqoqm22zkrxpes3tie2qa5rouhoz3gae24gq5xihdk2esxomdu6myhignnmvi3xsj'
export const textileId: Promise<Libp2pCryptoIdentity> = Libp2pCryptoIdentity.fromString(IDENTITY_STR)

export const IDENTITY: Identity = {
  async publicKey () {
    const { key } = await textileId
    const pubKey = key.public
    return pubKey as crypto.PublicKey
  },
  async sign (data: Buffer) {
    const { key } = await textileId
    const sig = await key.sign(data)
    return Buffer.from(sig)
  },
}
