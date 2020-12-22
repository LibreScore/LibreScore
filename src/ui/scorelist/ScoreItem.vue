<template>
  <router-link :to="'/score/'+s.scorepack">
    <score-thumbnail :cid="s.thumbnail" />
    <ion-title
      color="dark"
      class="ion-text-center"
    >{{ s.title }}</ion-title>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IndexingInfo } from '@/core/indexing'
import ScoreThumbnail from './ScoreThumbnail.vue'

export default defineComponent({
  components: {
    ScoreThumbnail,
  },
  props: {
    s: {
      type: undefined as any as PropType<IndexingInfo>,
      required: true,
    },
  },
})
</script>
