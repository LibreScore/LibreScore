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

      <ion-icon
        slot="end"
        class="ion-color-primary icon-btn"
        :icon="playing ? icons.pauseSharp : icons.playSharp"
        @click="toggle"
      ></ion-icon>

      <ion-icon
        slot="end"
        class="ion-color-medium icon-btn"
        :icon="icons.ellipsisVertical"
        @click="showActions"
      >
        <div ref="actions">
          <slot name="actions"></slot>
        </div>
      </ion-icon>
    </ion-range>
  </ion-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonRange, IonLabel, IonItem, IonIcon } from '@ionic/vue/dist/index'
import { pauseSharp, playSharp, ellipsisVertical } from 'ionicons/icons'

import type WebMscore from 'webmscore'
import { Synthesizer } from '@/mscore'
import { PrintTimeMixin } from '../mixins/str-fmt'
import { PopoverMixin } from '../mixins/popover'

export default defineComponent({
  mixins: [
    PrintTimeMixin,
    PopoverMixin,
  ],
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
      icons: {
        pauseSharp,
        playSharp,
        ellipsisVertical,
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
    showActions (ev): Promise<void> {
      const el = this.$refs.actions as any
      return this.showPopover(ev, el)
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
