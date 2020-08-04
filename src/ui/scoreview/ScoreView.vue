<template>
  <ion-grid
    class="ion-no-padding"
    style="height: 100%;"
  >
    <ion-row style="height: 100%;">
      <ion-col push="9">
        <div>
          <h3>float-right</h3>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac vehicula lorem.
        </div>
      </ion-col>

      <ion-col
        size="9"
        pull="3"
        id="score-view-left"
      >
        <score-view-main
          v-if="mscz"
          :key="id"
          :mscz="mscz"
        >
          <template #headerBar>
            <score-header-bar></score-header-bar>
          </template>
        </score-view-main>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IonGrid, IonRow, IonCol } from '@ionic/vue'
import ScoreViewMain from './ScoreViewMain.vue'
import ScoreHeaderBar from './ScoreHeaderBar.vue'
export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonCol,
    ScoreViewMain,
    ScoreHeaderBar,
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
    border-right: var(--app-border);
  }
</style>
