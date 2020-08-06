
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Home from '../Home.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/score/:cid',
    name: 'Score',
    component: () => import('../scoreview/ScoreView.vue'),
    props: (route) => {
      const cid = route.params.cid as string
      return {
        scorepack: import('@/core/scorepack/load').then(f => f.fromCid(cid)),
      }
    },
  },
  {
    path: '/*',
    name: '404',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
