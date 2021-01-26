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
import { IPFS_CLIENT_INFURA, IPFS_CLIENT_IPFS_IO } from '@/ipfs'
import { IDENTITY } from '@/core/identity/textile'
import { COLLECTION } from '@/core/indexing/db'
import { WebMscoreLoad } from '@/mscore/init'
import IPFS from 'ipfs/src/components'
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
      const collection = await COLLECTION
      // const title = 'title 0'
      const summary = 'summary 0'
      const description = 'description 0'
      const stream = IPFS_CLIENT_INFURA.cat('QmPgL722H8bxzp5sgCrFNgAVTvA7EDdKm8gZcwwCvJXXi7')
      let chunks = ''

      for await (const chunk of stream) {
        // chunks of data are returned as a Buffer, convert it back to a string
        chunks += chunk.toString()
      }

      const data = new Uint8Array(chunks.split(',').map(Number))
      console.log(data)

      // generate score metadata and thumbnail
      const mscore = await WebMscoreLoad(data)
      const metadata = await mscore.metadata()
      const title = metadata.title
      console.log(metadata)
      const thumbnail = await mscore.savePng(0)
      const thumbnailCid = (await IPFS_CLIENT_INFURA.add(thumbnail)).cid
      console.log(thumbnailCid)

      // upload to IPFS
      const { cid } = await IPFS_CLIENT_INFURA.block.get('QmPgL722H8bxzp5sgCrFNgAVTvA7EDdKm8gZcwwCvJXXi7')
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
      //   IPFS_CLIENT_INFURA.pin.add(packCid),
        IPFS_CLIENT_INFURA.pin.add(thumbnailCid),
      ])
      // go to the page
      this.$router.push('/')
    },
  },
})
</script>

<style scoped>
</style>
