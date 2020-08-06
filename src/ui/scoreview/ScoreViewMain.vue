<template>
  <div id="scoreview-main">
    <div style="flex: 0;">
      <slot
        name="headerBar"
        :actions="actions"
      ></slot>
    </div>

    <template v-if="ready">
      <div id="slides-container">
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
            <ion-spinner
              v-else
              color="primary"
            ></ion-spinner>
          </ion-slide>
        </ion-slides>
      </div>

      <score-playback
        style="flex: 0;"
        :mscore="mscore"
        :duration="duration"
        :currentTime="currentTime"
        @seek="updatePlaybackTime"
      ></score-playback>
    </template>

    <template v-else>
      <ion-slides style="flex: 1;">
        <ion-slide class="ion-align-self-center">
          <ion-spinner color="primary"></ion-spinner>
        </ion-slide>
      </ion-slides>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { WebMscoreLoad, Measures } from '@/mscore'
import type WebMscore from 'webmscore'
import type { ScoreMetadata } from 'webmscore/schemas'
import FileSaver from 'file-saver'
import { isDev } from '@/utils'

import { IonSlides, IonSlide, IonSpinner } from '@ionic/vue'
import SheetView from './SheetView.vue'
import ScorePlayback from './ScorePlayback.vue'
import { ActionGroups } from './ScoreHeaderBar.vue'

export default defineComponent({
  components: {
    IonSlides,
    IonSlide,
    IonSpinner,
    SheetView,
    ScorePlayback,
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
  emits: [
    'metadata-ready',
  ],
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

      pdfFile: undefined as Promise<File> | undefined,
      midiFile: undefined as Promise<File> | undefined,
      audioFile: undefined as Promise<File> | undefined,

      actions: undefined as ActionGroups[] | undefined,
      pdfUrl: undefined as string | undefined,
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
    async downloadPDF (download = true): Promise<File> {
      return this._saveFile('pdfFile', 'savePdf', [], 'pdf', 'application/pdf', download)
    },
    async downloadMIDI (): Promise<void> {
      await this._saveFile('midiFile', 'saveMidi', [], 'midi', 'audio/midi')
    },
    async downloadAudio (format: Parameters<WebMscore['saveAudio']>[0]): Promise<void> {
      await this._saveFile('audioFile', 'saveAudio', [format], format, `audio/${format}`)
    },
    async printPDF (): Promise<void> {
      if (!this.pdfUrl) {
        const file = await this.downloadPDF(false)
        this.pdfUrl = URL.createObjectURL(file)
      }
      window.open(this.pdfUrl)
    },
    async _saveFile (varName: string, fnName: string, args: any[], ext: string, mime?: string, download = true): Promise<File> {
      if (!this[varName]) {
        this[varName] = this.mscore[fnName](...args).then((data) => {
          return new File([data], `${this.filename}.${ext}`, { type: mime })
        })
      }
      const file: File = await this[varName]
      if (download) {
        FileSaver.saveAs(file)
      }
      return file
    },
  },
  async mounted () {
    // single instance only (no component reusing)
    // set `key` attribute on this component

    this.actions = [
      [
        { label: 'Download MSCZ', fn: (): Promise<void> => this.downloadMSCZ() },
        { label: 'Download MIDI', fn: (): Promise<void> => this.downloadMIDI() },
        { label: 'Download PDF', fn: async (): Promise<void> => { await this.downloadPDF() } },
      ],
      [
        { label: 'Print', fn: (): Promise<void> => this.printPDF() },
        { label: 'Share', fn: (): void => { void 0 }, disabled: true },
        { label: 'Download Audio', fn: (): Promise<void> => this.downloadAudio('ogg') },
      ],
    ]

    // load score
    const mscore = await WebMscoreLoad(
      new Uint8Array(await this.mscz), // make a copy (the ownership of the Uint8Array is transferred to the web worker context, so it becomes unusable in the main context)
    )
    this.mscore = mscore

    // get the score metadata
    this.metadata = await mscore.metadata()
    this.$emit('metadata-ready', this.metadata)
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
    void this.mscore?.destroy(false) // destroy the whole WebMscore webworker context

    const imgCache = this.imgCache
    for (const blobUrl of imgCache.values()) {
      URL.revokeObjectURL(await blobUrl)
    }

    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl)
    }
  },
})
</script>

<style scoped>
  #scoreview-main {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  #slides-container {
    overflow-y: auto;
    flex: 1;
  }
</style>
