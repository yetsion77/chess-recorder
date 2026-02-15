import { useState } from 'react'
import { Plus, Search, Loader2, LayoutGrid, BookOpen } from 'lucide-react'
import type { Sequence, SequenceCategory, BoardOrientation } from '../types'
import { CATEGORY_LABELS } from '../types'
import { SequenceCard } from './SequenceCard'

interface SequenceLibraryProps {
  sequences: Sequence[]
  loading: boolean
  onNewSequence: () => void
  onPlay: (sequence: Sequence) => void
  onEdit: (sequence: Sequence) => void
  onDelete: (id: string) => void
}

const ALL_CATEGORIES: (SequenceCategory | 'all')[] = [
  'all',
  'opening',
  'middlegame',
  'endgame',
  'tactic',
  'custom',
]

export function SequenceLibrary({
  sequences,
  loading,
  onNewSequence,
  onPlay,
  onEdit,
  onDelete,
}: SequenceLibraryProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<SequenceCategory | 'all'>('all')
  const [activeColor, setActiveColor] = useState<BoardOrientation | 'all'>('all')

  const filtered = sequences.filter((seq) => {
    const matchesSearch =
      search === '' ||
      seq.name.toLowerCase().includes(search.toLowerCase()) ||
      seq.description.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      activeCategory === 'all' || seq.category === activeCategory
    const matchesColor =
      activeColor === 'all' || seq.orientation === activeColor
    return matchesSearch && matchesCategory && matchesColor
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Hero Section */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">הרצפים שלי</h2>
          <p className="mt-1 text-slate-400">
            {sequences.length} רצפים שמורים
          </p>
        </div>
        <button
          onClick={onNewSequence}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.97]"
        >
          <Plus className="h-5 w-5" />
          הקלטה חדשה
        </button>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש רצפים..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-3 pl-12 pr-4 text-white placeholder-slate-500 outline-none backdrop-blur-sm transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
            dir="rtl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'הכל' : CATEGORY_LABELS[cat]}
            </button>
          ))}

          <div className="mx-1 h-6 w-px bg-white/10" />

          {(['all', 'white', 'black'] as const).map((color) => (
            <button
              key={color}
              onClick={() => setActiveColor(color)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeColor === color
                  ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {color !== 'all' && (
                <span className={`inline-block h-3 w-3 rounded-full border border-slate-500 ${color === 'white' ? 'bg-white' : 'bg-slate-900'}`} />
              )}
              {color === 'all' ? 'כל הצבעים' : color === 'white' ? 'לבן' : 'שחור'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="mt-3 text-slate-400">טוען רצפים...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          {sequences.length === 0 ? (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/50">
                <BookOpen className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                עדיין אין רצפים
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                התחל להקליט את המהלכים הראשונים שלך
              </p>
              <button
                onClick={onNewSequence}
                className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:brightness-110"
              >
                <Plus className="h-5 w-5" />
                הקלטה חדשה
              </button>
            </>
          ) : (
            <>
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/50">
                <LayoutGrid className="h-10 w-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                לא נמצאו תוצאות
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                נסה לשנות את החיפוש או הסינון
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((seq) => (
            <SequenceCard
              key={seq.id}
              sequence={seq}
              onPlay={onPlay}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
