
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type WebMscore from 'webmscore'
import { fetchData } from './'

const FONT_URLS = [
  process.env.VUE_APP_FONT_URL_CN,
  process.env.VUE_APP_FONT_URL_KR,
]
const SF3_URL = process.env.VUE_APP_SF3_URL

let fonts: Promise<Uint8Array[]> | undefined
let soundfont: Promise<Uint8Array> | undefined

/**
 * Load fonts with cache
 */
export const loadFonts = (): Promise<Uint8Array[]> => {
  if (!fonts) {
    fonts = Promise.all(
      FONT_URLS.map(u => fetchData(u as string)),
    )
  }

  return fonts
}

/**
 * Load the SoundFont (.sf3) file with cache
 */
export const loadSoundFont = (): Promise<Uint8Array> => {
  if (!soundfont) {
    soundfont = fetchData(SF3_URL as string)
  }
  return soundfont
}

/**
 * Load WebMscore, and create an instance from the mscz score file
 */
export const WebMscoreLoad = async (mscz: Uint8Array): Promise<WebMscore> => {
  // async import 
  const WebMscore = (await import('webmscore')).default

  // load wasm and the data file
  await WebMscore.ready

  const mscore = await WebMscore.load(
    'mscz',
    mscz,
    await loadFonts(), // load CJK fonts
  )

  // load the SoundFont file
  await mscore.setSoundFont(
    await loadSoundFont(),
  )

  return mscore
}
