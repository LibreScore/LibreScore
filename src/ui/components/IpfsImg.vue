<template>
  <img :src="blobUrl || fallbackUrl">
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { IPFS } from 'ipfs'
import CID from 'cids'

import { ipfsFetch } from '@/ipfs'

export default defineComponent({
  props: {
    ipfs: {
      type: undefined as any as PropType<IPFS>,
      required: true,
    },
    cid: {
      type: undefined as any as PropType<CID>,
    },
    fallbackUrl: {
      type: String,
    },
  },
  data () {
    return {
      blobUrl: '',
    }
  },
  methods: {
    /**
     * @returns blob url
     */
    async loadFromIpfs (cid: CID): Promise<string> {
      const data = await ipfsFetch(cid, this.ipfs)
      const blob = new Blob([data])
      return URL.createObjectURL(blob)
    },
    cleanUp (): void {
      if (this.blobUrl) {
        URL.revokeObjectURL(this.blobUrl)
        this.blobUrl = ''
      }
    },
    async update (): Promise<void> {
      if (this.cid) {
        this.blobUrl = await this.loadFromIpfs(this.cid)
      } else {
        this.cleanUp()
      }
    },
  },
  watch: {
    cid: 'update',
  },
  async created () {
    await this.update()
  },
  beforeUnmount () {
    // clean up
    this.cleanUp()
  },
})
</script>
