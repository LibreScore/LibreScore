<template>
  <ion-toolbar color="light">
    <ion-buttons slot="start">
      <ion-button @click="reset">
        <ion-icon
          slot="icon-only"
          class="ion-color-dark"
          :icon="icons.playSkipBackOutline"
        ></ion-icon>
      </ion-button>

      <ion-button @click="toggle">
        <ion-icon
          slot="icon-only"
          class="ion-color-dark"
          :icon="playing ? icons.pauseOutline : icons.playOutline"
        ></ion-icon>
      </ion-button>
    </ion-buttons>

    <ion-range
      color="dark"
      :min="0"
      :max="duration"
      :value="currentTime"
      :debounce="20"
      @ionChange="(e) => $emit('seek', e.detail.value)"
    >
      <ion-label slot="start">{{ printTime(currentTime) }}</ion-label>
      <ion-label slot="end">{{ printTime(duration) }}</ion-label>
    </ion-range>

    <ion-buttons slot="end">
      <ion-button @click="fullScreen">
        <ion-icon
          slot="icon-only"
          class="ion-color-dark"
          :icon="icons.expandOutline"
        ></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonRange, IonLabel, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/vue/dist/index'
import { pauseOutline, playOutline, playSkipBackOutline, expandOutline } from 'ionicons/icons'

import type WebMscore from 'webmscore'
import { Synthesizer } from '@/mscore'
import { PrintTimeMixin } from '../mixins/str-fmt'

export default defineComponent({
  mixins: [PrintTimeMixin],
  components: {
    IonRange,
    IonLabel,
    IonToolbar,
    IonButtons,
    IonButton,
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
      playOnEnded: undefined as Promise<void> | undefined,
      abortCtrl: undefined as AbortController | undefined,
      icons: {
        pauseOutline,
        playOutline,
        playSkipBackOutline,
        expandOutline,
      },
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
    async play (): Promise<void> {
      this.playing = true
      this.abortCtrl = new AbortController()

      this.playOnEnded = this.synthesizer.play(this.abortCtrl.signal, (time) => {
        this.$emit('seek', time * 1000 /* convert to ms */)
      })
      await this.playOnEnded
      // promise resolves once finished or aborted
      this.playing = false
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
    async reset (): Promise<void> {
      const playing = this.playing

      this.pause()
      await this.playOnEnded

      this.$emit('seek', 0) // reset time

      await this.$nextTick()
      if (playing) {
        this.play()
      }
    },
    /**
     * Request the sheet slides to be fullscreen
     */
    fullScreen (): Promise<void> {
      const el = this.$parent?.$refs.slides as HTMLElement
      return el.requestFullscreen()
    },
  },
  mounted () {
    this.synthesizer = new Synthesizer(this.mscore, this.duration / 1000 /* convert to s */)
  },
  async beforeUnmount () {
    // release resources
    await this.synthesizer.destroy()
  },
})
</script>

<style scoped>
  ion-toolbar {
    border-top: var(--app-border);
  }

  ion-icon {
    font-size: 2em;
  }
</style>
