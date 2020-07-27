
import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue/dist/index'
// import router from './router'

import App from './App.vue'

export const vm = createApp(App).use(IonicVue)
// .use(router)

export default vm
