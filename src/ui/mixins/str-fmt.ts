
import { printTime, fmtDate } from '@/utils/fmt'

export const PrintTimeMixin = {
  methods: {
    printTime (ms: number): string {
      return printTime(ms)
    },
  },
}

export const FmtTimeMixin = {
  methods: {
    fmtDate (date: Date): string {
      return fmtDate(date)
    },
  },
}
