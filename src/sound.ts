/**
 * Tiny synthesised card sounds (no audio files): draw, place and shuffle.
 * Off by default; the choice is remembered in localStorage.
 */
type Cue = 'draw' | 'place' | 'shuffle'

const KEY = 'card-sound'
let ctx: AudioContext | null = null

export function isSoundOn() {
  try {
    return localStorage.getItem(KEY) === 'on'
  } catch {
    return false
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // storage blocked: the toggle just isn't remembered
  }
  if (on) play('draw')
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** A short burst of filtered noise — the sound of card stock sliding. */
function swish(a: AudioContext, at: number, dur: number, freq: number, gain: number) {
  const len = Math.ceil(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  src.buffer = buf
  const bp = a.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = 0.8
  const g = a.createGain()
  g.gain.setValueAtTime(gain, at)
  g.gain.exponentialRampToValueAtTime(0.001, at + dur)
  src.connect(bp).connect(g).connect(a.destination)
  src.start(at)
}

/** A soft low thump — a card landing on felt. */
function thump(a: AudioContext, at: number) {
  const o = a.createOscillator()
  o.type = 'sine'
  o.frequency.setValueAtTime(140, at)
  o.frequency.exponentialRampToValueAtTime(60, at + 0.09)
  const g = a.createGain()
  g.gain.setValueAtTime(0.18, at)
  g.gain.exponentialRampToValueAtTime(0.001, at + 0.12)
  o.connect(g).connect(a.destination)
  o.start(at)
  o.stop(at + 0.13)
  swish(a, at, 0.05, 1800, 0.05)
}

export function play(cue: Cue) {
  if (!isSoundOn()) return
  const a = audio()
  if (!a) return
  const t = a.currentTime + 0.01
  if (cue === 'draw') swish(a, t, 0.09, 2600, 0.08)
  if (cue === 'place') thump(a, t)
  if (cue === 'shuffle') for (let i = 0; i < 14; i++) swish(a, t + i * 0.035 + Math.random() * 0.01, 0.04, 2200 + Math.random() * 1200, 0.05)
}

/** A light tap on phones that support it (Android); a no-op elsewhere. */
export function haptic(ms = 12) {
  if (isSoundOn()) navigator.vibrate?.(ms)
}
