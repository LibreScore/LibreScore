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
            >{{ $t("APP_DESC") }}</ion-text>
            <ion-text>
              <i18n-t keypath="Home.desc.0"><b>{{ $t("Home.descForFree") }}</b></i18n-t>
              <br>
              <i18n-t keypath="Home.desc.1"><a href="https://musescore.org/">MuseScore</a></i18n-t>
              <br>
              <i18n-t keypath="Home.desc.2"><a :href="githubUrl">{{ $t("Home.descGithubPage") }}</a></i18n-t>
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
        >{{ $t("Home.newest") }}</ion-title>

        <router-link
          to="/upload"
          slot="end"
        >
          <ion-text color="primary">{{ $t("Home.upload") }} ></ion-text>
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
