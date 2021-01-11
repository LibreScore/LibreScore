
import Dexie from 'dexie'
import { idbReady } from '@/utils/idb-polyfill' // IndexedDB shim for Firefox private mode
import { IndexingInfo } from './index'

export type SORTING =
  | 'latest'

/**
 * It's difficult to collectively index entries from multiple remote `repositories`,  
 * so creating a local cache index is essential.  
 * 
 * This also enables offline score indexing.
 */
export class LocalIndex {
  db: Dexie.Table<IndexingInfo, string>;

  constructor () {
    const dexie = new Dexie('indexing', {
      indexedDB, // refresh its value
      IDBKeyRange,
    })

    // define indexes
    dexie.version(1).stores({
      // https://dexie.org/docs/Version/Version.stores()#detailed-schema-syntax
      db: '[_repo+_id], _uploader, title, duration, npages, nparts, *instruments, updated, created',
      // `scorepack` and `thumbnail` properties are not indexed but stored
    })

    this.db = dexie.table('db')
  }

  private async * _iterator<T, Key> (query: Dexie.Collection<T, Key>, pageSize: number) {
    for (let pageNo = 0; ; pageNo++) {
      const results = await query.clone()
        .offset(pageNo * pageSize)
        .limit(pageSize)
        .toArray()
      yield results

      if (results.length === 0) {
        break
      }
    }
  }

  private _getQuery (sort: SORTING) {
    switch (sort) {
      case 'latest': {
        const now = Date.now() / 1000 // the current Unix timestamp, to filter out entries with a future date

        // A query will be executed when calling Promise methods
        const query = this.db
          .where('updated').below(now) // implies ORDER BY `updated`
          .reverse() // DESC

        return query
      }

      default:
        throw new Error('unknown sorting')
    }
  }

  iterate (sort: SORTING, pageSize = 20): AsyncGenerator<IndexingInfo[], void> {
    return this._iterator(
      this._getQuery(sort),
      pageSize,
    )
  }
}

export const localIndex = idbReady.then(() => new LocalIndex())
