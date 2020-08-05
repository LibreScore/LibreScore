<template>
  <ion-list>
    <template v-for="group of groups">
      <ion-item-divider :key="group.name">
        <ion-label>
          {{ group.name }}
        </ion-label>
      </ion-item-divider>

      <template v-for="(action, i) of group.list">
        <action-item
          :lines="i + 1 >= group.list.length ? 'none' : undefined"
          :actionFn="action.fn"
          :key="group.name + action.label"
        >{{ action.label }}</action-item>
      </template>
    </template>
  </ion-list>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonList, IonItemDivider, IonLabel } from '@ionic/vue'

import ActionItem from './ActionItem.vue'

export interface Action {
  label: string;
  fn: () => void | Promise<void>;
  disabled?: boolean;
}

export interface Actions {
  [groupName: string]: Action[];
}

export default defineComponent({
  components: {
    IonList,
    IonItemDivider,
    IonLabel,
    ActionItem,
  },
  props: {
    actions: {
      type: Object as PropType<Actions>,
      required: true,
    },
  },
  computed: {
    groups (): { name: string; list: Action[] }[] {
      return Object.keys(this.actions).map((k) => {
        return {
          name: k,
          list: this.actions[k],
        }
      })
    },
  },
})
</script>
