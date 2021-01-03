
import type WebMscore from 'webmscore'
import { fetchData } from '../utils'

import { FluidR3Mono as SF3_URL } from '@librescore/sf3'
import { CN as FONT_URL_CN, KR as FONT_URL_KR } from '@librescore/fonts'

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
  // async import 
  const WebMscore = (await import('webmscore')).default

  // load wasm and the data file
  await WebMscore.ready

  const mscore = await WebMscore.load(
    'mscz',
    mscz,
    await loadFonts(), // load CJK fonts
  )

  // async load the SoundFont file
  // eslint-disable-next-line @typescript-eslint/no-floating-promises, @typescript-eslint/no-use-before-define
  void WebMscoreSoundFont(mscore)

  return mscore
}

const SOUND_FONT_LOADED = Symbol('SoundFont loaded')

/**
 * Attach the SoundFont (.sf3) file to the mscore instance 
 */
export const WebMscoreSoundFont = (mscore: WebMscore): Promise<void> => {
  if (!mscore[SOUND_FONT_LOADED]) {
    const loadPromise = (async (): Promise<void> => {
      await mscore.setSoundFont(
        await loadSoundFont(),
      )
    })()
    mscore[SOUND_FONT_LOADED] = loadPromise
  }

  return mscore[SOUND_FONT_LOADED] as Promise<void>
}
