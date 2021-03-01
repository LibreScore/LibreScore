
<template>
  <div class="user-profile-box">
    <ion-list>
      <ion-item>

        <ion-avatar
          slot="end"
          class="user-avatar"
        >
          <ipfs-img
            :ipfs="ipfs"
            :cid="userAvatar"
            :fallbackUrl="fallbackUserAvatar"
            :alt="'profile picture of user ' + userShortId"
          />
        </ion-avatar>

        <ion-grid>

          <ion-row>
            <ion-col size="4">
              <ion-note>{{ $t("UserProfile.shortId") }}</ion-note>
            </ion-col>
            <ion-col>
              <ion-text color="primary">{{ userShortId }}</ion-text>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col size="4">
              <ion-note>{{ $t("UserProfile.fullId") }} <br>({{ $t("UserProfile.ipnsKeyId") }})</ion-note>
            </ion-col>
            <ion-col>
              <ion-text>{{ userFullId }}</ion-text>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col size="4">
              <ion-note>{{ $t("UserProfile.username") }}</ion-note>
            </ion-col>
            <ion-col>
              {{ userName }}
            </ion-col>
          </ion-row>

        </ion-grid>

      </ion-item>
    </ion-list>

    <div
      class="box-footer"
      v-if="status === 'loading'"
    >
      <ion-note class="text-center">{{ $t("UserProfile.fetching") }}</ion-note>
      <ion-progress-bar type="indeterminate"></ion-progress-bar>
    </div>

    <div
      class="box-footer"
      v-else-if="status === 'error'"
    >
      <ion-note class="text-center">{{ $t("UserProfile.error") }}</ion-note>
      <ion-progress-bar
        color="danger"
        :value="1"
      ></ion-progress-bar>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { normalizeKey, id } from '@/identity/pubkey'

import { IonList, IonItem, IonAvatar, IonGrid, IonRow, IonCol, IonNote, IonText, IonProgressBar } from '@ionic/vue'
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
    IonList,
    IonItem,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonText,
    IonProgressBar,
    IpfsImg,
  },
  data () {
    return {
      userFullId: '',
    }
  },
  watch: {
    async profile (): Promise<void> {
      if (this.publicKey) {
        const key = normalizeKey(this.publicKey)
        this.userFullId = await id(key, true)
      }
    },
  },
})
</script>

<style scoped>
  .user-profile-box {
    background: #ffffff;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
  }

  .user-profile-box ion-text {
    word-break: break-all;
  }

  .user-avatar {
    --size: 4em;
    height: var(--size);
    width: var(--size);
  }

  .box-footer {
    margin-top: auto;
  }
</style>
