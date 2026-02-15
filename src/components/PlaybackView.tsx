import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import {
  Play,
  Pause,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
} from 'lucide-react'
import type { Sequence } from '../types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../types'
import { MoveList } from './MoveList'
import { playMoveSound, playCaptureSound } from '../lib/sounds'

interface PlaybackViewProps {
  sequence: Sequence
  onBack: () => void
}

const SPEEDS = [
  { label: '0.5x', ms: 2000 },
  { label: '1x', ms: 1000 },
  { label: '1.5x', ms: 667 },
  { label: '2x', ms: 500 },
  { label: '3x', ms: 333 },
]

function useBoardSize() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(480)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        setSize(Math.min(w, 480))
      } else {
        const w = window.innerWidth - 48
        setSize(Math.min(w, 480))
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return { containerRef, size }
}

export function PlaybackView({ sequence, onBack }: PlaybackViewProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { containerRef, size } = useBoardSize()

  const totalMoves = sequence.moves.length
  const currentFen = sequence.fens[currentIndex + 1] || sequence.fens[0]
  const orientation = sequence.orientation || 'white'

  // Detect checkmate and check at the current position
  const { isCheckmate, isCheck, turn } = useMemo(() => {
    try {
      const chess = new Chess(currentFen)
      return {
        isCheckmate: chess.isCheckmate(),
        isCheck: chess.inCheck(),
        turn: chess.turn(),
      }
    } catch {
      return { isCheckmate: false, isCheck: false, turn: 'w' as const }
    }
  }, [currentFen])

  // Play sound when move index changes
  const prevIndexRef = useRef(-1)
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex !== prevIndexRef.current) {
      const move = sequence.moves[currentIndex]
      if (move?.san?.includes('x')) {
        playCaptureSound()
      } else {
        playMoveSound()
      }
    }
    prevIndexRef.current = currentIndex
  }, [currentIndex, sequence.moves])

  const stopPlayback = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startPlayback = useCallback(() => {
    if (currentIndex >= totalMoves - 1) {
      setCurrentIndex(-1)
    }
    setIsPlaying(true)
  }, [currentIndex, totalMoves])

  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= totalMoves - 1) {
          stopPlayback()
          return prev
        }
        return prev + 1
      })
    }, SPEEDS[speedIndex].ms)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speedIndex, totalMoves, stopPlayback])

  const goToStart = () => {
    stopPlayback()
    setCurrentIndex(-1)
  }

  const goToEnd = () => {
    stopPlayback()
    setCurrentIndex(totalMoves - 1)
  }

  const goBack = () => {
    stopPlayback()
    setCurrentIndex((prev) => Math.max(-1, prev - 1))
  }

  const goForward = () => {
    stopPlayback()
    setCurrentIndex((prev) => Math.min(totalMoves - 1, prev + 1))
  }

  const handleMoveClick = (index: number) => {
    stopPlayback()
    setCurrentIndex(index)
  }

  const progress = totalMoves > 0 ? ((currentIndex + 1) / totalMoves) * 100 : 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
          <span className="hidden sm:inline">חזרה לספרייה</span>
        </button>
        <div className="flex items-center gap-2">
          {isCheckmate && (
            <div className="animate-pulse rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400 ring-1 ring-red-500/40">
              מט!
            </div>
          )}
          {isCheck && !isCheckmate && (
            <div className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold text-orange-400 ring-1 ring-orange-500/40">
              שח!
            </div>
          )}
          <span
            className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium text-white ${CATEGORY_COLORS[sequence.category]}`}
          >
            {CATEGORY_LABELS[sequence.category]}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{sequence.name}</h2>
        {sequence.description && (
          <p className="mt-1 text-sm text-slate-400 sm:text-base">{sequence.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        {/* Chess Board */}
        <div className="w-full flex-shrink-0 lg:w-auto" ref={containerRef}>
          <div className={`relative mx-auto overflow-hidden rounded-2xl shadow-2xl shadow-black/30 ${isCheckmate ? 'checkmate-glow' : ''}`} dir="ltr" style={{ width: size, height: size }}>
            <Chessboard
              options={{
                position: currentFen,
                boardOrientation: orientation,
                allowDragging: false,
                animationDurationInMs: 300,
                boardStyle: {
                  borderRadius: '0',
                  width: `${size}px`,
                  height: `${size}px`,
                },
                darkSquareStyle: { backgroundColor: '#779952' },
                lightSquareStyle: { backgroundColor: '#edeed1' },
              }}
            />

            {/* Checkmate overlay */}
            {isCheckmate && (
              <div className="checkmate-overlay pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
                <div className="checkmate-badge rounded-2xl bg-gradient-to-br from-red-600/90 to-red-800/90 px-6 py-3 shadow-2xl shadow-red-500/40 ring-2 ring-red-400/30">
                  <div className="text-center text-2xl font-black text-white" dir="rtl">
                    !מט
                  </div>
                  <div className="mt-0.5 text-center text-xs text-red-200">
                    {turn === 'w' ? 'שחור ניצח' : 'לבן ניצח'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mx-auto mt-3 overflow-hidden rounded-full bg-slate-800 sm:mt-4" style={{ maxWidth: size }}>
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Playback Controls */}
          <div className="mx-auto mt-3 flex items-center justify-between" style={{ maxWidth: size }}>
            <div className="flex items-center gap-1">
              <button
                onClick={goToStart}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronsRight className="h-5 w-5" />
              </button>
              <button
                onClick={goBack}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <SkipForward className="h-5 w-5 rotate-180" />
              </button>

              <button
                onClick={isPlaying ? stopPlayback : startPlayback}
                className="mx-1 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:brightness-110 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-0.5" />
                )}
              </button>

              <button
                onClick={goForward}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                onClick={goToEnd}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronsLeft className="h-5 w-5" />
              </button>
            </div>

            {/* Speed Control */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {SPEEDS.map((speed, i) => (
                <button
                  key={speed.label}
                  onClick={() => setSpeedIndex(i)}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition-all sm:px-2.5 ${
                    speedIndex === i
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {speed.label}
                </button>
              ))}
            </div>
          </div>

          {/* Move counter */}
          <div className="mt-2 text-center text-sm text-slate-500">
            {currentIndex + 1} / {totalMoves}
          </div>
        </div>

        {/* Move List */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-slate-800/50 backdrop-blur-sm">
          <div className="border-b border-white/5 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">מהלכים</h3>
          </div>
          <div className="h-48 flex-1 sm:h-auto">
            <MoveList
              moves={sequence.moves}
              currentMoveIndex={currentIndex}
              onMoveClick={handleMoveClick}
              interactive
            />
          </div>
        </div>
      </div>
    </div>
  )
}
