<template>
  <ion-item>
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

    <ion-icon
      id="play-btn"
      :icon="playing ? icons.pauseSharp : icons.playSharp"
      @click="toggle"
      class="ion-margin-end ion-color-primary"
      slot="end"
    ></ion-icon>
  </ion-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonRange, IonLabel, IonItem, IonIcon } from '@ionic/vue'
import * as icons from 'ionicons/icons'

import type WebMscore from 'webmscore'
import { Synthesizer } from '@/mscore'

export default defineComponent({
  components: {
    IonRange,
    IonLabel,
    IonItem,
    IonIcon,
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
      icons,
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
    toggle (): void {
      if (this.playing) {
        this.pause()
      } else {
        this.play()
      }
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
    this.synthesizer = new Synthesizer(this.mscore, this.duration / 1000 /* convert to s */)
  },
  async beforeUnmount () {
    // release resources
    await this.synthesizer.worklet?.cancel()
  },
})
</script>

<style scoped>
  #play-btn {
    cursor: pointer;
    color: var(--ion-color-base);
  }

  #play-btn:hover {
    color: var(--ion-color-tint);
  }
</style>
