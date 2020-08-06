<template>
  <ion-grid
    class="ion-no-padding"
    style="height: 100%;"
  >
    <ion-row style="height: 100%;">
      <ion-col
        size-lg="9"
        id="score-view-left"
      >
        <score-view-main
          v-if="mscz"
          :key="id"
          :mscz="mscz"
          @metadata-ready="(m) => metadata = m"
        >
          <template #headerBar="slotProps">
            <score-header-bar
              :actions="slotProps.actions"
              :scoreTitle="scoreTitle"
              :scoreSummary="scoreSummary"
            ></score-header-bar>
          </template>
        </score-view-main>
      </ion-col>

      <ion-col
        size="12"
        size-lg
        id="score-view-right"
        class="ion-color-light"
      >
        <score-info
          :description="description"
          :userName="userName"
          :sourceUrl="sourceUrl"
          :tags="tags"
          :date="date"
          :metadata="metadata"
        ></score-info>

        <score-comments></score-comments>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IonGrid, IonRow, IonCol } from '@ionic/vue'
import ScoreViewMain from './ScoreViewMain.vue'
import ScoreHeaderBar from './ScoreHeaderBar.vue'
import ScoreInfo from './ScoreInfo.vue'
import ScoreComments from './ScoreComments.vue'

export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonCol,
    ScoreViewMain,
    ScoreHeaderBar,
    ScoreInfo,
    ScoreComments,
  },
  data () {
    return {
    }
  },
})
</script>

<style scoped>
  #score-view-left {
    height: 100%;
  }

  /** ionic breakpoint: lg */
  @media (min-width: 992px) {
    #score-view-left {
      border-right: var(--app-border);
    }
  }

  #score-view-right {
    overflow-y: auto;
    background: var(--ion-color-base);
  }

  /** ionic breakpoint: lg */
  @media (min-width: 992px) {
    #score-view-right {
      height: 100%;
    }
  }
</style>
