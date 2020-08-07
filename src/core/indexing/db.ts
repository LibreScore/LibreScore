
import { Database } from '@textile/threads-database'
import { IndexingInfo } from './index'

const DB = new Database('test')

/**
 * demo only
 */
export const COLLECTION = (async function getOrCreateCollection (db: Database) {
  const name = 'IndexingInfo'
  const { collections } = db
  const existing = collections.get(name)
  if (existing) {
    return existing
  } else {
    return await db.newCollectionFromObject(name, {
      _id: '',
      scorepack: '',
      thumbnail: '',
      title: '',
      duration: 0,
      npages: 0,
      updated: 0,
      created: 0,
    } as IndexingInfo & { _id: string })
  }
})(DB)
