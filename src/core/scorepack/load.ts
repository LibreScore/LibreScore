
import type CID from 'cids'
import type { IPFS } from 'ipfs'
import { ScorePack } from '@/core/scorepack'

/**
 * Load ScorePack from CID
 */
export const fromCid = async (cid: CID | string, ipfs: IPFS): Promise<ScorePack> => {
  const block = await ipfs.block.get(cid)
  return ScorePack.from(Buffer.from(block.data))
}
