<template>
  <ion-grid
    class="ion-no-padding"
    style="height: 100%;"
  >
    <ion-row style="height: 100%;">
      <ion-col
        size-lg="9"
        id="score-view-left"
      >
        <score-view-main
          v-if="mscz"
          :mscz="mscz"
          @metadata-ready="(m) => metadata = m"
        >
          <template #headerBar="slotProps">
            <score-header-bar
              :actions="slotProps.actions"
              :scoreTitle="scoreTitle"
              :scoreSummary="scoreSummary"
            ></score-header-bar>
          </template>
        </score-view-main>
      </ion-col>

      <ion-col
        size="12"
        size-lg
        id="score-view-right"
        class="ion-color-light"
      >
        <score-info
          :description="description"
          :userAvatar="user && user.avatar"
          :userName="user && user.name"
          :userUrl="user && user.url"
          :tags="tags"
          :date="date"
          :metadata="metadata"
        ></score-info>
        <score-comments></score-comments>
      </ion-col>
    </ion-row>
  </ion-grid>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

import { IonGrid, IonRow, IonCol } from '@ionic/vue'
import ScoreViewMain from './ScoreViewMain.vue'
import ScoreHeaderBar from './ScoreHeaderBar.vue'
import ScoreInfo from './ScoreInfo.vue'
import ScoreComments from './ScoreComments.vue'

import type { ScoreMetadata } from 'webmscore/schemas'
import ScorePack from '@/core/scorepack'
import { resolveUserProfile, UserProfile } from '@/core/identity/name'
import { ipfsFetch, IPFS_CLIENT_INFURA } from '@/ipfs'

export default defineComponent({
  components: {
    IonGrid,
    IonRow,
    IonCol,
    ScoreViewMain,
    ScoreHeaderBar,
    ScoreInfo,
    ScoreComments,
  },
  props: {
    scorepack: {
      type: undefined as any as PropType<Promise<ScorePack>>,
      required: true,
    },
  },
  data () {
    return {
      // eslint-disable-next-line vue/no-reserved-keys
      _scorepack: undefined as ScorePack | undefined,
      user: undefined as UserProfile | undefined,
      mscz: undefined as Promise<Uint8Array> | undefined,
      metadata: undefined as ScoreMetadata | undefined,
    }
  },
  computed: {
    scoreTitle (): string | undefined {
      return this._scorepack?.title
    },
    scoreSummary (): string | undefined {
      return this._scorepack?.summary
    },
    description (): string | undefined {
      return this._scorepack?.description
    },
    tags (): string[] | undefined {
      return this._scorepack?.tags
    },
    date (): Date | undefined {
      if (!this._scorepack) return // no scorepack
      const date = new Date(this._scorepack.updated)
      if (isNaN(date.valueOf())) return // Invalid Date
      return date
    },
  },
  watch: {
    scorepack: 'init',
  },
  methods: {
    async init (): Promise<void> {
      this._scorepack = await this.scorepack
      if (!this._scorepack) throw new Error('No ScorePack')

      this.mscz = ipfsFetch(this._scorepack.score, IPFS_CLIENT_INFURA)
      this.user = await resolveUserProfile(this._scorepack)
    },
  },
  created (): Promise<void> {
    return this.init()
  },
})
</script>

<style scoped>
  #score-view-left {
    height: 100%;
  }

  /** ionic breakpoint: lg */
  @media (min-width: 992px) {
    #score-view-left {
      border-right: var(--app-border);
    }
  }

  #score-view-right {
    overflow-y: auto;
    background: var(--ion-color-base);
  }

  /** ionic breakpoint: lg */
  @media (min-width: 992px) {
    #score-view-right {
      height: 100%;
    }
  }
</style>
