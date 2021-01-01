/* eslint-disable generator-star-spacing */

import type IPFS from 'ipfs'
import CID from 'cids'
import * as PublicKey from './pubkey'

export interface UserProfile extends CustomProfile {
  // generic profile

  /** public key id (hash digest) */
  shortId: string;
}

interface CustomProfile {
  // personalized profile

  /** 
   * CID to the avatar image
   */
  avatar?: CID;

  name?: string;

  url?: string;
}

export const FALLBACK_AVATAR = '/img/icons/logo.svg'

/**
 * Resolve user profile
 */
export const resolveUserProfile = async function* (pubKey: PublicKey.PubKeyType, ipfs: IPFS): AsyncGenerator<UserProfile> {
  pubKey = PublicKey.normalizeKey(pubKey)

  const shortId = await PublicKey.shortId(pubKey)

  // the generic profile
  yield {
    shortId,
  }

  // resolve the custom profile from IPFS

  const ref = await PublicKey.ipnsAddr(pubKey)
  // resolve CID by IPNS ref
  // const { cid } = await ipfs.dag.resolve(ref) // no need, as `dag.get` is implemented using `dag.resolve` and `block.get`
  const result = await ipfs.dag.get(ref)
  const obj = result.value as CustomProfile

  yield {
    shortId,
    avatar: obj.avatar,
    name: obj.name,
    url: obj.url,
  }
}
