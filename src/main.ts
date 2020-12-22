
// polyfills
import 'fast-text-encoding' // TextEncoder & TextDecoder
import 'abort-controller/polyfill' // AbortController
import 'web-streams-polyfill' // ReadableStream
import '@/utils/body-polyfill' // Response.prototype.body

import UI from './ui'
import './registerServiceWorker'

UI.mount('#app')
