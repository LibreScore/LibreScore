<template>
  <ion-app>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <router-link to="/">
            <img
              :src="publicPath+'img/logo-text.svg'"
              class="librescore-text-logo"
            >
          </router-link>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <router-view :key="$router.currentRoute.value.path"></router-view>
    </ion-content>
  </ion-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IonApp, IonHeader, IonToolbar, IonContent, IonTitle } from '@ionic/vue'

import { IPFS_CLIENT_INFURA } from '@/ipfs'

export default defineComponent({
  components: {
    IonApp,
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
  },
  provide () {
    return {
      ipfs: IPFS_CLIENT_INFURA,
    }
  },
  data () {
    return {
      publicPath: process.env.BASE_URL,
    }
  },
})
</script>

<style>
  /* Core CSS required for Ionic components to work properly */
  @import "~@ionic/vue/css/core.css";

  /* Basic CSS for apps built with Ionic */
  @import "~@ionic/vue/css/normalize.css";
  @import "~@ionic/vue/css/structure.css";
  @import "~@ionic/vue/css/typography.css";

  /* Optional CSS utils that can be commented out */
  @import "~@ionic/vue/css/padding.css";
  @import "~@ionic/vue/css/float-elements.css";
  @import "~@ionic/vue/css/text-alignment.css";
  @import "~@ionic/vue/css/text-transformation.css";
  @import "~@ionic/vue/css/flex-utils.css";
  @import "~@ionic/vue/css/display.css";

  :root {
    --app-border-color: #bdc2c6;
    --app-border: 2px solid var(--app-border-color);
    --logo-color: rgb(0, 123, 255);
    --main-text-size: 44px;
    --main-text-weight: 300;
  }

  /** Clickable ion icons */
  .icon-btn {
    cursor: pointer;
    color: var(--ion-color-base);
  }

  .icon-btn:hover {
    color: var(--ion-color-tint);
  }

  .librescore-text-logo {
    height: 20px;
    position: relative;
    top: 1.8px;
  }

  .app-bg {
    background: var(--ion-color-base, #f4f5f8);
  }

  .app-btn {
    font-weight: normal;
    text-transform: none;
    --box-shadow: none;
  }

  .app-textarea {
    --background: #ffffff;
    --border-radius: 4px;
    border: 2px solid #dee2e6;
    border-radius: var(--border-radius);
  }
</style>
