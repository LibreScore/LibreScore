
import Dexie from 'dexie'
import { IndexingInfo } from './index'

export type SORTING =
  | 'latest'

/**
 * It's difficult to collectively index entries from multiple remote `repositories`,  
 * so creating a local cache index is essential.  
 * 
 * This also enables offline score indexing.
 */
export class LocalIndex extends Dexie {
  db: Dexie.Table<IndexingInfo, string>;

  constructor () {
    super('indexing')

    // define indexes
    this.version(1).stores({
      // https://dexie.org/docs/Version/Version.stores()#detailed-schema-syntax
      db: '[_repo+_id], _uploader, title, duration, npages, nparts, *instruments, updated, created',
      // `scorepack` and `thumbnail` properties are not indexed but stored
    })

    // The following lines are needed for it to work across typescipt using babel-preset-typescript:
    this.db = this.table('db')
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

export const localIndex = new LocalIndex()
