<template>
  <div>
    <sheet-view
      v-if="measures && img"
      :page="page"
      :measures="measures"
      :img="img"
      :currentTime="currentTime"
      @seek="seek"
    ></sheet-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { WebMscoreLoad, Measures } from '@/mscore'
import type WebMscore from 'webmscore'
import type { ScoreMetadata } from 'webmscore/schemas'

import SheetView from './SheetView.vue'

export default defineComponent({
  components: {
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

      page: null as any as number, // The page index (0-based)
      measures: null as any as Measures,
      metadata: null as any as ScoreMetadata,

      img: '',
      imgCache: new Map<number, Promise<string /** Blob URLs */>>(),

      currentTime: NaN, // The current playback time in ms
    }
  },
  watch: {
    async page (current: number): Promise<void> {
      // get the maximum page index
      const max = this.metadata.pages - 1

      // preload up to 3 pages
      for (let p = current; p <= Math.min(current + 2, max); p++) {
        void (
          this.getPageImg(p).then((url) => {
            console.info('preloaded page', p, url)
          })
        )
      }

      this.img = await this.getPageImg(current)
    },
    currentTime (): void {
      if (!this.currentTime) { return }
      const currentEl = this.measures.getElByTime(this.currentTime)
      this.page = currentEl.page
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
        const svg = await this.mscore.saveSvg(page, true /** drawPageBackground */)
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const blobUrl = URL.createObjectURL(blob)
        return blobUrl
      })()

      // add to cache
      imgCache.set(page, blobUrlPromise)

      return blobUrlPromise
    },
    seek (time: number): void {
      this.currentTime = time
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

    // load sheet images
    // trigger the `page` watcher
    this.page = 0

    // get the positions of measures
    const mpos = await mscore.measurePositions()
    this.measures = new Measures(mpos)
  },
  async beforeUnmount () {
    // release resources
    this.mscore.destroy()

    const imgCache = this.imgCache
    for (const blobUrl of imgCache.values()) {
      URL.revokeObjectURL(await blobUrl)
    }
  },
})
</script>

<style scoped>
</style>
