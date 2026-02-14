import { useState, useEffect, useCallback, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
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

export function PlaybackView({ sequence, onBack }: PlaybackViewProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalMoves = sequence.moves.length
  const currentFen = sequence.fens[currentIndex + 1] || sequence.fens[0]

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
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
          חזרה לספרייה
        </button>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium text-white ${CATEGORY_COLORS[sequence.category]}`}
          >
            {CATEGORY_LABELS[sequence.category]}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">{sequence.name}</h2>
        {sequence.description && (
          <p className="mt-1 text-slate-400">{sequence.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Chess Board */}
        <div className="flex-shrink-0">
          <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/30" dir="ltr">
            <Chessboard
              options={{
                position: currentFen,
                allowDragging: false,
                animationDurationInMs: 300,
                boardStyle: {
                  borderRadius: '0',
                  width: '480px',
                  height: '480px',
                },
                darkSquareStyle: { backgroundColor: '#779952' },
                lightSquareStyle: { backgroundColor: '#edeed1' },
              }}
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-4 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Playback Controls */}
          <div className="mt-3 flex items-center justify-between">
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
            <div className="flex items-center gap-1">
              {SPEEDS.map((speed, i) => (
                <button
                  key={speed.label}
                  onClick={() => setSpeedIndex(i)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
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
          <div className="flex-1">
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
