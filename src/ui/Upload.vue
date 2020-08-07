<template>
  <ion-toolbar>
    <ion-list>
      <ion-list-header lines="full">
        <ion-title size="large">Upload</ion-title>
      </ion-list-header>

      <ion-item>
        <ion-label position="stacked">
          MSCZ File <ion-text color="danger">*</ion-text>
        </ion-label>
        <ion-input
          type="file"
          ref="file-input"
          accept=".mscz"
        ></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">
          Title <ion-text color="danger">*</ion-text>
        </ion-label>
        <ion-input ref="title-input"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">
          Summary
        </ion-label>
        <ion-input ref="summary-input"></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="stacked">
          Description
        </ion-label>
        <ion-textarea ref="description-input"></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-button
          expand="block"
          size="default"
          @click="onSubmit"
        >Submit</ion-button>
      </ion-item>
    </ion-list>
  </ion-toolbar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { readBlob } from '@/utils'
import { ScorePack } from '@/core/scorepack'
import { IPFS_CLIENT_INFURA } from '@/ipfs'
import { IDENTITY } from '@/core/identity/textile'
import { COLLECTION } from '@/core/indexing/db'
import { WebMscoreLoad } from '@/mscore'

export default defineComponent({
  data () {
    return {

    }
  },
  methods: {
    async onSubmit (): Promise<void> {
      /**
       * DEMO ONLY
       * @todo
       */
      const title = (this.$refs['title-input'] as any).value
      const summary = (this.$refs['summary-input'] as any).value
      const description = (this.$refs['description-input'] as any).value

      const fileInput = (this.$refs['file-input'] as any).querySelector('.native-input') as HTMLInputElement
      const mscz = await readBlob(fileInput.files![0])

      console.log(mscz, title, summary, description)

      // upload to IPFS
      const { cid } = await IPFS_CLIENT_INFURA.add(mscz)
      console.info(cid)

      const t = new Date().toISOString()
      const scorepack = new ScorePack({
        score: cid,
        title,
        description,
        summary,
        updated: t,
      })
      const blockData = await scorepack.flush(IDENTITY)
      const block = await IPFS_CLIENT_INFURA.block.put(blockData, {
        format: 'cbor',
      })
      const packCid = block._cid
      console.log(packCid)

      // generate score metadata and thumbnail
      const mscore = await WebMscoreLoad(mscz)
      const metadata = await mscore.metadata()
      console.log(metadata)
      const thumbnail = await mscore.savePng(0)
      const thumbnailCid = (await IPFS_CLIENT_INFURA.add(thumbnail)).cid
      console.log(thumbnailCid)

      // build index
      const collection = await COLLECTION
      await collection.insert({
        _id: '',
        scorepack: packCid.toString(),
        thumbnail: thumbnailCid.toString(),
        title,
        duration: metadata.duration | 0,
        npages: metadata.pages | 0,
        updated: (+t / 1000) | 0,
      })

      await Promise.all([
        IPFS_CLIENT_INFURA.pin.add(packCid),
        IPFS_CLIENT_INFURA.pin.add(thumbnailCid),
      ])

      // go to the page
      this.$router.push(`/score/${packCid}`)
    },
  },
})
</script>

<style scoped>
</style>
