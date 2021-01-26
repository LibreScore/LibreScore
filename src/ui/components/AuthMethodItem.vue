<template>
  <div class="app-bg auth-method-container">
    <ion-item
      :disabled="!available"
      button
      @click="show = !show"
    >
      <ion-avatar slot="start">
        <ion-img :src="provider.logo" />
      </ion-avatar>
      <ion-label>
        <h2>{{ provider.displayName }}</h2>
        <p
          v-if="provider.summary"
          class="item-summary"
        >{{ provider.summary }}</p>
      </ion-label>
      <ion-icon
        slot="end"
        class="ion-color-dark dropdown-btn"
        :icon="show ? icons.chevronUp : icons.chevronDown"
      />
    </ion-item>

    <ion-item
      class="dropdown-item"
      v-show="show"
      v-for="(config, name) in provider.inputs"
      :key="name"
    >
      <ion-label position="stacked">{{ config.description }}</ion-label>
      <ion-select
        v-if="config.type == 'select'"
        interface="popover"
        :disabled="config.disabled"
        :value="config.default"
        @ionChange="(ev) => onValueChange(name, ev)"
      >
        <ion-select-option
          v-for="o of config.options"
          :value="o"
          :key="o"
        >{{ o }}</ion-select-option>
      </ion-select>
      <ion-input
        v-else
        :placeholder="config.placeholder"
        :disabled="config.disabled"
        :required="config.required"
        :value="config.default"
        @ionChange="(ev) => onValueChange(name, ev)"
      />
    </ion-item>

    <ion-item
      v-if="typeof provider.createIdentity === 'function'"
      v-show="show"
      class="dropdown-item"
      color="secondary"
      button
      detail
      @click="provider.createIdentity(providerOptions)"
    >Create Credential</ion-item>

    <ion-item
      v-show="show"
      class="dropdown-item"
      color="primary"
      button
      detail
      @click="continueCb(provider, providerOptions)"
    >Authenticate</ion-item>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IonItem, IonAvatar, IonImg, IonLabel, IonIcon, IonInput, IonSelect, IonSelectOption } from '@ionic/vue'
import { chevronUp, chevronDown } from 'ionicons/icons'
import { IdentityProvider, isProviderAvailable } from '@/identity/provider'

type ProviderOptions = Record<string, string | undefined>

export default defineComponent({
  components: {
    IonItem,
    IonAvatar,
    IonImg,
    IonLabel,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
  },
  props: {
    provider: {
      type: undefined as any as PropType<IdentityProvider>,
      required: true,
    },
  },
  emits: [
    'continue',
  ],
  data () {
    return {
      show: false,
      providerOptions: {} as ProviderOptions,
      icons: {
        chevronUp,
        chevronDown,
      },
    }
  },
  computed: {
    available (): boolean {
      return isProviderAvailable(this['provider'])
    },
  },
  watch: {
    provider: 'initProviderOptions',
  },
  methods: {
    onValueChange (name: string, ev): void {
      this.providerOptions[name] = ev.detail.value
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    initProviderOptions () {
      const inputConfigs = this.provider.inputs
      const inputFields = Object.keys(inputConfigs)
      const inputs: ProviderOptions = {}

      // assign keys for Vue reactivity hooks
      inputFields.forEach(f => { inputs[f] = inputConfigs[f].default })

      this.providerOptions = inputs
    },
    continueCb (provider: IdentityProvider, providerOptions: ProviderOptions): void {
      this.$emit('continue', provider, providerOptions)
    },
  },
  created () {
    this.initProviderOptions()
  },
})
</script>

<style scoped>
  .auth-method-container {
    border-bottom: solid 1px rgba(0, 0, 0, 0.13);
  }
  body.dark .auth-method-container {
    border-bottom: solid 1px rgba(255, 255, 255, 0.13);
  }

  .dropdown-item {
    margin-left: 2em;
    --border-width: 0 0 1px 2px;
  }

  .dropdown-btn {
    color: var(--ion-color-base);
    font-size: 1.2em;
  }

  .item-summary {
    white-space: normal;
  }
</style>
