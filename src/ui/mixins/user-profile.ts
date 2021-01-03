
import { defineComponent, PropType } from 'vue'

import type CID from 'cids'
import { UserPubKeyType } from '@/identity'
import { FALLBACK_AVATAR, resolveUserProfile, UserProfile } from '@/identity/user-profile'

/**
 * Require `this.ipfs` on component
 */
export const UserProfileMixin = defineComponent({
  props: {
    publicKey: {
      type: undefined as any as PropType<UserPubKeyType>,
      required: true,
    },
  },
  data () {
    return {
      profile: undefined as UserProfile | undefined,
      status: '',
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
      this.status = 'loading'

      try {
        for await (const profile of resolveUserProfile(this.publicKey, this['ipfs'])) {
          this.profile = profile
        }
      } catch (err) {
        this.status = 'error'
        throw err
      }

      this.status = 'loaded'
    },
  },
  created () {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.init()
  },
})

export default UserProfileMixin
