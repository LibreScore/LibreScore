<template>
  <ion-slides
    v-if="measures /** the score file is fully processed */"
    ref="slides"
    :scrollbar="true"
    :pager="true"
    @ionSlideDidChange="slideIndexChanged"
  >
    <ion-slide
      v-for="(_, p) of imgUrls"
      :key="'sheet-' + p /** slides are preallocated with the number of pages in this score */"
    >
      <div v-if="imgUrls[p] /** the sheet image of this page is processed */">
        <sheet-view
          :page="p"
          :measures="measures"
          :img="imgUrls[p]"
          :currentTime="currentTime"
          @seek="seek"
        ></sheet-view>
      </div>
    </ion-slide>
  </ion-slides>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { WebMscoreLoad, Measures } from '@/mscore'
import type WebMscore from 'webmscore'
import type { ScoreMetadata } from 'webmscore/schemas'

import { IonSlides, IonSlide } from '@ionic/vue'
import SheetView from './SheetView.vue'

export default defineComponent({
  components: {
    IonSlides,
    IonSlide,
    SheetView,
  },
  props: {
    /** 
     * The mscz score file
     */
    mscz: {
      type: Uint8Array,
      required: true,
    },
  },
  data () {
    return {
      mscore: null as any as WebMscore,

      measures: null as any as Measures,
      metadata: null as any as ScoreMetadata,

      imgUrls: null as any as string[],
      imgCache: new Map<number, Promise<string /** Blob URLs */>>(),

      currentPage: null as any as number, // The current page index (0-based)
      currentTime: NaN, // The current playback time in ms
    }
  },
  watch: {
    currentPage (current: number): void {
      // get the maximum page index
      const max = this.metadata.pages - 1
      const start = Math.max(current - 1, 0)

      // preload up to 4 pages
      for (let p = start; p <= Math.min(start + 3, max); p++) {
        void (
          this.getPageImg(p)
        )
      }
    },
    async currentTime (): Promise<void> {
      if (!isFinite(this.currentTime)) { return }
      const currentEl = this.measures.getElByTime(this.currentTime)
      return this.slideTo(currentEl.page)
    },
  },
  methods: {
    /**
     * @todo map/export metadata, mscore, download mscz, etc. methods
     */
    /**
     * Get the Blob URL to the sheet image of the page
     * @param page the page index
     * @returns a Blob URL
     */
    getPageImg (page: number): Promise<string> {
      const imgCache = this.imgCache

      // retrieve from cache
      if (imgCache.has(page)) {
        return imgCache.get(page) as Promise<string>
      }

      // avoid ...
      const blobUrlPromise = (async (): Promise<string> => {
        // generate the svg image
        const svg = await this.mscore.saveSvg(page, true /** drawPageBackground */)
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const blobUrl = URL.createObjectURL(blob)

        // update states
        this.imgUrls[page] = blobUrl

        if (process?.env?.NODE_ENV === 'development') {
          // use 1-based index here (match the page number shown on the image)
          console.info('loaded page #', page + 1, blobUrl)
        }

        return blobUrl
      })()

      // add to cache
      imgCache.set(page, blobUrlPromise)

      return blobUrlPromise
    },
    seek (time: number): void {
      this.currentTime = time
    },
    async slideIndexChanged (): Promise<void> {
      const sidesEl = this.$refs.slides as any
      const index = await sidesEl.getActiveIndex()
      this.currentPage = index
    },
    /**
     * Transition to the specified sheet page slide
     */
    slideTo (pageIndex: number): Promise<void> {
      const sidesEl = this.$refs.slides as any
      return sidesEl.slideTo(pageIndex, 0 /* speed */) // also changes `this.currentPage`
    },
  },
  async mounted () {
    // single instance only (no component reusing)
    // set `key` attribute on this component

    // load score
    const mscore = await WebMscoreLoad(
      new Uint8Array(this.mscz), // make a copy (the ownership of the Uint8Array is transferred to the web worker context, so it becomes unusable in the main context)
    )
    this.mscore = mscore

    // get the score metadata
    this.metadata = await mscore.metadata()
    // preallocate the `imgUrls` array for Vue list rendering
    this.imgUrls = Array.from({ length: this.metadata.pages })

    // load sheet images
    // trigger the `currentPage` watcher
    this.currentPage = 0

    // get the positions of measures
    const mpos = await mscore.measurePositions()
    this.measures = new Measures(mpos)
  },
  async beforeUnmount () {
    // release resources
    this.mscore.destroy(false) // destroy the whole WebMscore webworker context

    const imgCache = this.imgCache
    for (const blobUrl of imgCache.values()) {
      URL.revokeObjectURL(await blobUrl)
    }
  },
})
</script>

<style scoped>
</style>
