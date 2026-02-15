export interface ChessMove {
  from: string
  to: string
  san: string
  promotion?: string
}

export type BoardOrientation = 'white' | 'black'

export interface Sequence {
  id: string
  name: string
  description: string
  category: SequenceCategory
  orientation: BoardOrientation
  moves: ChessMove[]
  fens: string[]
  createdAt: number
  updatedAt: number
}

export type SequenceCategory = 'opening' | 'middlegame' | 'endgame' | 'tactic' | 'custom'

export const CATEGORY_LABELS: Record<SequenceCategory, string> = {
  opening: 'פתיחה',
  middlegame: 'אמצע משחק',
  endgame: 'סיום',
  tactic: 'טקטיקה',
  custom: 'מותאם אישית',
}

export const CATEGORY_COLORS: Record<SequenceCategory, string> = {
  opening: 'from-emerald-500 to-emerald-700',
  middlegame: 'from-blue-500 to-blue-700',
  endgame: 'from-purple-500 to-purple-700',
  tactic: 'from-amber-500 to-amber-700',
  custom: 'from-slate-500 to-slate-700',
}

export type AppView = 'library' | 'record' | 'playback'
