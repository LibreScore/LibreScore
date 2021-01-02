
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { getBaseUrl } from '@/utils'
import { updatePageMetadata } from '@/ui/seo'

import Home from '../Home.vue'
import ScoreView from '../scoreview/ScoreView.vue'
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
    component: ScoreView,
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

const router = createRouter({
  history: createWebHistory(getBaseUrl()),
  routes,
})

router.afterEach(() => {
  // clear page metadata
  updatePageMetadata({
    title: undefined,
    description: undefined,
  })
})

export default router
