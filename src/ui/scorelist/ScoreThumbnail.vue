<template>
  <div class="thumbnail-container">
    <ipfs-img
      class="thumbnail-img"
      :ipfs="ipfs"
      :cid="cid"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type CID from 'cids'
import IpfsImg from '../components/IpfsImg.vue'

export default defineComponent({
  inject: [
    'ipfs',
  ],
  components: {
    IpfsImg,
  },
  props: {
    cid: {
      type: undefined as any as PropType<CID>,
      required: true,
    },
  },
})
</script>

<style scoped>
  /* see https://pqina.nl/blog/presenting-images-in-an-aspect-ratio-with-css/ */
  .thumbnail-container {
    position: relative;
    border: 2px solid #797d81;
  }

  /* Create a pseudo element that uses padding-bottom to take up space */
  .thumbnail-container::after {
    display: block;
    content: "";
    /* 17:22 aspect ratio */
    padding-bottom: 129.4117647%; /* 22/17 * 100% */
  }

  .thumbnail-img {
    /* Image should match parent box size */
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
</style>
