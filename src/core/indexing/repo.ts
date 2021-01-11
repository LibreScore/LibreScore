
import type CID from 'cids'
import type { IPFS } from 'ipfs'
import type { IndexingInfo } from './'
import type { LocalIndex } from './local-index'

export type LastKey = string | Set<string> | null
export type EntriesIterator = AsyncIterable<{ entries: IndexingInfo[]; lastKey: LastKey }>

/**
 * The general definition of various types of remote `repositories`
 */
export abstract class Repo {
  constructor (protected _localIndex: LocalIndex) { }

  abstract readonly type: string;

  /**
   * repo address
   */
  abstract addr: IndexingInfo['_repo'];

  protected async _getLastKey (): Promise<LastKey> {
    const result = await this._localIndex.repos.get(this.addr)
    return result ? result.lastKey : null
  }

  protected async _saveLastKey (lastKey: LastKey): Promise<void> {
    await this._localIndex.repos
      // the difference between `.add` and `.put` is that `.add` will fail if an obj with the same primary key already exist
      .put({
        _repo: this.addr,
        lastKey,
      })
  }

  protected abstract _getIterator (lastKey: LastKey): EntriesIterator;

  /**
   * @returns An AsyncGenerator that yields the list of ids added to the local index
   */
  async * iterate (): AsyncGenerator<string[], void> {
    let lastKey: LastKey = await this._getLastKey()
    const it = this._getIterator(lastKey)

    try {
      for await (const { entries, lastKey: lk } of it) {
        const idList = await this._localIndex.db.bulkPut(entries, { allKeys: true })
        lastKey = lk // update `lastKey` after success
        yield idList
      }
    } finally { // save `lastKey` regardless of whether an exception was thrown
      await this._saveLastKey(lastKey)
    }
  }

  /**
   * @returns The list of ids of entries added to the local index
   */
  async collect (): Promise<string[]> {
    const idList = [] as string[]
    for await (const l of this.iterate()) {
      idList.push(...l)
    }
    return idList
  }

  /**
   * Expose the `type` property to the class constructor
   * @see Repo#type
   */
  static get type (): string {
    return this.prototype.type
  }
}

export class RepoDagKV extends Repo {
  readonly type = 'dag-kv';

  get addr (): string {
    return `/${this.type}/ipfs/${this._cid.toString()}`
  }

  constructor (protected _cid: CID, protected _ipfs: IPFS, _localIndex: LocalIndex) {
    super(_localIndex)
  }

  protected async * _getIterator (keySet: Set<string> | null, mapCid = this._cid.toString()): EntriesIterator {
    if (!keySet) keySet = new Set<string>()

    // skip if the KVMap which the cid references to was already added
    if (keySet.has(mapCid)) {
      return
    }

    // fetch this KVMap from IPFS
    const res = await this._ipfs.dag.get(mapCid)
    const m = res.value as KVMap

    const entries: IndexingInfo[] = Object.keys(m).map((_id) => {
      // reconstruct IndexingInfo
      return {
        ...m[_id],
        _repo: this.addr,
        _id,
      }
    })

    yield {
      entries,
      lastKey: keySet.add(mapCid), // by ref
    }
  }
}

export interface KVMap {
  [_id: string]: Omit<IndexingInfo, '_repo' | '_id'>;
}

export class RepoDagKVSharded extends RepoDagKV {
  // @ts-expect-error This overrides `RepoDagKV`'s `type`
  readonly type = 'dag-kv-sharded';

  protected async * _getIterator (keySet: Set<string> | null): EntriesIterator {
    if (!keySet) keySet = new Set<string>()

    // fetch this ShardedMap from IPFS
    const res = await this._ipfs.dag.get(this._cid)
    const shardedMap = res.value as ShardedMap

    // iterate over KVMaps the ShardedMap contains
    for (const mapCid of Object.values(shardedMap)) {
      // eslint-disable-next-line yield-star-spacing
      yield* super._getIterator(keySet /* by ref */, mapCid.toString())
    }
  }
}

export interface ShardedMap {
  [x: string]: CID | string; // cid to a KVMap
}

const REPO_TYPES_ENUM = [
  RepoDagKV,
  RepoDagKVSharded,
]

type RepoTypesRegistry = {
  [K in (typeof REPO_TYPES_ENUM[number]) as `${K['prototype']['type']}`]: K
}

export const REPO_TYPES_REGISTRY = Object.fromEntries(
  REPO_TYPES_ENUM.map(t => [t.prototype.type/* type */, t/** constructor */]),
) as RepoTypesRegistry
