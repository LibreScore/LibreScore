
import crypto from 'libp2p-crypto'
import multibase from 'multibase'

/**
 * future-proof to support more key types 
 */
export const unmarshal = (buf: Buffer): crypto.PublicKey => {
  return crypto.keys.unmarshalPublicKey(buf)
}

export const marshal = (pubKey: crypto.PublicKey): Buffer => {
  return crypto.keys.marshalPublicKey(pubKey)
}

export const hex = (pubKey: crypto.PublicKey): string => {
  return Buffer.from(marshal(pubKey)).toString('hex')
}

const MAX_INLINE_KEY_LENGTH = 42
const KEY_PREFIX = Buffer.from([0x00, 0x24])

/**
 * @param enableInlining see https://github.com/libp2p/go-libp2p-core/blob/master/peer/peer.go#L23-L34
 */
export const id = async (pubKey: crypto.PublicKey, enableInlining = false): Promise<string> => {
  let h: Buffer
  if (enableInlining && pubKey.bytes.length <= MAX_INLINE_KEY_LENGTH) {
    // see https://github.com/libp2p/go-libp2p-core/blob/master/peer/peer.go#L228
    h = Buffer.concat([KEY_PREFIX, pubKey.bytes]) // `mh.ID` is simply no hashing 
  } else {
    h = await pubKey.hash()
  }
  return multibase.encode('base58btc', h).toString().slice(1)
}

export const ipnsAddr = async (pubKey: crypto.PublicKey): Promise<string> => {
  // IPNS name is simply the id of a public key
  return `/ipns/${await id(pubKey, true)}`
}

/**
 * Get the 7-digit short ID (with prefix) of the public key
 */
export const shortId = async (pubKey: crypto.PublicKey): Promise<string> => {
  const i = await id(pubKey)
  return i.slice(0, 2) + '...' + i.slice(-7)
}

export type PublicKey = crypto.PublicKey

export type PubKeyType = PublicKey | Buffer

export const normalizeKey = (pubKey: PubKeyType): PublicKey => {
  if (Buffer.isBuffer(pubKey)) {
    pubKey = unmarshal(pubKey)
  }
  return pubKey
}
