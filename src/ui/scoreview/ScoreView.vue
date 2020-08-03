<template>
  <ion-card :color="ready && 'light'">
    <template v-if="ready">
      <score-playback
        :mscore="mscore"
        :duration="duration"
        :currentTime="currentTime"
        @seek="updatePlaybackTime"
      >
        <template #actions>
          <action-list :actions="actions"></action-list>
        </template>
      </score-playback>

      <ion-slides
        ref="slides"
        :scrollbar="true"
        :pager="imgUrls.length <= 15"
        @ionSlideDidChange="slideIndexChanged"
      >
        <ion-slide
          v-for="(_, p) of imgUrls"
          :key="'sheet-' + p /** slides are preallocated with the number of pages in this score */"
          class="ion-align-self-center"
        >
          <sheet-view
            v-if="imgUrls[p] /** the sheet image of this page is processed */"
            :page="p"
            :measures="measures"
            :img="imgUrls[p]"
            :currentTime="currentTime"
            @seek="updatePlaybackTime"
          ></sheet-view>

          <!-- image loading -->
          <ion-spinner v-else></ion-spinner>
        </ion-slide>
      </ion-slides>
    </template>

    <template v-else>
      <ion-card-header>
        Please wait...
      </ion-card-header>
      <ion-progress-bar type="indeterminate"></ion-progress-bar>
    </template>
  </ion-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { WebMscoreLoad, Measures } from '@/mscore'
import type WebMscore from 'webmscore'
import type { ScoreMetadata } from 'webmscore/schemas'
import FileSaver from 'file-saver'
import { isDev } from '@/utils'

import { IonSlides, IonSlide, IonCard, IonCardHeader, IonSpinner, IonProgressBar } from '@ionic/vue'
import SheetView from './SheetView.vue'
import ScorePlayback from './ScorePlayback.vue'
import ActionList, { Actions } from '../components/ActionList.vue'

export default defineComponent({
  components: {
    IonSlides,
    IonSlide,
    IonCard,
    IonCardHeader,
    IonSpinner,
    IonProgressBar,
    SheetView,
    ScorePlayback,
    ActionList,
  },
  props: {
    /** 
     * The mscz score file  
     * A Promise that resolves to the Uint8Array data
     */
    mscz: {
      type: undefined as any as PropType<Promise<Uint8Array>>,
      required: true,
    },
  },
  data () {
    return {
      mscore: null as any as WebMscore,
      filename: 'score',

      measures: null as any as Measures,
      metadata: null as any as ScoreMetadata,

      imgUrls: null as any as string[],
      imgCache: new Map<number, Promise<string /** Blob URLs */>>(),

      currentPage: null as any as number, // The current page index (0-based)
      currentTime: NaN, // The current playback time in ms

      actions: {} as Actions,

      pdfFile: undefined as Promise<File> | undefined,
      midiFile: undefined as Promise<File> | undefined,
      audioFile: undefined as Promise<File> | undefined,
    }
  },
  computed: {
    /**
     * The score file and at least one image is fully processed
     */
    ready (): boolean {
      return this.measures && this.imgUrls.some(Boolean)
    },
    /**
     * The score duration **in ms**
     */
    duration (): number {
      if (!this.metadata || !this.metadata.duration) {
        return 0
      }

      return +this.metadata.duration * 1000 // convert to ms
    },
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
      if (currentEl.page !== this.currentPage) {
        return this.slideTo(currentEl.page)
      }
    },
  },
  methods: {
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

        if (isDev()) {
          // use 1-based index here (match the page number shown on the image)
          console.info('loaded page #', page + 1, blobUrl)
        }

        return blobUrl
      })()

      // add to cache
      imgCache.set(page, blobUrlPromise)

      return blobUrlPromise
    },

    updatePlaybackTime (time: number): void {
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

    /**
     * Download the score MSCZ file
     */
    async downloadMSCZ (): Promise<void> {
      const file = new File([await this.mscz], `${this.filename}.mscz`)
      FileSaver.saveAs(file)
    },
    downloadPDF (): Promise<void> {
      return this._saveFile('pdfFile', 'savePdf', [], 'pdf')
    },
    downloadMIDI (): Promise<void> {
      return this._saveFile('midiFile', 'saveMidi', [], 'midi')
    },
    downloadAudio (format: Parameters<WebMscore['saveAudio']>[0]): Promise<void> {
      return this._saveFile('audioFile', 'saveAudio', [format], format)
    },

    async _saveFile (varName: string, fnName: string, args: any[], ext: string): Promise<void> {
      if (!this[varName]) {
        this[varName] = this.mscore[fnName](...args).then((data) => {
          return new File([data], `${this.filename}.${ext}`)
        })
      }
      FileSaver.saveAs(await this[varName])
    },
  },
  async mounted () {
    // single instance only (no component reusing)
    // set `key` attribute on this component

    this.actions = {
      Download: [
        { label: 'MSCZ', fn: (): Promise<void> => this.downloadMSCZ() },
        { label: 'PDF', fn: (): Promise<void> => this.downloadPDF() },
        { label: 'MIDI', fn: (): Promise<void> => this.downloadMIDI() },
        { label: 'OGG Audio', fn: (): Promise<void> => this.downloadAudio('ogg') },
      ],
    }

    // load score
    const mscore = await WebMscoreLoad(
      new Uint8Array(await this.mscz), // make a copy (the ownership of the Uint8Array is transferred to the web worker context, so it becomes unusable in the main context)
    )
    this.mscore = mscore

    // get the score metadata
    this.metadata = await mscore.metadata()
    this.filename = await mscore.titleFilenameSafe()
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
