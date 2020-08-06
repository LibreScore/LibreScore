
import CID from 'cids'
import IPFS from 'ipfs'

/**
 * Retrieve file from the IPFS instance   
 * (DAG-PB + UnixFS IPFS objects only)
 */
export const ipfsFetch = async (cid: CID, ipfs: IPFS, options?: object): Promise<Uint8Array> => {
  const chunks: Buffer[] = []
  for await (const chunk of ipfs.cat(cid, options)) {
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}
