<template>
  <ion-item
    button
    @click="onClick"
  >
    <ion-label>
      <slot></slot>
    </ion-label>

    <ion-spinner
      v-if="loading"
      color="primary"
    ></ion-spinner>
  </ion-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonLabel, IonItem, IonSpinner } from '@ionic/vue'

export default defineComponent({
  components: {
    IonLabel,
    IonItem,
    IonSpinner,
  },
  props: {
    actionFn: {
      type: Function as PropType<() => void | Promise<void>>,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async onClick (): Promise<void> {
      this.loading = true
      try {
        await this.actionFn()
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
  },
})
</script>
