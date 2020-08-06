
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

export const hash = (pubKey: crypto.PublicKey): Promise<Buffer> => {
  return pubKey.hash()
}

export const id = async (pubKey: crypto.PublicKey): Promise<string> => {
  const h = await hash(pubKey)
  return multibase.encode('base58btc', h).toString().slice(1)
}

/**
 * Get the 7-digit short ID (with prefix) of the public key
 */
export const shortId = async (pubKey: crypto.PublicKey): Promise<string> => {
  const i = await id(pubKey)
  return i.slice(0, 2) + '...' + i.slice(-7)
}

export type PublicKey = crypto.PublicKey
