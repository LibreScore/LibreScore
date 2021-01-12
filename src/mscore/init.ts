
import type WebMscore from 'webmscore'
import { fetchData } from '../utils'

import { FluidR3Mono as SF3_URL } from '@librescore/sf3/cdn'
import { CN as FONT_URL_CN, KR as FONT_URL_KR } from '@librescore/fonts/cdn'

const FONT_URLS = [
  FONT_URL_CN,
  FONT_URL_KR,
]

/**
 * Load fonts
 */
const loadFonts = (): Promise<Uint8Array[]> => {
  return Promise.all(
    FONT_URLS.map(u => fetchData(u as string, {
      cache: 'force-cache',
    })),
  )
}

/**
 * Load the SoundFont (.sf3) file
 */
const loadSoundFont = (): Promise<Uint8Array> => {
  return fetchData(SF3_URL as string, {
    cache: 'force-cache',
  })
}

/**
 * Load WebMscore, and create an instance from the mscz score file
 */
export const WebMscoreLoad = async (mscz: Uint8Array): Promise<WebMscore> => {
  // async load the SoundFont file
  const soundfontPromise = loadSoundFont()
  // async load CJK fonts
  const fontsPromise = loadFonts()

  // async import 
  const WebMscore = (await import('webmscore')).default

  // load wasm and the data file
  const mscore = await WebMscore.load(
    'mscz',
    mscz,
    fontsPromise, // CJK fonts
  )

  // attach the SoundFont loading promise to the mscore instance
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  void attachSoundFont(mscore, soundfontPromise)

  return mscore
}

const SOUND_FONT_LOADED = Symbol('SoundFont loaded')

const attachSoundFont = (mscore: WebMscore, soundfontPromise: Promise<Uint8Array>) => {
  const loadPromise = (async (): Promise<void> => {
    await mscore.setSoundFont(
      await soundfontPromise,
    )
  })()
  mscore[SOUND_FONT_LOADED] = loadPromise
}

/**
 * Ensure the SoundFont (.sf3) file is loaded to the mscore instance 
 */
export const soundFontReady = (mscore: WebMscore): Promise<void> => {
  if (!mscore[SOUND_FONT_LOADED]) {
    attachSoundFont(mscore, loadSoundFont())
  }
  return mscore[SOUND_FONT_LOADED] as Promise<void>
}
