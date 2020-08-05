
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
 * Print date in human readable format
 */
export const fmtDate = (date: Date, locales = 'en-US'): string => {
  return new Intl.DateTimeFormat(locales, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
