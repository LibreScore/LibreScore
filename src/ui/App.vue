<template>
  <ion-app>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <router-link to="/">
            <img
              :src="baseUrl+'img/logo-text.svg'"
              class="librescore-text-logo"
              alt="LibreScore Logo"
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

import { ipfsInstance } from '@/ipfs'
import { getBaseUrl } from '@/utils'

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
      ipfs: ipfsInstance,
    }
  },
  data () {
    return {
      baseUrl: getBaseUrl(),
    }
  },
})

// Add or remove the "dark" class based on if the media query matches
function toggleDarkTheme (shouldAdd) {
  document.body.classList.toggle('dark', shouldAdd)
}

// Use matchMedia to check the user preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

toggleDarkTheme(prefersDark.matches)

// Listen for changes to the prefers-color-scheme media query
prefersDark.addListener((mediaQuery) => toggleDarkTheme(mediaQuery.matches))
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

  /* Light Colors */

  body {
    --ion-color-primary: #3880ff;
    --ion-color-primary-rgb: 56,128,255;
    --ion-color-primary-contrast: #ffffff;
    --ion-color-primary-contrast-rgb: 255,255,255;
    --ion-color-primary-shade: #3171e0;
    --ion-color-primary-tint: #4c8dff;

    --ion-color-secondary: #3dc2ff;
    --ion-color-secondary-rgb: 61,194,255;
    --ion-color-secondary-contrast: #ffffff;
    --ion-color-secondary-contrast-rgb: 255,255,255;
    --ion-color-secondary-shade: #36abe0;
    --ion-color-secondary-tint: #50c8ff;

    --ion-color-tertiary: #5260ff;
    --ion-color-tertiary-rgb: 82,96,255;
    --ion-color-tertiary-contrast: #ffffff;
    --ion-color-tertiary-contrast-rgb: 255,255,255;
    --ion-color-tertiary-shade: #4854e0;
    --ion-color-tertiary-tint: #6370ff;

    --ion-color-success: #2dd36f;
    --ion-color-success-rgb: 45,211,111;
    --ion-color-success-contrast: #ffffff;
    --ion-color-success-contrast-rgb: 255,255,255;
    --ion-color-success-shade: #28ba62;
    --ion-color-success-tint: #42d77d;

    --ion-color-warning: #ffc409;
    --ion-color-warning-rgb: 255,196,9;
    --ion-color-warning-contrast: #000000;
    --ion-color-warning-contrast-rgb: 0,0,0;
    --ion-color-warning-shade: #e0ac08;
    --ion-color-warning-tint: #ffca22;

    --ion-color-danger: #eb445a;
    --ion-color-danger-rgb: 235,68,90;
    --ion-color-danger-contrast: #ffffff;
    --ion-color-danger-contrast-rgb: 255,255,255;
    --ion-color-danger-shade: #cf3c4f;
    --ion-color-danger-tint: #ed576b;

    --ion-color-dark: #222428;
    --ion-color-dark-rgb: 34,36,40;
    --ion-color-dark-contrast: #ffffff;
    --ion-color-dark-contrast-rgb: 255,255,255;
    --ion-color-dark-shade: #1e2023;
    --ion-color-dark-tint: #383a3e;

    --ion-color-medium: #92949c;
    --ion-color-medium-rgb: 146,148,156;
    --ion-color-medium-contrast: #ffffff;
    --ion-color-medium-contrast-rgb: 255,255,255;
    --ion-color-medium-shade: #808289;
    --ion-color-medium-tint: #9d9fa6;

    --ion-color-light: #f4f5f8;
    --ion-color-light-rgb: 244,245,248;
    --ion-color-light-contrast: #000000;
    --ion-color-light-contrast-rgb: 0,0,0;
    --ion-color-light-shade: #d7d8da;
    --ion-color-light-tint: #f5f6f9;

    --app-border: 2px solid #bdc2c6;
    --app-background-color: #ffffff;
    --app-border-color: #dee2e6;
  }

  .ios body {
    --ion-background-color: #ffffff;
    --ion-background-color-rgb: 255,255,255;

    --ion-text-color: #000000;
    --ion-text-color-rgb: 0,0,0;

    --ion-color-step-50: #f2f2f2;
    --ion-color-step-100: #e6e6e6;
    --ion-color-step-150: #d9d9d9;
    --ion-color-step-200: #cccccc;
    --ion-color-step-250: #bfbfbf;
    --ion-color-step-300: #b3b3b3;
    --ion-color-step-350: #a6a6a6;
    --ion-color-step-400: #999999;
    --ion-color-step-450: #8c8c8c;
    --ion-color-step-500: #808080;
    --ion-color-step-550: #737373;
    --ion-color-step-600: #666666;
    --ion-color-step-650: #595959;
    --ion-color-step-700: #4d4d4d;
    --ion-color-step-750: #404040;
    --ion-color-step-800: #333333;
    --ion-color-step-850: #262626;
    --ion-color-step-900: #191919;
    --ion-color-step-950: #0d0d0d;

    --ion-toolbar-background: #f2f2f2;

    --ion-item-background: #ffffff;

    --ion-card-background: #e2e2e3;
  }

  .md body {
    --ion-background-color: #ffffff;
    --ion-background-color-rgb: 255,255,255;

    --ion-text-color: #121212;
    --ion-text-color-rgb: 18,18,18;

    --ion-border-color: #dddddd;

    --ion-color-step-50: #f3f3f3;
    --ion-color-step-100: #e7e7e7;
    --ion-color-step-150: #dbdbdb;
    --ion-color-step-200: #d0d0d0;
    --ion-color-step-250: #c4c4c4;
    --ion-color-step-300: #b8b8b8;
    --ion-color-step-350: #acacac;
    --ion-color-step-400: #a0a0a0;
    --ion-color-step-450: #949494;
    --ion-color-step-500: #898989;
    --ion-color-step-550: #7d7d7d;
    --ion-color-step-600: #717171;
    --ion-color-step-650: #656565;
    --ion-color-step-700: #595959;
    --ion-color-step-750: #4d4d4d;
    --ion-color-step-800: #414141;
    --ion-color-step-850: #363636;
    --ion-color-step-900: #2a2a2a;
    --ion-color-step-950: #1e1e1e;

    --ion-item-background: #f3f3f3;

    --ion-toolbar-background: #f2f2f2;

    --ion-tab-bar-background: #f2f2f2;

    --ion-card-background: #f3f3f3;
  }

  /* Dark Colors */

  body.dark {
    --ion-color-primary: #428cff;
    --ion-color-primary-rgb: 66,140,255;
    --ion-color-primary-contrast: #ffffff;
    --ion-color-primary-contrast-rgb: 255,255,255;
    --ion-color-primary-shade: #3a7be0;
    --ion-color-primary-tint: #5598ff;

    --ion-color-secondary: #50c8ff;
    --ion-color-secondary-rgb: 80,200,255;
    --ion-color-secondary-contrast: #ffffff;
    --ion-color-secondary-contrast-rgb: 255,255,255;
    --ion-color-secondary-shade: #46b0e0;
    --ion-color-secondary-tint: #62ceff;

    --ion-color-tertiary: #6a64ff;
    --ion-color-tertiary-rgb: 106,100,255;
    --ion-color-tertiary-contrast: #ffffff;
    --ion-color-tertiary-contrast-rgb: 255,255,255;
    --ion-color-tertiary-shade: #5d58e0;
    --ion-color-tertiary-tint: #7974ff;

    --ion-color-success: #2fdf75;
    --ion-color-success-rgb: 47,223,117;
    --ion-color-success-contrast: #000000;
    --ion-color-success-contrast-rgb: 0,0,0;
    --ion-color-success-shade: #29c467;
    --ion-color-success-tint: #44e283;

    --ion-color-warning: #ffd534;
    --ion-color-warning-rgb: 255,213,52;
    --ion-color-warning-contrast: #000000;
    --ion-color-warning-contrast-rgb: 0,0,0;
    --ion-color-warning-shade: #e0bb2e;
    --ion-color-warning-tint: #ffd948;

    --ion-color-danger: #ff4961;
    --ion-color-danger-rgb: 255,73,97;
    --ion-color-danger-contrast: #ffffff;
    --ion-color-danger-contrast-rgb: 255,255,255;
    --ion-color-danger-shade: #e04055;
    --ion-color-danger-tint: #ff5b71;

    --ion-color-dark: #f4f5f8;
    --ion-color-dark-rgb: 244,245,248;
    --ion-color-dark-contrast: #000000;
    --ion-color-dark-contrast-rgb: 0,0,0;
    --ion-color-dark-shade: #d7d8da;
    --ion-color-dark-tint: #f5f6f9;

    --ion-color-medium: #989aa2;
    --ion-color-medium-rgb: 152,154,162;
    --ion-color-medium-contrast: #000000;
    --ion-color-medium-contrast-rgb: 0,0,0;
    --ion-color-medium-shade: #86888f;
    --ion-color-medium-tint: #a2a4ab;

    --ion-color-light: #222428;
    --ion-color-light-rgb: 34,36,40;
    --ion-color-light-contrast: #ffffff;
    --ion-color-light-contrast-rgb: 255,255,255;
    --ion-color-light-shade: #1e2023;
    --ion-color-light-tint: #383a3e;

    --app-border: 2px solid #393e42;
    --app-background-color: #000000;
    --app-border-color: #191d21;
  }

  .ios body.dark {
    --ion-background-color: #000000;
    --ion-background-color-rgb: 0,0,0;

    --ion-text-color: #ffffff;
    --ion-text-color-rgb: 255,255,255;

    --ion-color-step-50: #0d0d0d;
    --ion-color-step-100: #1a1a1a;
    --ion-color-step-150: #262626;
    --ion-color-step-200: #333333;
    --ion-color-step-250: #404040;
    --ion-color-step-300: #4d4d4d;
    --ion-color-step-350: #595959;
    --ion-color-step-400: #666666;
    --ion-color-step-450: #737373;
    --ion-color-step-500: #808080;
    --ion-color-step-550: #8c8c8c;
    --ion-color-step-600: #999999;
    --ion-color-step-650: #a6a6a6;
    --ion-color-step-700: #b3b3b3;
    --ion-color-step-750: #bfbfbf;
    --ion-color-step-800: #cccccc;
    --ion-color-step-850: #d9d9d9;
    --ion-color-step-900: #e6e6e6;
    --ion-color-step-950: #f2f2f2;

    --ion-toolbar-background: #0d0d0d;

    --ion-item-background: #000000;

    --ion-card-background: #1c1c1d;
  }

  .md body.dark {
    --ion-background-color: #121212;
    --ion-background-color-rgb: 18,18,18;

    --ion-text-color: #ffffff;
    --ion-text-color-rgb: 255,255,255;

    --ion-border-color: #222222;

    --ion-color-step-50: #1e1e1e;
    --ion-color-step-100: #2a2a2a;
    --ion-color-step-150: #363636;
    --ion-color-step-200: #414141;
    --ion-color-step-250: #4d4d4d;
    --ion-color-step-300: #595959;
    --ion-color-step-350: #656565;
    --ion-color-step-400: #717171;
    --ion-color-step-450: #7d7d7d;
    --ion-color-step-500: #898989;
    --ion-color-step-550: #949494;
    --ion-color-step-600: #a0a0a0;
    --ion-color-step-650: #acacac;
    --ion-color-step-700: #b8b8b8;
    --ion-color-step-750: #c4c4c4;
    --ion-color-step-800: #d0d0d0;
    --ion-color-step-850: #dbdbdb;
    --ion-color-step-900: #e7e7e7;
    --ion-color-step-950: #f3f3f3;

    --ion-item-background: #1e1e1e;

    --ion-toolbar-background: #1f1f1f;

    --ion-tab-bar-background: #1f1f1f;

    --ion-card-background: #1e1e1e;
  }

  @media screen and (prefers-color-scheme: dark) {
    .swiper-wrapper {
      filter: opacity(0.6);
    }
  }

  :root {
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

  .text-center {
    display: block;
    text-align: center;
  }

  .app-bg {
    background: var(--ion-color-light);
  }

  .app-btn {
    font-weight: normal;
    text-transform: none;
    --box-shadow: none;
  }

  .app-textarea {
    --background: var(--app-background-color);
    --border-radius: 4px;
    border: 2px solid var(--app-border-color);
    border-radius: var(--border-radius);
  }
</style>
