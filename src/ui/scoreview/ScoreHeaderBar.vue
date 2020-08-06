<template>
  <ion-toolbar
    color="light"
    class="header-bar"
  >
    <ion-grid class="ion-no-padding">
      <ion-row>
        <ion-col
          size-md="7"
          style="margin-bottom: 1em;"
        >
          <ion-title size="large">
            <span class="score-title">{{ scoreTitle }}</span>
            <br>
            <ion-note>
              {{ scoreSummary }}
            </ion-note>
          </ion-title>
        </ion-col>

        <ion-col
          size="12"
          size-md
        >
          <ion-grid class="ion-no-padding">
            <ion-row
              v-for="(group, i) of actions"
              :key="'actions' + i"
            >
              <ion-col
                v-for="action of group"
                :key="'actions' + i + action.label"
              >
                <ion-button
                  class="app-btn header-bar-btn"
                  :disabled="action.disabled"
                  :color="i == 0 ? 'primary' : undefined"
                  :style="i !== 0 ? {'--background':'#D0D7DE','--color':'#424242'} : {}"
                  expand="block"
                  size="small"
                  @click="(e) => onClick(e, action)"
                >{{ action.label }}</ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-col>

      </ion-row>
    </ion-grid>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonToolbar, IonGrid, IonRow, IonCol, IonButton, IonTitle, IonNote } from '@ionic/vue'
import { Action } from '../components/ActionList.vue'

export type ActionGroups = Action[]

export default defineComponent({
  components: {
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonTitle,
    IonNote,
  },
  props: {
    actions: {
      type: Array as PropType<ActionGroups>,
    },
    /**
     * score `title` from the *ScorePack*
     */
    scoreTitle: {
      type: String,
      required: true,
      default: ' ', // em space
    },
    /**
     * score `summary` from the *ScorePack*
     */
    scoreSummary: {
      type: String,
    },
  },
  data () {
    return {
    }
  },
  methods: {
    /**
     * Disable the button when processing
     */
    async onClick (e: MouseEvent, action: Action): Promise<void> {
      const el = e.target as HTMLIonButtonElement
      el.disabled = true
      await action.fn()
      el.disabled = false
    },
  },
})
</script>

<style scoped>
  .header-bar {
    border-bottom: var(--app-border);
    padding: 2em;
  }

  .header-bar-btn {
    margin: 0.5em;
  }

  .score-title {
    font-weight: 700;
    letter-spacing: 0.5px;
    font-size: 22px;
    display: inline-block;
    white-space: normal;
  }
</style>
