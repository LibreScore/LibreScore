
import catAPI from 'ipfs-http-client/src/cat'
import dagAPI from 'ipfs-http-client/src/dag'
import blockAPI from 'ipfs-http-client/src/block'
import type { ClientOptions } from 'ipfs-http-client/src/lib/core'

// reduce bundle size
const ipfsClientLite = (options: ClientOptions) => {
  return {
    // only these APIs are actually used
    cat: catAPI(options),
    dag: dagAPI(options),
    block: blockAPI(options),
  }
}

export type IPFSLite = ReturnType<typeof ipfsClientLite>

export const IPFS_CLIENT_INFURA = ipfsClientLite({ url: 'https://ipfs.infura.io:5001/' })
export const IPFS_CLIENT_IPFS_IO = ipfsClientLite({ url: 'https://ipfs.io/', method: 'GET' })

export const ipfsInstance = Object.assign({}, IPFS_CLIENT_INFURA, {
  // replace `dag.get` (using `dag.resolve` internally) with the implementation from ipfs.io,
  // since ipfs.infura.io does not support IPNS
  dag: Object.assign({}, IPFS_CLIENT_INFURA.dag, {
    resolve: IPFS_CLIENT_IPFS_IO.dag.resolve,
    get: IPFS_CLIENT_IPFS_IO.dag.get,
  }),
  // replace all read-only methods with the implementations from ipfs.io
  cat: IPFS_CLIENT_IPFS_IO.cat,
  block: Object.assign({}, IPFS_CLIENT_INFURA.block, {
    get: IPFS_CLIENT_IPFS_IO.block.get,
  }),
})
