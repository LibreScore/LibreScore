
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
import { defineComponent } from 'vue'
import { IonChip, IonAvatar, IonLabel, IonText } from '@ionic/vue'
import IpfsImg from '../components/IpfsImg.vue'
import { UserProfileMixin } from '../mixins/user-profile'

export default defineComponent({
  inject: [
    'ipfs',
  ],
  mixins: [
    UserProfileMixin,
  ],
  components: {
    IonChip,
    IonAvatar,
    IonLabel,
    IonText,
    IpfsImg,
  },
})
</script>
