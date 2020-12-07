
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../Home.vue'
import NotFoundPage from '../404.vue'

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
        cid,
      }
    },
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: NotFoundPage,
  },
]

/**
 * Workaround for HTML5 history routing on IPFS HTTP Gateways  
 * see @/loader.js
 */
const getRouterBase = (pathname: string = location?.pathname): string | undefined => {
  const l = pathname.split('/')
  // ['', 'ipfs', 'QmHash...', ...]
  const isOnGateway = l.length >= 4 && ['ipfs', 'ipns'].includes(l[1])
  if (isOnGateway) {
    return l.slice(0, 3).join('/')
  }
}

const router = createRouter({
  history: createWebHistory(getRouterBase()),
  routes,
})

export default router
