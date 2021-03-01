
import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import router from './router'
import i18n from './i18n'

import App from './App.vue'

export const vm = createApp(App)
  .use(IonicVue, { mode: 'md' })
  .use(router)
  .use(i18n)

export default vm
