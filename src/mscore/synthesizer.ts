
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

  /**
   * The duration (s) of one AudioFragment  
   * ~ 0.0116 s
   */
  private readonly FRAGMENT_DURATION = this.FRAME_LENGTH / this.SAMPLE_RATE;

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

    // synth loop
    while (true) {
      if (aborted) {
        break
      }

      // process synth
      const synthRes: SynthRes = await synthFn()
      if (synthRes.endTime < 0) {
        throw new Error('The score has ended.')
      }

      const result = this.buildFragment(synthRes)
      if (result) {
        void onUpdate?.(result)
      } else {
        // cache exists for this playback time
        // so stop synth further
        await this.worklet.cancel() // set aborted = true, and release resources
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
    const fragment: AudioFragment = this.cache.le(time).value

    const startTime = fragment.startTime
    if (startTime > (time - this.FRAGMENT_DURATION)) {
      return fragment
    }
  }

  /**
   * Build AudioFragment from the SynthRes, and load it to cache
   * @returns the AudioFragment processed, or `undefined` if the AudioFragment exists in cache
   */
  private buildFragment (synthRes: SynthRes): AudioFragment | undefined {
    const chunk = new Float32Array(synthRes.chunk.buffer)
    const { startTime, endTime } = synthRes

    // skip if the AudioFragment exists in cache
    if (this.cache.get(startTime)) {
      return
    }

    // create AudioBuffer
    // AudioBuffers can be reused for multiple plays of the sound
    const buf = new AudioBuffer({
      length: this.FRAME_LENGTH,
      numberOfChannels: this.CHANNELS,
      sampleRate: this.SAMPLE_RATE,
    })

    // copy data to the AudioBuffer
    // audio frames are interleaved
    for (let d = 0; d < buf.length; d++) {
      for (let c = 0; c < buf.numberOfChannels; c++) {
        const p = d * buf.numberOfChannels + c
        buf.copyToChannel(chunk.slice(p, p + 1), c, d)
      }
    }

    // add to cache
    const fragment: AudioFragment = { audioBuffer: buf, startTime, endTime }
    this.cache = this.cache.insert(startTime, fragment)

    return fragment
  }

  /**
   * Play a single AudioFragment,  
   * the Promise resolves once the entire fragment has been played
   */
  private playFragment (f: AudioFragment): Promise<void> {
    return new Promise((resolve) => {
      // An AudioBufferSourceNode can only be played once
      const source = this.audioCtx.createBufferSource()

      source.buffer = f.audioBuffer
      source.connect(this.audioCtx.destination)
      source.start()

      source.addEventListener('ended', () => resolve())
    })
  }

  /**
   * @param onUpdate called each time a fragment is played (the playback time updates)
   * @returns The Promise resolves once the score ended, or user aborted
   */
  async play (abort?: AbortSignal, onUpdate?: (time: number) => any): Promise<void> {
    while (true) {
      // the score ends
      if (this.time >= this.maxTime) {
        break
      }
      // user aborted
      if (abort?.aborted) {
        break
      }

      let fragment = this.findFragment(this.time)
      if (!fragment) {
        // get the synth worklet ready for this playback time, and get its first fragment processed
        fragment = await new Promise((
          resolve: (f: AudioFragment) => void,
        ) => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.startSynth(this.time, resolve)
        })
      }

      // play one fragment
      await this.playFragment(fragment)

      // update the current playback time
      this.time = fragment.endTime
      void onUpdate?.(this.time)
    }
  }
}
