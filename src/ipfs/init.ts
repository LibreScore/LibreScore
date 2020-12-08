
import ipfsClient from 'ipfs-http-client'

export const IPFS_CLIENT_INFURA = ipfsClient({ url: 'https://ipfs.infura.io:5001/' })
export const IPFS_CLIENT_IPFS_IO = ipfsClient({ url: 'https://ipfs.io/' })
