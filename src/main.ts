
// polyfills
import 'fast-text-encoding' // TextEncoder & TextDecoder
import 'abort-controller/polyfill' // AbortController
import 'web-streams-polyfill' // ReadableStream
import '@/utils/body-polyfill' // Response.prototype.body

import UI from './ui'
import './registerServiceWorker'

UI.mount('#app')

// persist IndexedDB data in situations of low disk space on a device
// https://dexie.org/docs/StorageManager
void navigator?.storage?.persist()
