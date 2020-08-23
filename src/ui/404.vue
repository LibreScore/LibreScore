<template>
  <ion-toolbar
    color="light"
    class="page404"
  >
    <ion-text
      class="main-text"
      color="primary"
    >404 Not Found</ion-text>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
})
</script>

<style scoped>
  .page404 {
    display: flex;
    height: 100%;
  }

  .main-text {
    display: block;
    text-align: center;
    font-size: var(--main-text-size);
    font-weight: var(--main-text-weight);
  }
</style>
