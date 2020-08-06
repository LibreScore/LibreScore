<template>
  <ion-toolbar
    color="light"
    class="score-comments-sidebar"
  >
    <ion-card-title style="font-size: 16px;">
      Comments
    </ion-card-title>

    <ion-textarea
      class="app-textarea"
      placeholder="Write your comment here!"
    ></ion-textarea>

    <ion-button
      class="app-btn submit-btn"
      color="primary"
      size="small"
      :disabled="true"
    >Submit</ion-button>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IonToolbar, IonCardTitle, IonTextarea, IonButton } from '@ionic/vue'

export default defineComponent({
  components: {
    IonToolbar,
    IonCardTitle,
    IonTextarea,
    IonButton,
  },
})
</script>

<style scoped>
  .score-comments-sidebar {
    padding: 2em;
    border-top: var(--app-border);
  }

  .submit-btn {
    --padding-start: 2em;
    --padding-end: var(--padding-start);
  }

  .app-textarea {
    font-size: 13px;
  }
</style>
