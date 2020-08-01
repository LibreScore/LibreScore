
export const fetchData = async (url: string, init?: RequestInit): Promise<Uint8Array> => {
  const r = await fetch(url, init)
  const data = await r.arrayBuffer()
  return new Uint8Array(data)
}

/**
 * LibreScore is in development mode
 */
export const isDev = (): boolean => {
  return process?.env?.NODE_ENV === 'development'
}
