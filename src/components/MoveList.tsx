import type { ChessMove } from '../types'

interface MoveListProps {
  moves: ChessMove[]
  currentMoveIndex?: number
  onMoveClick?: (index: number) => void
  interactive?: boolean
}

export function MoveList({
  moves,
  currentMoveIndex,
  onMoveClick,
  interactive = false,
}: MoveListProps) {
  const pairs: { number: number; white?: ChessMove; black?: ChessMove; whiteIdx: number; blackIdx: number }[] = []

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
      whiteIdx: i,
      blackIdx: i + 1,
    })
  }

  if (moves.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-500">
        <p className="text-center text-sm">
          גרור כלים על הלוח כדי להתחיל להקליט
        </p>
      </div>
    )
  }

  return (
    <div className="custom-scrollbar overflow-y-auto p-3">
      <div className="space-y-1">
        {pairs.map((pair) => (
          <div
            key={pair.number}
            className="flex items-center gap-1 rounded-lg text-sm"
          >
            <span className="w-8 flex-shrink-0 text-center text-xs font-medium text-slate-500">
              {pair.number}.
            </span>
            {pair.white && (
              <button
                onClick={() => interactive && onMoveClick?.(pair.whiteIdx)}
                className={`flex-1 rounded-md px-2 py-1.5 text-center font-mono text-sm transition-all ${
                  interactive ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'
                } ${
                  currentMoveIndex === pair.whiteIdx
                    ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                    : 'text-slate-300'
                }`}
              >
                {pair.white.san}
              </button>
            )}
            {pair.black ? (
              <button
                onClick={() => interactive && onMoveClick?.(pair.blackIdx)}
                className={`flex-1 rounded-md px-2 py-1.5 text-center font-mono text-sm transition-all ${
                  interactive ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'
                } ${
                  currentMoveIndex === pair.blackIdx
                    ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                    : 'text-slate-300'
                }`}
              >
                {pair.black.san}
              </button>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
