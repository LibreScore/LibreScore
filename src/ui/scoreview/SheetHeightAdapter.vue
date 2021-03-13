<template>
  <!-- the only child element must be <ion-slides> -->
  <slot :fullHeight="fullHeight"></slot>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Measures } from '@/mscore/measures'

export default defineComponent({
  props: {
    measures: {
      type: Object as PropType<Measures>,
      required: true,
    },
  },
  data () {
    return {
      fullHeight: true,
    }
  },
  methods: {
    calRatio () {
      const slides = this.getSlides()
      if (slides) {
        // calculate the aspect ratio of the container <ion-slides>
        const { width, height } = slides.getBoundingClientRect()
        const ratio = width / height

        // is the sheet image consuming the whole height of .sheet-container?
        this.fullHeight = ratio > this.measures.imgAspectRatio
      }
    },
    getSlides () {
      return (this.$el as Comment).nextElementSibling as HTMLIonSlidesElement | undefined
    },
    async getSwiper () {
      const slides = this.getSlides()
      if (slides) {
        const swiper = await slides.getSwiper?.()
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
