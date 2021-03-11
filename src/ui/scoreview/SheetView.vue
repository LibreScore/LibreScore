<template>
  <div
    class="sheet-container"
    :class="{ 'full-height': isFullHeight }"
  >
    <img
      class="sheet-img"
      :src="img"
      :alt="alt"
    >

    <div
      v-for="e of measuresOnPage"
      class="measure"
      :class="{ active: e.id === activeId }"
      :key="e.id"
      :style="calStyle(e)"
      @click="() => onClick(e)"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { toPercentage } from '@/utils/css'
import { Measures, MeasureEl } from '@/mscore/measures'

export default defineComponent({
  props: {
    /** 
     * The page number (0-based)
     */
    page: {
      type: Number,
      required: true,
    },
    measures: {
      type: Object as PropType<Measures>,
      required: true,
    },
    /**
     * The URL (or DataURL) to the sheet image
     */
    img: {
      type: String,
      required: true,
    },
    /**
     * The current playback time in ms
     */
    currentTime: {
      type: Number,
      default: NaN,
    },
    alt: {
      type: String,
    },
  },
  emits: [
    'seek', // seek to time (ms)
  ],
  data () {
    return {
      isFullHeight: true,
    }
  },
  computed: {
    /**
     * measure elements on the sheet page
     */
    measuresOnPage (): MeasureEl[] {
      const page = this.page
      const els = this.measures.elements

      const l: MeasureEl[] = []
      for (const e of els) {
        // filter measures on this page
        if (e.page < page) {
          continue
        } else if (e.page > page) {
          break
        }
        l.push(e)
      }

      return l
    },
    imgWidth (): number {
      return this.measures.imgWidth
    },
    imgHeight (): number {
      return this.measures.imgHeight
    },
    activeId (): number {
      if (!isFinite(this.currentTime)) { return NaN } // use `isFinite` to identify valid numbers in case that `this.currentTime` == 0
      const currentEl = this.measures.getElByTime(this.currentTime)
      return currentEl.id
    },
  },
  methods: {
    /**
     * Calculate the css for a measure
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    calStyle (e: MeasureEl) {
      // lengths (percentage) are relative to the container size ( == image size )
      return {
        width: toPercentage(e.sx / this.imgWidth),
        height: toPercentage(e.sy / this.imgHeight),
        top: toPercentage(e.y / this.imgHeight),
        left: toPercentage(e.x / this.imgWidth),
      }
    },
    calRatio () {
      const slideParent = this.$parent?.$el as HTMLIonSlideElement | undefined
      if (slideParent) {
        // calculate the aspect ratio of the container parent <ion-slide>
        const { width, height } = slideParent.getBoundingClientRect()
        const ratio = width / height

        // is the sheet image consuming the whole height of .sheet-container?
        this.isFullHeight = ratio > (this.imgWidth / this.imgHeight)
      }
    },
    onClick (e: MeasureEl): void {
      const time = this.measures.getTimeByEl(e)
      this.$emit('seek', time)
    },
    async getSwiper () {
      // the parent <ion-slides>
      const slidesParent = this.$parent?.$parent?.$el as HTMLIonSlidesElement | undefined
      if (slidesParent) {
        const swiper = await slidesParent.getSwiper()
        return swiper
      }
    },
  },
  async mounted () {
    /* eslint-disable @typescript-eslint/unbound-method */ // for `this.calRatio`
    this.calRatio()

    // on entering/exiting fullscreen mode
    document.addEventListener('fullscreenchange', this.calRatio)

    // listen the `resize` event on the underlying `swiper`
    // see https://swiperjs.com/api/#events
    const swiper = await this.getSwiper()
    swiper?.on('resize', this.calRatio)
  },
  async beforeUnmount () {
    // cleanup
    document.removeEventListener('fullscreenchange', this.calRatio)
    const swiper = await this.getSwiper()
    swiper?.off('resize', this.calRatio)
  },
})
</script>

<style scoped>
  .sheet-container {
    /** If the position property is absolute, */
    /** the containing block is ... the nearest ancestor element that has a position value other than static. */
    /** https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_Block */
    /** So set to 'relative' here */
    position: relative;
  }

  .sheet-container.full-height {
    height: 100%;
  }

  .sheet-img {
    background-size: contain;
    display: block;
    /** prevent dragging the image itself */
    pointer-events: none;
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
