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
          :mscz="mscz"
          @metadata-ready="(m) => metadata = m"
        >
          <template #headerBar="slotProps">
            <score-header-bar
              :actions="slotProps.actions"
              :scoreTitle="_scorepack /* retrieving scorepack */ ? scoreTitle : LOADING"
              :scoreSummary="scoreSummary"
            ></score-header-bar>
          </template>
        </score-view-main>
      </ion-col>

      <ion-col
        size="12"
        size-lg
        id="score-view-right"
        class="app-bg"
      >
        <score-info
          :description="description"
          :userShortId="user && user.shortId"
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
import { defineComponent } from 'vue'

import { IonGrid, IonRow, IonCol } from '@ionic/vue'
import ScoreViewMain from './ScoreViewMain.vue'
import ScoreHeaderBar from './ScoreHeaderBar.vue'
import ScoreInfo from './ScoreInfo.vue'
import ScoreComments from './ScoreComments.vue'

import type { ScoreMetadata } from 'webmscore/schemas'
import ScorePack from '@/core/scorepack'
import { fromCid as loadScorePack } from '@/core/scorepack/load'
import { resolveUserProfile, UserProfile } from '@/core/identity'
import { ipfsFetch } from '@/ipfs'

export default defineComponent({
  inject: [
    'ipfs',
  ],
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
    cid: {
      type: String,
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

      LOADING: 'Loading...',
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
    cid: 'init',
  },
  methods: {
    async init (): Promise<void> {
      // reset 
      this.mscz = undefined
      this._scorepack = undefined
      this.user = undefined
      this.metadata = undefined

      try {
        this._scorepack = await loadScorePack(this.cid, this['ipfs'])
        if (!this._scorepack) throw new Error('No ScorePack')

        this.mscz = ipfsFetch(this._scorepack.score, this['ipfs'])

        for await (const profile of resolveUserProfile(this._scorepack._sig!.publicKey, this['ipfs'])) {
          this.user = profile
        }
      } catch (err) {
        console.error(err)
      }
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
  }

  /** ionic breakpoint: lg */
  @media (min-width: 992px) {
    #score-view-right {
      height: 100%;
    }
  }
</style>
