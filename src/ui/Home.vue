<template>
  <div>
    <ion-toolbar color="light">
      <ion-grid id="home-header">
        <ion-row>
          <ion-col
            size-lg="4"
            class="ion-hide-lg-down librescore-logo"
            :style="{ backgroundImage: `url('${baseUrl}img/logo-no-margin.svg')` }"
          ></ion-col>

          <ion-col
            class="text-container"
            size-lg="7"
          >
            <ion-text
              class="main-text"
              color="primary"
            >{{ appDesc }}</ion-text>
            <ion-text>
              With LibreScore, you can get all the sheet music you need – <b>for free</b>.
              <br>
              In contrast to other music sharing platforms, we don't charge you any money for getting notes. We are compatible with <a href="https://musescore.org/">MuseScore</a>, which is a free music writing software.
              <br>
              To top it all off, all of what you see right here is open source! If you feel like contributing, check out <a :href="githubUrl">this</a> page.
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-toolbar>

    <div id="home-contents">
      <ion-toolbar>
        <ion-title
          size="large"
          style="font-size: 24px;"
        >Newest sheets</ion-title>

        <router-link
          to="/upload"
          slot="end"
        >
          <ion-text color="primary">upload ></ion-text>
        </router-link>
      </ion-toolbar>

      <score-list />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import { IonGrid, IonRow, IonCol, IonText, IonToolbar, IonTitle } from '@ionic/vue'
import { getBaseUrl } from '@/utils'

export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonToolbar,
    IonTitle,
    ScoreList: defineAsyncComponent(() => import('./scorelist/ScoreList.vue')),
  },
  data () {
    return {
      baseUrl: getBaseUrl(),
      appDesc: process.env.VUE_APP_DESC || '',
      githubUrl: 'https://github.com/LibreScore/LibreScore',
    }
  },
})
</script>

<style scoped>
  #home-header {
    margin: 4rem 1rem;
  }

  .librescore-logo {
    background-repeat: no-repeat;
    background-position: right;
    background-origin: content-box;
    right: 2em;
    padding-bottom: 10px;
    padding-top: 16px;
  }

  .text-container {
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .main-text {
    display: block;
    font-size: var(--main-text-size);
    font-weight: var(--main-text-weight);
    margin-bottom: 10px;
  }

  #home-contents {
    margin: 3rem;
  }
</style>
