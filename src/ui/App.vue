<template>
  <ion-app>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          <ion-icon name="heart"></ion-icon>
          Header
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h1>Main Content</h1>
    </ion-content>
  </ion-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IonApp, IonHeader, IonToolbar, IonContent, IonTitle, IonIcon } from '@ionic/vue'

export default defineComponent({
  components: {
    IonApp,
    IonHeader,
    IonToolbar,
    IonContent,
    IonTitle,
    IonIcon,
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
  }

  /** Clickable ion icons */
  .icon-btn {
    cursor: pointer;
    color: var(--ion-color-base);
  }

  .icon-btn:hover {
    color: var(--ion-color-tint);
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
