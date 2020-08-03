
import { printTime } from '@/utils'

export const PrintTimeMixin = {
  methods: {
    printTime (ms: number): string {
      return printTime(ms)
    },
  },
}
