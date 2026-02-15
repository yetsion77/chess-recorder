import { useState, useMemo, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import {
  Save,
  Undo2,
  RotateCcw,
  ArrowRight,
  X,
  RefreshCw,
} from 'lucide-react'
import { useChessGame } from '../hooks/useChessGame'
import { MoveList } from './MoveList'
import type { Sequence, SequenceCategory, BoardOrientation } from '../types'
import { CATEGORY_LABELS } from '../types'

interface RecordViewProps {
  editSequence?: Sequence | null
  onSave: (
    name: string,
    description: string,
    category: SequenceCategory,
    orientation: BoardOrientation,
    moves: Sequence['moves'],
    fens: string[]
  ) => Promise<void>
  onUpdate?: (
    id: string,
    name: string,
    description: string,
    category: SequenceCategory,
    orientation: BoardOrientation,
    moves: Sequence['moves'],
    fens: string[]
  ) => Promise<void>
  onCancel: () => void
}

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

export function RecordView({ editSequence, onSave, onUpdate, onCancel }: RecordViewProps) {
  const {
    position, moves, fens, turn, makeMove,
    handleSquareClick, selectedSquare, legalMoves,
    undoMove, reset, isCheckmate, isCheck,
  } = useChessGame()
  const [name, setName] = useState(editSequence?.name || '')
  const [description, setDescription] = useState(editSequence?.description || '')
  const [category, setCategory] = useState<SequenceCategory>(
    editSequence?.category || 'opening'
  )
  const [orientation, setOrientation] = useState<BoardOrientation>(
    editSequence?.orientation || 'white'
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const { containerRef, size } = useBoardSize()

  const displayMoves = editSequence && moves.length === 0 ? editSequence.moves : moves
  const displayFens = editSequence && fens.length <= 1 ? editSequence.fens : fens

  const handleDrop = ({ sourceSquare, targetSquare }: { piece: any; sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare) return false
    return makeMove(sourceSquare, targetSquare)
  }

  const onSquareClick = ({ square }: { piece: any; square: string }) => {
    handleSquareClick(square)
  }

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {}

    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(255, 191, 0, 0.4)',
      }
    }

    for (const sq of legalMoves) {
      styles[sq] = {
        background: 'radial-gradient(circle, rgba(0, 0, 0, 0.25) 25%, transparent 25%)',
      }
    }

    return styles
  }, [selectedSquare, legalMoves])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      if (editSequence && onUpdate) {
        await onUpdate(
          editSequence.id,
          name,
          description,
          category,
          orientation,
          displayMoves,
          displayFens
        )
      } else {
        await onSave(name, description, category, orientation, displayMoves, displayFens)
      }
      onCancel()
    } catch (err: any) {
      console.error('Save error:', err)
      setSaveError(err?.message || 'שגיאה בשמירה. בדוק את הגדרות Firebase Rules.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
        >
          <ArrowRight className="h-5 w-5" />
          <span className="hidden sm:inline">חזרה לספרייה</span>
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
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
          <div
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              turn === 'w'
                ? 'bg-white/10 text-white'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {turn === 'w' ? 'תור לבן' : 'תור שחור'}
          </div>
          <span className="text-sm text-slate-500">{moves.length} מהלכים</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row">
        {/* Chess Board */}
        <div className="w-full flex-shrink-0 lg:w-auto" ref={containerRef}>
          <div className={`relative mx-auto overflow-hidden rounded-2xl shadow-2xl shadow-black/30 ${isCheckmate ? 'checkmate-glow' : ''}`} dir="ltr" style={{ width: size, height: size }}>
            <Chessboard
              options={{
                position,
                boardOrientation: orientation,
                onPieceDrop: handleDrop,
                onSquareClick,
                animationDurationInMs: 200,
                boardStyle: {
                  borderRadius: '0',
                  width: `${size}px`,
                  height: `${size}px`,
                },
                squareStyles,
                darkSquareStyle: { backgroundColor: '#779952' },
                lightSquareStyle: { backgroundColor: '#edeed1' },
              }}
            />

            {/* Checkmate overlay */}
            {isCheckmate && (
              <div className="checkmate-overlay absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="checkmate-badge rounded-2xl bg-gradient-to-br from-red-600 to-red-800 px-8 py-4 shadow-2xl shadow-red-500/30">
                  <div className="text-center text-3xl font-black text-white">
                    מט!
                  </div>
                  <div className="mt-1 text-center text-sm text-red-200">
                    {turn === 'w' ? 'שחור ניצח' : 'לבן ניצח'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Board Controls */}
          <div className="mx-auto mt-3 flex items-center gap-2 sm:mt-4" style={{ maxWidth: size }}>
            <button
              onClick={() => setOrientation(o => o === 'white' ? 'black' : 'white')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10"
              title="הפוך לוח"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={undoMove}
              disabled={moves.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
            >
              <Undo2 className="h-4 w-4" />
              ביטול
            </button>
            <button
              onClick={reset}
              disabled={moves.length === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5"
            >
              <RotateCcw className="h-4 w-4" />
              איפוס
            </button>
          </div>

          {/* Orientation indicator */}
          <div className="mx-auto mt-2 text-center text-xs text-slate-500" style={{ maxWidth: size }}>
            {orientation === 'white' ? 'מקליט עבור לבן (לבן למטה)' : 'מקליט עבור שחור (שחור למטה)'}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Move List */}
          <div className="mb-4 flex-1 overflow-hidden rounded-2xl border border-white/5 bg-slate-800/50 backdrop-blur-sm">
            <div className="border-b border-white/5 px-4 py-3">
              <h3 className="text-sm font-semibold text-white">מהלכים</h3>
            </div>
            <div className="h-48 sm:h-64 lg:h-80">
              <MoveList moves={displayMoves} />
            </div>
          </div>

          {/* Save Button or Form */}
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              disabled={displayMoves.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:hover:shadow-amber-500/25 disabled:hover:brightness-100"
            >
              <Save className="h-5 w-5" />
              {editSequence ? 'עדכון רצף' : 'שמירת רצף'}
            </button>
          ) : (
            <div className="space-y-3 rounded-2xl border border-white/5 bg-slate-800/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">שמירת רצף</h3>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <input
                type="text"
                placeholder="שם הרצף *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                dir="rtl"
              />

              <textarea
                placeholder="תיאור (אופציונלי)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                dir="rtl"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SequenceCategory)}
                className="w-full rounded-xl border border-white/10 bg-slate-700/50 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                dir="rtl"
              >
                {(Object.entries(CATEGORY_LABELS) as [SequenceCategory, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>

              {saveError && (
                <p className="text-sm text-red-400" dir="rtl">{saveError}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.98] disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                {saving ? 'שומר...' : editSequence ? 'עדכון' : 'שמירה'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
