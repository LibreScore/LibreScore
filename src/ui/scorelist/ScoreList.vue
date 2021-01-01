<template>
  <ion-grid>
    <ion-row>
      <ion-col
        v-for="s of sheets"
        :key="s._id"
        size-md="2"
      >
        <score-item :s="s" />
      </ion-col>
    </ion-row>
  </ion-grid>

  <ion-infinite-scroll
    @ionInfinite="fetchSheets($event)"
    id="infinite-scroll"
  >
    <ion-infinite-scroll-content
      loading-spinner="circular"
      loading-text="Loading more sheets..."
    >
    </ion-infinite-scroll-content>
  </ion-infinite-scroll>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonGrid, IonRow, IonCol, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/vue'
import { IndexingInfo } from '@/core/indexing'
import { localIndex, SORTING, LocalIndex } from '@/core/indexing/local-index'
import ScoreItem from './ScoreItem.vue'

export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    ScoreItem,
  },
  props: {
    sort: {
      type: String as PropType<SORTING>,
      default: 'latest',
    },
  },
  data () {
    return {
      it: undefined as any as ReturnType<LocalIndex['iterate']>,
      sheets: [] as IndexingInfo[],
    }
  },
  watch: {
    // re-init when the sorting changes
    sort: 'init',
  },
  methods: {
    async init () {
      this.sheets = []
      this.it = (await localIndex).iterate(this.sort)
    },
    async fetchSheets (ev?: { target: HTMLIonInfiniteScrollElement }) {
      await localIndex // secure that `localIndex` and `this.it` are ready

      const { value: results, done } = await this.it.next()
      if (results) {
        this.sheets.push(...results)
      }

      if (ev) {
        await ev.target.complete()
        if (done) { // all data is loaded
          // disable the infinite scroll
          ev.target.disabled = true
        }
      }
    },
  },
  async created () {
    await this.init()
    void this.fetchSheets()
  },
})
</script>
