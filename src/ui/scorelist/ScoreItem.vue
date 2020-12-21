<template>
  <router-link :to="'/score/'+s.scorepack">
    <ipfs-img
      :ipfs="ipfs"
      :cid="s.thumbnail"
      style="border: 2px solid #797D81"
    />
    <ion-title
      color="dark"
      class="ion-text-center"
    >{{ s.title }}</ion-title>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IndexingInfo } from '@/core/indexing'
import IpfsImg from '../components/IpfsImg.vue'

export default defineComponent({
  inject: [
    'ipfs',
  ],
  components: {
    IpfsImg,
  },
  props: {
    s: {
      type: undefined as any as PropType<IndexingInfo>,
      required: true,
    },
  },
})
</script>
