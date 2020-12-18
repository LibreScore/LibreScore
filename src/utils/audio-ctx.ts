
declare const webkitAudioContext: typeof AudioContext

const _AudioContext = typeof AudioContext !== 'undefined'
  ? AudioContext
  : webkitAudioContext

export { _AudioContext as AudioContext }
