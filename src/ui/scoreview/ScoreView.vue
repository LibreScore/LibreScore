<template>
  <div>
    <sheet-view
      v-if="mpos && img"
      :page="page"
      :mpos="mpos"
      :img="img"
      @seek="log"
    ></sheet-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// use CDN (webpack externals)
import WebMscore from 'webmscore'
import { Positions, ScoreMetadata } from 'webmscore/schemas'

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
      mscore: null,
      page: null, // The page index (0-based)
      mpos: null,
      img: null,
      metadata: null,
      imgCache: new Map<number, Promise<string /** Blob URLs */>>(),
    }
  },
  watch: {
    async page (current: number): Promise<void> {
      // get the maximum page index
      const metadata: ScoreMetadata = this.metadata
      const max = metadata.pages - 1

      // preload up to 3 pages
      for (let p = current; p <= Math.min(current + 2, max); p++) {
        this.getPageImg(p).then((url) => {
          console.info('preloaded page', p, url)
        })
      }

      this.img = await this.getPageImg(current)
    },
  },
  methods: {
    /**
     * Get the Blob URL to the sheet image of the page
     * @param page the page index
     * @returns a Blob URL
     */
    getPageImg (page: number): Promise<string> {
      const imgCache: Map<number, Promise<string /** Blob URLs */>> = this.imgCache

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
  },
  async mounted () {
    // single instance only (no component reusing)
    // set `key` attribute on this component

    // get WebMscore ready
    await WebMscore.ready

    // load score
    const mscore = await WebMscore.load('mscz', this.mscz)
    this.mscore = mscore

    // get the score metadata
    const metadata: ScoreMetadata = await mscore.metadata()
    this.metadata = metadata

    // load sheet images
    // trigger the `page` watcher
    this.page = 0

    // get the positions of measures
    const mpos: Positions = await mscore.measurePositions()
    this.mpos = mpos
  },
  beforeUnmount () {
    // release resources
    this.mscore.destroy()

    const imgCache: Map<number, string> = this.imgCache
    for (const blobUrl of imgCache.values()) {
      URL.revokeObjectURL(blobUrl)
    }
  },
})
</script>

<style scoped>
</style>
