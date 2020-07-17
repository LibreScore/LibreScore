/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import CID from 'cids'
import dagCBOR from 'ipld-dag-cbor'
import crypto from 'libp2p-crypto'
import { FunctionKeys } from 'utility-types'

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
interface Source {
  name?: string;
  description?: string;
  url?: string;
  id?: number;
  user?: number | string;
}

type DagNode = Buffer

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
  _fmt = 'scorepack' as const;
  _ver = 1 as const;

  _sig: Sig | null = null;

  _prev?: CID | string;

  score: CID;

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
        throw new Error('CID of `_prev` is invalid.')
      }
      // prefer to use the string representation which is encoded in base58-btc
      this._prev = prev.toBaseEncodedString('base58-btc')
    }
  }

  /**
   * Serialize the *ScorePack* in DAG-CBOR
   * @returns DAG-CBOR Node
   */
  marshal (): DagNode {
    // Remove all `undefined` values in the ScorePack object (may cause errors)
    Object.getOwnPropertyNames(this).forEach(k => {
      if (this[k] === undefined) {
        delete this[k]
      }
    })

    // Serialize
    // Must ignore method keys
    const dagNode: Buffer = dagCBOR.util.serialize(this)
    return dagNode
  }

  async sign (identity): Promise<Sig> {
    // sign with `_sig` set to `null`
    this._sig = null

    const dagNode = this.marshal()
    const sigBuf = await identity.sign(dagNode)

    const pubKey: crypto.PublicKey = await identity.publicKey()
    const sig = {
      publicKey: crypto.keys.marshalPublicKey(pubKey),
      signature: sigBuf,
    }
    this._sig = sig

    return sig
  }

  async verify (): Promise<boolean> {

  }

  /**
   * Deserialize *ScorePack* from the DAG-CBOR node
   */
  static unmarshal (dagNode: DagNode): ScorePack {

  }
}

export type PackInfo = Omit<ScorePack, FunctionKeys<ScorePack> | '_fmt' | '_ver' | '_sig'>

export default ScorePack
