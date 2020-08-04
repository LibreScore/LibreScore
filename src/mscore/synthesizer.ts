/* eslint-disable @typescript-eslint/no-floating-promises */

import type WebMscore from 'webmscore'
import type { SynthRes } from 'webmscore/schemas'
import type { PromiseType } from 'utility-types'
import createTree from 'functional-red-black-tree'
import { sleep } from '@/utils'

type SynthFn = PromiseType<ReturnType<WebMscore['synthAudio']>>

export interface AudioFragment {
  startTime: number; // in seconds
  endTime: number;
  audioBuffer: AudioBuffer;
}

/**
 * Audio synthesizer with cache  
 * (using Web Audio API)
 */
export class Synthesizer {
  private readonly CHANNELS = 2;
  private readonly FRAME_LENGTH = 512;
  private readonly SAMPLE_RATE = 44100; // 44.1 kHz

  private readonly BATCH_SIZE = 20;
  /**
   * The duration (s) of one AudioFragment  
   * ~ 0.0116 s * `BATCH_SIZE`
   */
  private readonly FRAGMENT_DURATION = (this.FRAME_LENGTH / this.SAMPLE_RATE) * this.BATCH_SIZE;

  /**
   * index time positions (in seconds) to AudioFragments
   * (immutable)
   */
  private cache = createTree();

  public worklet: { cancel (): Promise<void> } | undefined;

  public speed = 1.0;

  constructor (
    private readonly mscore: WebMscore,
    /** the score's duration **in seconds** */
    private readonly duration: number,
    /** the current playback time **in seconds** */
    public time = 0,
    private readonly audioCtx = new AudioContext(),
  ) { }

  /**
   * Synthesize audio fragments
   * @param onReady called once the synth function is ready
   * @param onUpdate called each time a fragment is processed, or error triggered
   */
  async startSynth (startTime: number, onUpdate?: (fragment: AudioFragment | undefined, ended: boolean) => any): Promise<void> {
    let aborted = false

    // cancel the previous synth worklet
    if (this.worklet) {
      await this.worklet.cancel()
    }

    // init the synth worklet
    const synthFn = await this.mscore.synthAudio(startTime)
    this.worklet = {
      async cancel (): Promise<void> {
        aborted = true
        await synthFn(true /* cancel */)
      },
    }

    let synthResL: SynthRes[] = []

    // synth loop
    while (true) {
      if (aborted) {
        // try to process the remaining `synthRes`es
        if (synthResL.length) {
          const [result] = this.buildFragment(synthResL)
          void onUpdate?.(result, true)
        } else {
          void onUpdate?.(undefined, true)
        }

        break
      }

      // process synth
      const synthRes: SynthRes = await synthFn()

      if (synthRes.endTime < 0) {
        console.warn('The score has ended.')
        aborted = true
        continue
      }

      synthResL.push(synthRes)
      if (synthResL.length >= this.BATCH_SIZE) {
        const [result, existed] = this.buildFragment(synthResL)
        void onUpdate?.(result, existed)
        if (existed) {
          // cache exists for this playback time
          // so stop synth further
          await this.worklet.cancel() // set aborted = true, and release resources
        }
        synthResL = []
      }

      if (synthRes.done) { // the score ends, no more fragments available
        aborted = true
      }
    }
  }

  /**
   * Find the AudioFragment that its `startTime` is in (`time - FRAGMENT_DURATION`, `time`]
   */
  private findFragment (time: number): AudioFragment | undefined {
    const fragment: AudioFragment | undefined = this.cache.le(time).value
    if (fragment && fragment.startTime > (time - this.FRAGMENT_DURATION)) {
      return fragment
    }
  }

  /**
   * Build AudioFragment from the list of `SynthRes`es, and load it to cache
   * @returns the AudioFragment processed, and `true` if the AudioFragment exists in cache
   */
  private buildFragment (synthResL: SynthRes[]): [AudioFragment, boolean /* existed */] {
    const startTime = synthResL[0].startTime
    const endTime = synthResL.slice(-1)[0].endTime

    // skip if the AudioFragment exists in cache
    let existed = false
    if (this.findFragment(endTime)) {
      existed = true
    }

    // create AudioBuffer
    // AudioBuffers can be reused for multiple plays of the sound
    const buf = new AudioBuffer({
      length: this.FRAME_LENGTH * synthResL.length,
      numberOfChannels: this.CHANNELS,
      sampleRate: this.SAMPLE_RATE,
    })

    const channelDataL = Array.from({ length: this.CHANNELS }).map((_, c) => {
      return buf.getChannelData(c)
    })

    for (let i = 0; i < synthResL.length; i++) {
      const synthRes = synthResL[i]
      const chunk = new Float32Array(synthRes.chunk.buffer)

      // copy data to the AudioBuffer
      // audio frames are interleaved
      for (let d = 0; d < this.FRAME_LENGTH; d++) {
        for (let c = 0; c < this.CHANNELS; c++) {
          const chunkOffset = d * this.CHANNELS + c
          const bufOffset = i * this.FRAME_LENGTH + d
          channelDataL[c][bufOffset] = chunk[chunkOffset]
        }
      }
    }

    // add to cache
    const fragment: AudioFragment = { audioBuffer: buf, startTime, endTime }
    this.cache = this.cache.insert(startTime, fragment)

    return [fragment, existed]
  }

  /**
   * Play a single AudioFragment,  
   * the promise resolves once the entire fragment has been played
   */
  private playFragment (f: AudioFragment, when = this.audioCtx.currentTime): Promise<void> {
    return new Promise((resolve) => {
      // An AudioBufferSourceNode can only be played once
      const source = this.audioCtx.createBufferSource()
      const speed = this.speed

      source.buffer = f.audioBuffer
      source.playbackRate.value = speed
      source.connect(this.audioCtx.destination)

      source.start(when)

      source.addEventListener('ended', () => resolve(), { once: true })
    })
  }

  /**
   * @param onUpdate called each time a fragment is played (the playback time updates)
   * @returns the promise resolves once the score ended, or user aborted
   */
  async play (abort?: AbortSignal, onUpdate?: (time: number) => any): Promise<void> {
    let cur: Promise<void> | undefined
    let prev: Promise<void> | undefined

    // reset the playback clock
    let ctxTime = this.audioCtx.currentTime
    let played = 0

    while (true) {
      if (
        this.time >= this.duration || // the score ends
        abort?.aborted // user aborted
      ) {
        return
      }

      let fragment = this.findFragment(this.time)
      if (!fragment) {
        // get the synth worklet ready for this playback time, and get its first fragment processed
        const [f, ended] = await new Promise((resolve: (args: [(AudioFragment | undefined), boolean]) => void) => {
          this.startSynth(this.time, (...args) => resolve(args))
        })
        if (ended || !f) {
          return
        } else {
          fragment = f

          // reset the playback clock
          ctxTime = this.audioCtx.currentTime
          played = 0
        }
      }

      if (prev) {
        // wait the previous play request to be finished
        await prev
      } else {
        await sleep(this.FRAGMENT_DURATION * 1000)
      }
      prev = cur

      // update the playback time
      this.time = fragment.endTime
      void onUpdate?.(this.time)

      // request to play one fragment
      cur = this.playFragment(fragment, ctxTime + played * this.FRAGMENT_DURATION / this.speed)
      played++
    }
  }

  async destroy (): Promise<void> {
    this.cache = null
    await this.worklet?.cancel()
    await this.audioCtx.close()
  }
}
