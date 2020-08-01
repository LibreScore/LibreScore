<template>
  <ion-range
    :min="0"
    :max="duration"
    :value="currentTime"
    :debounce="20"
    @ionChange="(e) => $emit('seek', e.detail.value)"
  >
    <ion-label slot="start">{{ printTime(currentTime) }}</ion-label>
    <ion-label slot="end">{{ printTime(duration) }}</ion-label>
  </ion-range>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonRange, IonLabel } from '@ionic/vue'

import type WebMscore from 'webmscore'
import { Synthesizer } from '@/mscore'

export default defineComponent({
  components: {
    IonRange,
    IonLabel,
  },
  props: {
    mscore: {
      type: undefined as any as PropType<WebMscore>,
      required: true,
    },
    /**
     * The score duration **in ms**
     */
    duration: {
      type: Number,
      required: true,
    },
    /**
     * The current playback time **in ms**
     */
    currentTime: {
      type: Number,
      default: NaN,
    },
  },
  emits: [
    'seek', // the playback time updates
  ],
  data () {
    return {
      synthesizer: null as any as Synthesizer,
      playing: false,
      abortCtrl: undefined as AbortController | undefined,
    }
  },
  watch: {
    currentTime (ms: number): void {
      if (isFinite(ms)) {
        this.synthesizer.time = ms / 1000 // convert to s
      }
    },
  },
  methods: {
    play (): void {
      this.playing = true
      this.abortCtrl = new AbortController()

      this.synthesizer.play(this.abortCtrl.signal, (time) => {
        this.$emit('seek', time * 1000 /* convert to ms */)
      }, () => { // called once finished or aborted
        this.playing = false
      })
    },
    pause (): void {
      void this.abortCtrl?.abort()
    },
    /**
     * Print time in human readable format (min:sec) 
     */
    printTime (ms: number): string {
      const s = Math.round(ms / 1000) || 0 // convert to s

      const minStr = `${Math.floor(s / 60)}`.padStart(2, '0')
      const secStr = `${s % 60}`.padStart(2, '0')

      return `${minStr}:${secStr}`
    },
  },
  mounted () {
    this.synthesizer = new Synthesizer(this.mscore)
  },
  async beforeUnmount () {
    // release resources
    await this.synthesizer.worklet?.cancel()
  },
})
</script>
