
import type CID from 'cids'
import type IPFS from 'ipfs'
import { IPFS_CLIENT_INFURA } from '@/ipfs'
import { ScorePack } from '@/core/scorepack'

/**
 * Load ScorePack from CID
 */
export const fromCid = async (cid: CID | string, ipfs: IPFS = IPFS_CLIENT_INFURA): Promise<ScorePack> => {
  const block = await ipfs.block.get(cid)
  return ScorePack.from(block.data)
}
