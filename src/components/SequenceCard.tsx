import { Play, Trash2, Edit3, Clock } from 'lucide-react'
import type { Sequence } from '../types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../types'

interface SequenceCardProps {
  sequence: Sequence
  onPlay: (sequence: Sequence) => void
  onEdit: (sequence: Sequence) => void
  onDelete: (id: string) => void
}

export function SequenceCard({ sequence, onPlay, onEdit, onDelete }: SequenceCardProps) {
  const timeAgo = getTimeAgo(sequence.updatedAt)
  const moveCount = sequence.moves.length

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-slate-800/80 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${CATEGORY_COLORS[sequence.category]}`}
      />

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-white">
              {sequence.name}
            </h3>
            {sequence.description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                {sequence.description}
              </p>
            )}
          </div>
          <span
            className={`ml-3 flex-shrink-0 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium text-white ${CATEGORY_COLORS[sequence.category]}`}
          >
            {CATEGORY_LABELS[sequence.category]}
          </span>
        </div>

        <div className="mb-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <span>{moveCount} מהלכים</span>
          {moveCount > 0 && (
            <span className="font-mono text-slate-400">
              {sequence.moves.slice(0, 3).map((m) => m.san).join(' ')}
              {moveCount > 3 ? ' ...' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlay(sequence)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-slate-900 shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:brightness-110 active:scale-[0.98]"
          >
            <Play className="h-4 w-4" />
            צפייה
          </button>
          <button
            onClick={() => onEdit(sequence)}
            className="flex items-center justify-center rounded-xl bg-white/5 p-2.5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(sequence.id)}
            className="flex items-center justify-center rounded-xl bg-white/5 p-2.5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'עכשיו'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `לפני ${minutes} דק'`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `לפני ${hours} שע'`
  const days = Math.floor(hours / 24)
  if (days < 30) return `לפני ${days} ימים`
  return new Date(timestamp).toLocaleDateString('he-IL')
}
