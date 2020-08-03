
export const fetchData = async (url: string, init?: RequestInit): Promise<Uint8Array> => {
  const r = await fetch(url, init)
  const data = await r.arrayBuffer()
  return new Uint8Array(data)
}

/**
 * Print time in human readable format (min:sec) 
 */
export const printTime = (ms: number): string => {
  const s = Math.round(ms / 1000) || 0 // convert to s

  const minStr = `${Math.floor(s / 60)}`.padStart(2, '0')
  const secStr = `${s % 60}`.padStart(2, '0')

  return `${minStr}:${secStr}`
}

/**
 * LibreScore is in development mode
 */
export const isDev = (): boolean => {
  return process?.env?.NODE_ENV === 'development'
}
