<template>
  <div class="score-comments-sidebar">
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
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import { IonCardTitle, IonTextarea, IonButton } from '@ionic/vue'

export default defineComponent({
  components: {
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
