
import { printTime } from './index'

export const printTimeMixin = {
  methods: {
    printTime (ms: number): string {
      return printTime(ms)
    },
  },
}
