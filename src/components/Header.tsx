import { Crown, ChevronRight } from 'lucide-react'
import type { AppView } from '../types'

interface HeaderProps {
  view: AppView
  sequenceName?: string
  onNavigate: (view: AppView) => void
}

export function Header({ view, sequenceName, onNavigate }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          onClick={() => onNavigate('library')}
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
            <Crown className="h-5 w-5 text-slate-900" />
          </div>
          <h1 className="text-xl font-bold text-white">Chess Recorder</h1>
        </button>

        {view !== 'library' && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <button
              onClick={() => onNavigate('library')}
              className="transition-colors hover:text-white"
            >
              ספרייה
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">
              {view === 'record'
                ? sequenceName || 'הקלטה חדשה'
                : sequenceName || 'צפייה'}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
