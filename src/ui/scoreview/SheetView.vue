<template>
  <div class="container">
    <img
      class="sheet-img"
      :src="img"
    >

    <div
      v-for="e of measureBoxes"
      :key="e.id"
      :style="calStyle(e)"
      @click="$emit('seek', e.time)"
      class="measure"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Positions, PositionElement } from 'webmscore/schemas'
import { toPercentage } from '@/utils/css'

/**
 * each MeasureBox represents one measure element on the sheet page
 */
interface MeasureBox extends PositionElement {
  /**
   * The time position/offset (in ms) of each element in the exported audio
   */
  time: number;

  /** 
   * The start time of the next measure
   */
  timeEnd: number;
}

export default defineComponent({
  props: {
    /** 
     * The page number (0-based)
     */
    page: {
      type: Number,
      required: true,
    },
    /**
     * positions of measures
     */
    mpos: {
      type: Object, // Positions
      required: true,
    },
    /**
     * The URL (or DataURL) to the sheet image
     */
    img: {
      type: String,
      required: true,
    },
  },
  emits: [
    'seek', // seek to time (ms)
  ],
  computed: {
    /**
     * measure elements on the sheet page
     */
    measureBoxes (): MeasureBox[] {
      const page = this.page
      const mpos: Positions = this.mpos

      const boxes: MeasureBox[] = []
      for (const e of mpos.elements) {
        // filter measures on the specific page
        if (e.page < page) {
          continue
        } else if (e.page > page) {
          break
        }

        // find the first time occurrence in any repeat
        const elid = e.id
        const elIndex = mpos.events.findIndex((el) => el.elid === elid)

        const el = mpos.events[elIndex]
        const time = el.position

        // The `timeEnd` is the start time of the next measure in the same repeat
        const nextEl = mpos.events[elIndex + 1]
        const timeEnd = nextEl
          ? nextEl.position
          : Infinity // this is the last measure

        boxes.push({ ...e, time, timeEnd })
      }

      return boxes
    },
    imgWidth (): number {
      const mpos: Positions = this.mpos
      return mpos.pageSize.width
    },
    imgHeight (): number {
      const mpos: Positions = this.mpos
      return mpos.pageSize.height
    },
  },
  methods: {
    /**
     * Calculate the css for a measure
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    calStyle (e: MeasureBox) {
      // lengths (percentage) are relative to the container size ( == image size )
      return {
        width: toPercentage(e.sx / this.imgWidth),
        height: toPercentage(e.sy / this.imgHeight),
        top: toPercentage(e.y / this.imgHeight),
        left: toPercentage(e.x / this.imgWidth),
      }
    },
  },
})
</script>

<style scoped>
  .container {
    /** If the position property is absolute, */
    /** the containing block is ... the nearest ancestor element that has a position value other than static. */
    /** https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_Block */
    /** So set to 'relative' here */
    position: relative;
  }

  .sheet-img {
    background-size: contain;
    display: block;
    width: 100%;
    height: 100%;
  }

  .measure {
    position: absolute;
    z-index: 5;
    cursor: pointer;
  }

  .measure:hover {
    background: rgba(255, 0, 0, 0.05);
  }

  .measure.active {
    background: rgba(255, 0, 0, 0.2);
  }
</style>
