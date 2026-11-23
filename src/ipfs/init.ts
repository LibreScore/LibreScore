
/**
 * IPFS read layer.
 *
 * The public IPFS HTTP APIs (`ipfs.infura.io`, `ipfs.io/api/v0`) have been
 * decommissioned (HTTP 410). All reads now go through plain IPFS
 * gateways (`/ipfs/<cid>`, `/ipns/<name>`), which are still served by
 * public providers. Gateways are tried in order; a gateway that fails
 * (network error, 429, 5xx, or a representation it can't produce)
 * falls through to the next one.
 */

import type CID from 'cids'
import cbor from 'cbor'
const DEFAULT_GATEWAYS: readonly string[] = [
  'https://ipfs.io',
  'https://dweb.link',
]

let gateways: readonly string[] = DEFAULT_GATEWAYS

/**
 * Override the gateway list (e.g. to use a self-hosted gateway or to
 * replace a provider that has gone down). Falls back to the defaults.
 */
export function setGateways (gateways_: readonly string[]): void {
  gateways = gateways_
}
type CIDRef = CID | string

const ipfsPathOf = (ref: CIDRef): string => {
  const s = typeof ref === 'string' ? ref : ref.toString()
  return s.startsWith('/ipfs/') || s.startsWith('/ipns/') ? s : `/ipfs/${s}`
}

const gatewayFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  let lastError: unknown
  for (const gateway of gateways) {
    try {
      const res = await fetch(gateway + path, init)
      if (res.ok) return res
      if (res.status === 406 || res.status === 415 || res.status === 410 || res.status === 429 || res.status >= 500) {
        // this gateway can't serve it (wrong representation, throttled,
        // or a dead endpoint of its own) — try the next gateway
        lastError = new Error(`${gateway} ${res.status} ${path}`)
        continue
      }
      // 4xx (404 …) is a permanent condition for content-addressed data
      throw new Error(`${gateway} ${res.status} ${path}`)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError ?? new Error(`no gateways available for ${path}`)
}

const bufferToHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')

/**
 * The KV indexes and IPNS profiles of this app are IPLD DAGs. Gateways
 * can return them as raw IPLD via the `Accept` content negotiation
 * header (IPLD gateway spec); the representation depends on how the
 * DAG was stored, so try both common encodings.
 */
const DAG_CONTENT_TYPES = [
  {
    accept: 'application/vnd.ipld.dag-json',
    parse: (buf: ArrayBuffer) => JSON.parse(new TextDecoder().decode(buf)),
  },
  {
    accept: 'application/vnd.ipld.dag-cbor',
    // `cbor@6` sync decode takes a hex string by default
    parse: (buf: ArrayBuffer) => cbor.decode(bufferToHex(buf)),
  },
] as const

const fetchDagValue = async (path: string): Promise<unknown> => {
  let lastError: unknown
  for (const { accept, parse } of DAG_CONTENT_TYPES) {
    try {
      const res = await gatewayFetch(path, { headers: { Accept: accept } })
      return parse(await res.arrayBuffer())
    } catch (e) {
      lastError = e // 406 → next representation; 404/410/5xx → next gateway (inside)
    }
  }
  throw lastError
}

const resolveIpns = async (ref: string): Promise<string> => {
  // gateways redirect /ipns/<name> → /ipfs/<cid>
  const name = ref.slice('/ipns/'.length).split('/')[0]
  const res = await gatewayFetch(`/ipns/${name}`, { headers: { Accept: '*/*' } })
  const match = new URL(res.url).pathname.match(/^\/ipfs\/([^/]+)/)
  if (!match) throw new Error(`IPNS resolution for ${ref} did not yield a CID`)
  return match[1]
}

const dagResolve = async (ref: string): Promise<{ value: string }> => {
  if (!ref.startsWith('/ipns/')) return { value: ref }
  return { value: await resolveIpns(ref) }
}

const dagGet = async (ref: CIDRef): Promise<{ value: unknown }> => {
  let path: string
  if (typeof ref === 'string' && ref.startsWith('/ipns/')) {
    const sub = ref.slice('/ipns/'.length).split('/').slice(1).join('/')
    path = `/ipfs/${await resolveIpns(ref)}${sub ? `/${sub}` : ''}`
  } else {
    path = ipfsPathOf(ref)
  }
  return { value: await fetchDagValue(path) }
}

export const ipfsInstance = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  cat: async function * (cid: CIDRef, _options?: unknown): AsyncGenerator<Uint8Array> {
    const res = await gatewayFetch(ipfsPathOf(cid))
    yield new Uint8Array(await res.arrayBuffer())
  },

  block: {
    get: async (cid: CIDRef): Promise<{ data: Uint8Array }> => ({
      data: new Uint8Array(await (await gatewayFetch(ipfsPathOf(cid))).arrayBuffer()),
    }),
  },

  dag: {
    get: dagGet,
    resolve: dagResolve,
  },
}

export type IPFSLite = typeof ipfsInstance
