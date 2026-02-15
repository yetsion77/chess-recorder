const BASE = import.meta.env.BASE_URL

let moveAudio: HTMLAudioElement | null = null
let captureAudio: HTMLAudioElement | null = null

function getMove() {
  if (!moveAudio) {
    moveAudio = new Audio(`${BASE}sounds/Move.mp3`)
    moveAudio.volume = 0.5
  }
  return moveAudio
}

function getCapture() {
  if (!captureAudio) {
    captureAudio = new Audio(`${BASE}sounds/Capture.mp3`)
    captureAudio.volume = 0.6
  }
  return captureAudio
}

export function playMoveSound() {
  const a = getMove()
  a.currentTime = 0
  a.play().catch(() => {})
}

export function playCaptureSound() {
  const a = getCapture()
  a.currentTime = 0
  a.play().catch(() => {})
}
