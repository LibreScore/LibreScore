
import Vue from 'vue'

import App from './App.vue'

Vue.config.ignoredElements.push(/^ion-/) // ignore ionic components

export const vm = new Vue({
  render (h) {
    return h(App, { ref: 'App' })
  },
})

export default vm
