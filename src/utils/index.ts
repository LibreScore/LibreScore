
export const fetchData = async (url: string, init?: RequestInit): Promise<Uint8Array> => {
  const r = await fetch(url, init)
  const data = await r.arrayBuffer()
  return new Uint8Array(data)
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * LibreScore is in development mode
 */
export const isDev = (): boolean => {
  return process?.env?.NODE_ENV === 'development'
}

export const getBaseUrl = (): string | '' => {
  return process?.env?.BASE_URL || ''
}
