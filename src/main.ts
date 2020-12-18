
// polyfills
import 'fast-text-encoding' // TextEncoder & TextDecoder
import 'abort-controller/polyfill' // AbortController

import UI from './ui'
import './registerServiceWorker'

UI.mount('#app')
