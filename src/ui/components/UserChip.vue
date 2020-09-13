
<template>
  <a
    :href="userUrl"
    target="_blank"
  >
    <ion-chip class="ion-no-margin">
      <ion-avatar>
        <ipfs-img
          :ipfs="ipfs"
          :cid="userAvatar"
          :fallbackUrl="fallbackUserAvatar"
        />
      </ion-avatar>
      <ion-label class="ion-text-center">
        <template v-if="userName">
          {{ userName }}
          <br>
        </template>
        <ion-text color="primary">{{ userShortId }}</ion-text>
      </ion-label>
    </ion-chip>
  </a>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type CID from 'cids'
import { FALLBACK_AVATAR, resolveUserProfile, UserProfile, UserPubKeyType } from '@/identity'

import { IonChip, IonAvatar, IonLabel, IonText } from '@ionic/vue'
import IpfsImg from '../components/IpfsImg.vue'

export default defineComponent({
  inject: [
    'ipfs',
  ],
  components: {
    IonChip,
    IonAvatar,
    IonLabel,
    IonText,
    IpfsImg,
  },
  props: {
    publicKey: {
      type: undefined as any as PropType<UserPubKeyType>,
      required: true,
    },
  },
  data () {
    return {
      profile: undefined as UserProfile | undefined,
      fallbackUserAvatar: FALLBACK_AVATAR,
    }
  },
  computed: {
    userShortId (): string | undefined {
      return this.profile?.shortId
    },
    userName (): string | undefined {
      return this.profile?.name
    },
    userAvatar (): CID | undefined {
      return this.profile?.avatar
    },
    userUrl (): string | undefined {
      return this.profile?.url
    },
  },
  watch: {
    publicKey: 'init',
  },
  methods: {
    async init (): Promise<void> {
      // reset 
      this.profile = undefined

      for await (const profile of resolveUserProfile(this.publicKey, this['ipfs'])) {
        this.profile = profile
      }
    },
  },
  created () {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init()
  },
})
</script>
