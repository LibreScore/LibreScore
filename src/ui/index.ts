
import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import router from './router'

import App from './App.vue'

export const vm = createApp(App)
  .use(IonicVue, { mode: 'md' })
  .use(router)

export default vm
