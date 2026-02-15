const BASE = import.meta.env.BASE_URL

let audioCtx: AudioContext | null = null
let moveBuffer: AudioBuffer | null = null
let captureBuffer: AudioBuffer | null = null
let unlocked = false

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioCtx
}

// iOS requires AudioContext.resume() from a direct user gesture
// Call this once on the first user interaction to unlock audio
export function unlockAudio() {
  if (unlocked) return
  const ctx = getContext()
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  // Play a silent buffer to fully unlock on iOS
  const silent = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = silent
  source.connect(ctx.destination)
  source.start(0)
  unlocked = true
  // Pre-load sound files after unlock
  loadSounds()
}

async function loadBuffer(url: string): Promise<AudioBuffer | null> {
  try {
    const ctx = getContext()
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return await ctx.decodeAudioData(arrayBuffer)
  } catch {
    return null
  }
}

async function loadSounds() {
  if (!moveBuffer) {
    moveBuffer = await loadBuffer(`${BASE}sounds/Move.mp3`)
  }
  if (!captureBuffer) {
    captureBuffer = await loadBuffer(`${BASE}sounds/Capture.mp3`)
  }
}

function playBuffer(buffer: AudioBuffer | null, volume: number) {
  if (!buffer) return
  const ctx = getContext()
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  const gain = ctx.createGain()
  gain.gain.value = volume
  source.connect(gain)
  gain.connect(ctx.destination)
  source.start(0)
}

export function playMoveSound() {
  playBuffer(moveBuffer, 0.5)
}

export function playCaptureSound() {
  playBuffer(captureBuffer, 0.6)
}
