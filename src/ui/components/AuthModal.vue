<template>
  <!-- todo: refactor -->
  <div v-show="false">
    <div
      ref="root"
      class="app-modal app-bg"
    >

      <ion-card-header
        color="light"
        class="app-modal-header"
      >
        <ion-card-subtitle style="font-size: 16px;">{{ modalTitles[stage] }}</ion-card-subtitle>
      </ion-card-header>

      <ion-list
        v-if="stage === 0"
        class="app-modal-content"
        lines="full"
      >
        <div
          v-for="[p, available, states] of authMethods"
          :key="p.type"
          class="app-bg"
        >
          <ion-item
            :disabled="!available"
            button
            @click="states.show = !states.show"
          >
            <ion-avatar slot="start">
              <ion-img :src="p.logo" />
            </ion-avatar>
            <ion-label>
              <h2>{{ p.displayName }}</h2>
              <p v-if="p.summary">{{ p.summary }}</p>
            </ion-label>
            <ion-icon
              slot="end"
              class="ion-color-dark dropdown-icon"
              :icon="states.show ? icons.chevronUp : icons.chevronDown"
            />
          </ion-item>

          <ion-item
            class="dropdown-item"
            v-show="states.show"
            v-for="(config, name) in p.inputs"
            :key="name"
          >
            <ion-label position="stacked">{{ config.description }}</ion-label>
            <ion-select
              v-if="config.type == 'select'"
              interface="popover"
              :disabled="config.disabled"
              :value="config.default"
              @ionChange="(e) => states.inputs[name] = e.detail.value"
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
              @ionChange="(e) => states.inputs[name] = e.detail.value"
            />
          </ion-item>

          <ion-item
            v-if="typeof p.createIdentity === 'function'"
            v-show="states.show"
            class="dropdown-item"
            color="secondary"
            button
            detail
            @click="p.createIdentity(states.inputs)"
          >Create Credential</ion-item>

          <ion-item
            v-show="states.show"
            class="dropdown-item"
            color="primary"
            button
            detail
            @click="continueCb(p, states.inputs)"
          >Authenticate</ion-item>
        </div>
      </ion-list>

      <ion-spinner
        v-if="stage === 1"
        color="primary"
        style="align-self: center; flex: 1;"
      />

      <ion-buttons
        v-if="stage === 0 || stage === 2"
        class="app-modal-buttons"
      >
        <ion-button
          color="danger"
          @click="cancelCb"
        >Cancel</ion-button>
        <ion-button
          v-if="stage === 2"
          color="primary"
          @click="continueCb"
        >Continue</ion-button>
      </ion-buttons>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, createApp } from 'vue'
import { IonCardHeader, IonCardSubtitle, IonList, IonItem, IonAvatar, IonImg, IonLabel, IonIcon, IonInput, IonSelect, IonSelectOption, IonSpinner, IonButtons, IonButton } from '@ionic/vue'
import { Identity, listProviders, IdentityProvider, isProviderAvailable } from '@/core/identity'
import { chevronUp, chevronDown } from 'ionicons/icons'

import { showModal } from '../mixins/modal'

/** [provider, available, states] */
type AuthMethod = [IdentityProvider, boolean, object]

export const ERR_USER_ABORTED = new Error('user aborted')

const AuthModal = defineComponent({
  components: {
    IonCardHeader,
    IonCardSubtitle,
    IonList,
    IonItem,
    IonAvatar,
    IonImg,
    IonLabel,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonButtons,
    IonButton,
  },
  data () {
    return {
      modalTitle: '',
      authMethods: [] as AuthMethod[],
      stage: 0,
      continueCb: (() => undefined) as (provider: IdentityProvider, inputs: object) => void,
      cancelCb: (): void => undefined,
      modalTitles: [
        'Select an Authentication Method',
        'Authorizing...',
        'Confirmation',
      ],
      icons: {
        chevronUp,
        chevronDown,
      },
    }
  },
  methods: {
    showModal (): Promise<HTMLIonModalElement> {
      return showModal(this.$refs.root as any, 'app-modal-root')
    },
    async requestIdentity (): Promise<Identity> {
      this.init()
      const modal = await this.showModal()

      try {
        // wait for user response
        const [provider, inputs]: [IdentityProvider, object] = await new Promise((resolve, reject) => {
          this.continueCb = (...args): void => {
            resolve(args)
          }
          this.cancelCb = (): void => {
            reject(ERR_USER_ABORTED)
          }
        })
        this.stage++

        console.info('inputs', { ...inputs })

        // authorizing
        const [identity] = await provider.requestIdentities(inputs as any)

        // load user profile
        const pubKey = await identity.publicKey()
        console.log(pubKey)
        this.stage++

        // wait for user response
        await new Promise((resolve, reject) => {
          this.continueCb = resolve
          this.cancelCb = (): void => {
            reject(ERR_USER_ABORTED)
            // todo: should start over
          }
        })

        return identity
      } finally {
        // close
        await modal.dismiss()
      }
    },
    init (): void {
      this.stage = 0
      this.authMethods = listProviders(false).map(p => {
        const inputFields = Object.keys(p.inputs)
        const inputs = {}
        // assign keys for Vue reactivity hooks
        inputFields.forEach(f => { inputs[f] = p.inputs[f].default })
        return [p, isProviderAvailable(p), { show: false, inputs }]
      })
    },
  },
})

export default AuthModal

export const requestIdentity = async (): Promise<Identity> => {
  // create a void HTML element, and trick Vue 
  // to instantiate the `AuthModal` component
  const voidEl = document.createElement('div')
  const c = createApp(AuthModal)
  const vm = c.mount(voidEl) as InstanceType<typeof AuthModal>

  const identity = await vm.requestIdentity()

  c.unmount(voidEl) // GC

  return identity
}
</script>

<style>
  .app-modal-root {
    --border-radius: 4px;
    --max-width: 25rem;
    --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
    padding: 1em;
  }
</style>

<style scoped>
  .app-modal {
    justify-content: flex-start;
  }

  .app-modal-header {
    border-bottom: var(--app-border);
  }

  .app-modal-content {
    padding: 0;
    overflow-y: auto;
  }

  .app-modal-content > div {
    border-bottom: solid 1px rgba(0, 0, 0, 0.13);
  }

  .app-modal-buttons {
    margin-top: auto;
    border-top: var(--app-border);
    justify-content: space-between;
  }

  .app-modal-buttons > ion-button {
    margin: 0;
  }

  .dropdown-item {
    margin-left: 2em;
    --border-width: 0 0 1px 2px;
    /* --background: #d7d8da; */
  }

  .dropdown-icon {
    color: var(--ion-color-base);
    font-size: 1.2em;
  }
</style>
