
import type IPFS from 'ipfs'
import ipfsClient from 'ipfs-http-client'

export const IPFS_CLIENT_INFURA: IPFS = ipfsClient('https://ipfs.infura.io:5001/')
export const IPFS_CLIENT_IPFS_IO: IPFS = ipfsClient('https://ipfs.io/')
