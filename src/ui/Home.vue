<template>
    <ion-toolbar color="light">
      <ion-grid id="home-header">
        <ion-row>
          <ion-col
            size-lg="4"
            class="ion-hide-lg-down librescore-logo"
          ></ion-col>

          <ion-col
            class="text-container"
            size-lg="7"
          >
            <ion-text
              class="main-text"
              color="primary"
            >Sheet music. Free. Forever.</ion-text>
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data () {
    return {
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
    background: url("/img/logo-no-margin.svg");
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
</style>
