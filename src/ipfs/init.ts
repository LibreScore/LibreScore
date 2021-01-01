
import ipfsClient from 'ipfs-http-client'

export const IPFS_CLIENT_INFURA = ipfsClient({ url: 'https://ipfs.infura.io:5001/' })
export const IPFS_CLIENT_IPFS_IO = ipfsClient({ url: 'https://ipfs.io/' })

export const ipfsInstance = Object.assign({}, IPFS_CLIENT_INFURA, {
  // replace `dag.get` (using `dag.resolve` internally) with the implementation from ipfs.io,
  // since ipfs.infura.io does not support IPNS
  dag: Object.assign({}, IPFS_CLIENT_INFURA.dag, {
    resolve: IPFS_CLIENT_IPFS_IO.dag.resolve,
    get: IPFS_CLIENT_IPFS_IO.dag.get,
  }),
})
