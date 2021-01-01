
/**
 * A fake (in-memory) implementation/polyfill of the IndexedDB API,  
 * for Firefox Private Mode / Tor Browser
 */

const loadShim = async (): Promise<void> => {
  // `window.indexedDB` is a getter,  
  // so simply assigning a value to it has no use.
  Object.defineProperty(window, 'indexedDB', {
    value: undefined,
    writable: true,
  })

  await import('fake-indexeddb/auto.js')
}

const needShim = async (): Promise<boolean> => {
  if (typeof indexedDB === 'undefined' || !indexedDB) {
    return true
  }

  return new Promise((resolve) => {
    const db = indexedDB.open('inPrivate')
    db.onsuccess = (): void => resolve(false)
    db.onerror = (): void => resolve(true)
  })
}

/**
 * Start loading the shim immediately 
 * 
 * Be sure to `await` it before any IndexedDB-related call
 */
export const idbReady = (async () => {
  if (await needShim()) {
    return loadShim()
  }
})()
