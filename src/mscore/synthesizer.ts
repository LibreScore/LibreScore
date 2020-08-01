/* eslint-disable @typescript-eslint/no-floating-promises */

import type WebMscore from 'webmscore'
import type { SynthRes } from 'webmscore/schemas'
import type { PromiseType } from 'utility-types'
import createTree from 'functional-red-black-tree'

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

  /**
   * The score's end time (no more fragments available)
   */
  private maxTime = Infinity;

  public worklet: { cancel (): Promise<void> } | undefined;

  constructor (
    private readonly mscore: WebMscore,
    /** the current playback time **in seconds** */
    public time = 0,
    private readonly audioCtx = new AudioContext(),
  ) { }

  /**
   * Synthesize audio fragments
   * @param onUpdate called each time a fragment is processed
   */
  async startSynth (startTime: number, onUpdate?: (fragment: AudioFragment) => any): Promise<void> {
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
        break
      }

      // process synth
      const synthRes: SynthRes = await synthFn()
      if (synthRes.endTime < 0) {
        console.warn('The score has ended.')
        return
      }

      synthResL.push(synthRes)
      if (synthResL.length >= this.BATCH_SIZE) {
        const result = this.buildFragment(synthResL)
        if (result) {
          void onUpdate?.(result)
        } else {
          // cache exists for this playback time
          // so stop synth further
          await this.worklet.cancel() // set aborted = true, and release resources
        }
        synthResL = []
      }

      if (synthRes.done) { // the score ends, no more fragments available
        // update the score's end time (duration)
        this.maxTime = synthRes.endTime
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
   * @returns the AudioFragment processed, or `undefined` if the AudioFragment exists in cache
   */
  private buildFragment (synthResL: SynthRes[]): AudioFragment | undefined {
    const startTime = synthResL[0].startTime
    const endTime = synthResL.slice(-1)[0].endTime

    // skip if the AudioFragment exists in cache
    if (this.cache.get(startTime)) {
      return
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

    return fragment
  }

  /**
   * Play a single AudioFragment,  
   * the callback function is called once the entire fragment has been played
   */
  private playFragment (f: AudioFragment, cb: () => any): void {
    // An AudioBufferSourceNode can only be played once
    const source = this.audioCtx.createBufferSource()

    source.buffer = f.audioBuffer
    source.connect(this.audioCtx.destination)
    source.start()

    setTimeout(cb, f.audioBuffer.duration * 1000)
  }

  /**
   * @param onUpdate called each time a fragment is played (the playback time updates)
   * @param onEnd called once the score ended, or user aborted
   */
  play (abort?: AbortSignal, onUpdate?: (time: number) => any, onEnd?: () => any): void {
    const next = (): void => {
      if (
        this.time >= this.maxTime || // the score ends
        abort?.aborted // user aborted
      ) {
        return onEnd?.()
      }

      const fragment = this.findFragment(this.time)
      if (!fragment) {
        // get the synth worklet ready for this playback time, and get its first fragment processed
        new Promise((resolve) => {
          this.startSynth(this.time, resolve)
        }).then(() => next())
        return
      }

      // play one fragment
      this.playFragment(fragment, () => {
        // update the current playback time
        this.time = fragment.endTime
        void onUpdate?.(this.time)
        return next()
      })
    }
    return next()
  }
}
