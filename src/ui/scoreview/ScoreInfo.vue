
<template>
  <ion-toolbar
    color="light"
    class="score-info-sidebar"
  >
    <ion-grid>

      <ion-row v-if="userPublicKey">
        <ion-col size="4">
          <ion-note>Uploader</ion-note>
        </ion-col>
        <ion-col>
          <user-chip :publicKey="userPublicKey" />
        </ion-col>
      </ion-row>

      <ion-row v-if="tags">
        <ion-col size="4">
          <ion-note>Tags</ion-note>
        </ion-col>
        <ion-col>
          <ion-badge
            v-for="tag of tags"
            :key="tag"
            class="score-tag"
          >{{ tag }}</ion-badge>
        </ion-col>
      </ion-row>

      <ion-row v-if="date">
        <ion-col size="4">
          <ion-note>Upload Date</ion-note>
        </ion-col>
        <ion-col>
          <ion-note>{{ fmtDate(date) }}</ion-note>
        </ion-col>
      </ion-row>

      <ion-row v-if="instruments && instruments.length">
        <ion-col size="4">
          <ion-note>Instruments</ion-note>
        </ion-col>
        <ion-col>
          <ion-note>{{ instruments.join(', ') }}</ion-note>
        </ion-col>
      </ion-row>

      <ion-row v-if="pages">
        <ion-col size="4">
          <ion-note>Pages</ion-note>
        </ion-col>
        <ion-col>
          <ion-note>{{ pages }}</ion-note>
        </ion-col>
      </ion-row>

      <ion-row v-if="duration">
        <ion-col size="4">
          <ion-note>Duration</ion-note>
        </ion-col>
        <ion-col>
          <ion-note>{{ printTime(duration) }}</ion-note>
        </ion-col>
      </ion-row>

      <ion-row style="margin-bottom: 0.5em;">
        <ion-col>
          <ion-item-divider
            color="light"
            class="ion-no-padding"
          >
            <ion-note style="position: relative; bottom: -1em;">
              Description
            </ion-note>
          </ion-item-divider>
        </ion-col>
      </ion-row>
      <ion-row style="margin-bottom: 0;">
        <ion-col>
          <ion-note>{{ description }}</ion-note>
        </ion-col>
      </ion-row>

    </ion-grid>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { ScoreMetadata } from 'webmscore/schemas'
import { UserPubKeyType } from '@/identity'

import { IonToolbar, IonGrid, IonRow, IonCol, IonNote, IonBadge, IonItemDivider } from '@ionic/vue'
import UserChip from '../components/UserChip.vue'
import { PrintTimeMixin, FmtTimeMixin } from '../mixins/str-fmt'

export default defineComponent({
  inject: [
    'ipfs',
  ],
  mixins: [
    PrintTimeMixin,
    FmtTimeMixin,
  ],
  components: {
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonBadge,
    IonItemDivider,
    UserChip,
  },
  props: {
    description: {
      type: String,
    },
    /** uploader */
    userPublicKey: {
      type: undefined as any as PropType<UserPubKeyType>,
    },
    /** Tags */
    tags: {
      type: Array as PropType<string[]>,
    },
    /** Upload Date */
    date: {
      type: Date,
    },
    /** 
     * The score metadata json
     * can retrieve Instruments, Pages, Duration info from it
     */
    metadata: {
      type: Object as PropType<ScoreMetadata>,
    },
  },
  computed: {
    instruments (): string[] {
      return []
    },
    pages (): number | undefined {
      return this.metadata?.pages
    },
    /** score duration in ms */
    duration (): number | undefined {
      if (!this.metadata) return
      return this.metadata.duration * 1000 // convert to ms
    },
  },
})
</script>

<style scoped>
  .score-info-sidebar {
    padding: 2em;
  }

  .score-info-sidebar ion-row {
    margin-bottom: 1em;
  }

  /** ionic breakpoint: lg */
  @media (max-width: 991px) {
    .score-info-sidebar {
      border-top: var(--app-border);
    }
  }

  .score-tag {
    --background: #6c757d;
    margin-right: 0.5em;
  }
</style>
