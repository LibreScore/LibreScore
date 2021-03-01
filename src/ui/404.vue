<template>
  <ion-toolbar
    color="light"
    class="app-err-page"
  >
    <ion-text
      class="main-text text-center"
      color="primary"
    >{{ $t("404") }}</ion-text>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
})
</script>

<style>
  .app-err-page {
    display: flex;
    height: 100%;
  }

  .app-err-page > .main-text {
    font-size: var(--main-text-size);
    font-weight: var(--main-text-weight);
  }
</style>
