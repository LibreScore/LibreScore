/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import CID from 'cids'
import dagCBOR from 'ipld-dag-cbor'
import { FunctionKeys } from 'utility-types'
import { Identity } from '@/identity'
import * as PublicKey from '@/identity/pubkey'

/**
 * See the [specification](/SPEC/scorepack.md) - User Signatures
 */
export interface Sig {
  publicKey: Buffer;
  signature: Buffer;
}

/**
 * See the [specification](/SPEC/scorepack.md) - The `Source` Object
 */
export interface Source {
  name?: string;
  description?: string;
  url?: string;
  id?: number;
  user?: number | string;
}

/** raw IPFS block data */
type RawNode = Buffer

export const FMT_NAME = 'scorepack' as const
export const FMT_VER = 1 as const

export const ERR_SCOREPACK_INVALID = new TypeError('The ScorePack is invalid')
export const ERR_MISSING_TITLE = new TypeError('title is missing')
export const ERR_MISSING_SCORE_CID = new TypeError('score CID is missing')
export const ERR_NO_SIGNATURE = new Error('No signature in the scorepack')
export const ERR_PREV_SCORE_INVALID = new TypeError('CID of `_prev` is invalid')

/**
 * The *ScorePack* format is LibreScore's main data structure to store score metadata and CID reference to its mscz file on IPFS
 * 
 * @example
 * 
 */
export class ScorePack {
  /**
   * See the [specification](/SPEC/scorepack.md) - Format Description
   */
  _fmt = FMT_NAME;
  _ver = FMT_VER;

  _sig?: Sig | null = null;

  _prev?: CID | string;

  score: CID;
  thumbnail?: CID;

  title: string;
  description?: string;
  summary?: string;

  copyright?: string;
  tags?: string[];

  source?: Source[];

  /** ISO8601 datetime string */
  created?: string;
  /** ISO8601 datetime string */
  updated: string;

  constructor (info: PackInfo) {
    // assign pack metadata to the ScorePack instance
    Object.assign(this, info)

    if (!this.title || typeof this.title !== 'string') {
      throw ERR_MISSING_TITLE
    }
    if (!this.score || !CID.isCID(this.score)) {
      throw ERR_MISSING_SCORE_CID
    }

    // expect `updated` and `created` to be ISO8601 strings
    // trigger error if the date string is invalid
    this.updated = new Date(this.updated).toISOString()
    if (this.created) {
      this.created = new Date(this.created).toISOString()
    }

    let prev = this._prev
    if (prev) {
      // expect `_prev` to be a valid CID or its string representation
      if (!CID.isCID(prev)) {
        prev = new CID(prev)
      }
      // the previous ScorePack revision must also be in DAG-CBOR
      if (prev.codec !== 'dag-cbor') {
        throw ERR_PREV_SCORE_INVALID
      }
      // prefer to use the string representation which is encoded in base58-btc
      this._prev = prev.toBaseEncodedString('base58btc')
    }
  }

  /**
   * Clone the ScorePack class instance
   */
  clone (): ScorePack {
    // depth = 1
    // https://stackoverflow.com/a/44782052
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }

  /**
   * Serialize the *ScorePack* in DAG-CBOR
   * @returns IPFS raw block data
   */
  private marshal (): RawNode {
    // Remove all `undefined` values in the ScorePack object (may cause errors)
    Object.getOwnPropertyNames(this).forEach(k => {
      if (this[k] === undefined) {
        delete this[k]
      }
    })

    // Serialize
    // Must ignore method keys
    const rawNode: Buffer = dagCBOR.util.serialize(this)
    return rawNode
  }

  /**
   * Sign / Re-sign the *ScorePack* with the user identity provided
   */
  async sign (identity: Identity): Promise<Sig> {
    // sign with `_sig` set to `null`
    this._sig = null

    const rawNode = this.marshal()
    const sigBuf = await identity.sign(rawNode)

    const pubKey: PublicKey.PublicKey = await identity.publicKey()
    const sig: Sig = {
      publicKey: PublicKey.marshal(pubKey),
      signature: sigBuf,
    }
    this._sig = sig

    return sig
  }

  /**
   * Verify the integrity of the *ScorePack*  
   * (the signature matches)
   */
  async verify (): Promise<boolean> {
    if (!this._sig || !this._sig.publicKey || !this._sig.signature) {
      throw ERR_NO_SIGNATURE
    }

    const { publicKey, signature } = this._sig
    const pubKey = PublicKey.unmarshal(publicKey)

    // verify with `_sig` set to null
    const clone = this.clone()
    clone._sig = null
    const dagNode = clone.marshal()
    return pubKey.verify(dagNode, signature)
  }

  /**
   * Sign and serialize the *ScorePack*
   */
  async flush (identity: Identity): Promise<RawNode> {
    await this.sign(identity)
    const rawNode = this.marshal()
    return rawNode
  }

  /**
   * Deserialize *ScorePack* from the raw node using DAG-CBOR
   */
  static unmarshal (rawNode: RawNode): ScorePack {
    const obj: Omit<ScorePack, FunctionKeys<ScorePack>> = dagCBOR.util.deserialize(rawNode)

    // check the fmt name info
    if (obj._fmt !== FMT_NAME) {
      throw ERR_SCOREPACK_INVALID
    }

    if (obj._ver !== FMT_VER) {
      throw ERR_SCOREPACK_INVALID
      /**
       * @todo
       * convert to current version
       */
    }

    // check other info in the class constructor
    return new ScorePack(obj)
  }

  /**
   * @alias `ScorePack.unmarshal`
   */
  static from (rawNode: RawNode): ScorePack {
    return ScorePack.unmarshal(rawNode)
  }
}

export type PackInfo = Omit<ScorePack, FunctionKeys<ScorePack> | '_fmt' | '_ver'>

export default ScorePack
