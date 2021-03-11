
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { getBaseUrl } from '@/utils'
import { updatePageMetadata } from '@/ui/seo'
import { clear as clearMetaTags, update as updateMetaTag } from '@/ui/seo/meta-tag'

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
  // remove any stale meta tag elements
  clearMetaTags()
  // clear page metadata
  updatePageMetadata({
    title: undefined,
    description: undefined,
  })

  // https://ogp.me/ meta tags 
  updateMetaTag({ property: 'og:url', content: location.href })
  updateMetaTag({ property: 'og:image', content: document.baseURI + 'img/logo-text.svg' })
})

export default router
