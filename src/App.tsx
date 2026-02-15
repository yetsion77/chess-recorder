import { useState, useCallback, useEffect } from 'react'
import { Header } from './components/Header'
import { SequenceLibrary } from './components/SequenceLibrary'
import { RecordView } from './components/RecordView'
import { PlaybackView } from './components/PlaybackView'
import { useSequences } from './hooks/useSequences'
import { unlockAudio } from './lib/sounds'
import type { AppView, Sequence } from './types'

export default function App() {
  // Unlock Web Audio on first user interaction (required for iOS)
  useEffect(() => {
    const handler = () => {
      unlockAudio()
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('mousedown', handler)
    }
    window.addEventListener('touchstart', handler, { once: true })
    window.addEventListener('mousedown', handler, { once: true })
    return () => {
      window.removeEventListener('touchstart', handler)
      window.removeEventListener('mousedown', handler)
    }
  }, [])
  const [view, setView] = useState<AppView>('library')
  const [activeSequence, setActiveSequence] = useState<Sequence | null>(null)
  const [editSequence, setEditSequence] = useState<Sequence | null>(null)
  const { sequences, loading, saveSequence, updateSequence, deleteSequence } = useSequences()

  const handleNavigate = useCallback((newView: AppView) => {
    setView(newView)
    if (newView === 'library') {
      setActiveSequence(null)
      setEditSequence(null)
    }
  }, [])

  const handleNewSequence = useCallback(() => {
    setEditSequence(null)
    setView('record')
  }, [])

  const handlePlay = useCallback((seq: Sequence) => {
    setActiveSequence(seq)
    setView('playback')
  }, [])

  const handleEdit = useCallback((seq: Sequence) => {
    setEditSequence(seq)
    setView('record')
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('למחוק את הרצף הזה?')) {
        await deleteSequence(id)
      }
    },
    [deleteSequence]
  )

  const handleSave = useCallback(
    async (
      name: string,
      description: string,
      category: Sequence['category'],
      orientation: Sequence['orientation'],
      moves: Sequence['moves'],
      fens: string[]
    ) => {
      await saveSequence(name, description, category, orientation, moves, fens)
    },
    [saveSequence]
  )

  const handleUpdate = useCallback(
    async (
      id: string,
      name: string,
      description: string,
      category: Sequence['category'],
      orientation: Sequence['orientation'],
      moves: Sequence['moves'],
      fens: string[]
    ) => {
      await updateSequence(id, name, description, category, orientation, moves, fens)
    },
    [updateSequence]
  )

  const currentName = activeSequence?.name || editSequence?.name

  return (
    <div className="flex min-h-screen flex-col bg-slate-950" dir="rtl">
      <Header
        view={view}
        sequenceName={currentName}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">
        {view === 'library' && (
          <SequenceLibrary
            sequences={sequences}
            loading={loading}
            onNewSequence={handleNewSequence}
            onPlay={handlePlay}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {view === 'record' && (
          <RecordView
            editSequence={editSequence}
            onSave={handleSave}
            onUpdate={handleUpdate}
            onCancel={() => handleNavigate('library')}
          />
        )}

        {view === 'playback' && activeSequence && (
          <PlaybackView
            sequence={activeSequence}
            onBack={() => handleNavigate('library')}
          />
        )}
      </main>
    </div>
  )
}
