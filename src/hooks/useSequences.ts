import { useState, useEffect, useCallback } from 'react'
import { ref, push, set, remove, onValue, update } from 'firebase/database'
import { db } from '../lib/firebase'
import type { Sequence, ChessMove, SequenceCategory, BoardOrientation } from '../types'

export function useSequences() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sequencesRef = ref(db, 'sequences')
    const unsubscribe = onValue(sequencesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const list: Sequence[] = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            name: value.name,
            description: value.description || '',
            category: value.category || 'custom',
            orientation: value.orientation || 'white',
            moves: value.moves || [],
            fens: value.fens || [],
            createdAt: value.createdAt || Date.now(),
            updatedAt: value.updatedAt || Date.now(),
          })
        )
        list.sort((a, b) => b.updatedAt - a.updatedAt)
        setSequences(list)
      } else {
        setSequences([])
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const saveSequence = useCallback(
    async (
      name: string,
      description: string,
      category: SequenceCategory,
      orientation: BoardOrientation,
      moves: ChessMove[],
      fens: string[]
    ) => {
      const sequencesRef = ref(db, 'sequences')
      const newRef = push(sequencesRef)
      await set(newRef, {
        name,
        description,
        category,
        orientation,
        moves,
        fens,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      return newRef.key
    },
    []
  )

  const updateSequence = useCallback(
    async (
      id: string,
      name: string,
      description: string,
      category: SequenceCategory,
      orientation: BoardOrientation,
      moves: ChessMove[],
      fens: string[]
    ) => {
      const sequenceRef = ref(db, `sequences/${id}`)
      await update(sequenceRef, {
        name,
        description,
        category,
        orientation,
        moves,
        fens,
        updatedAt: Date.now(),
      })
    },
    []
  )

  const deleteSequence = useCallback(async (id: string) => {
    const sequenceRef = ref(db, `sequences/${id}`)
    await remove(sequenceRef)
  }, [])

  return {
    sequences,
    loading,
    saveSequence,
    updateSequence,
    deleteSequence,
  }
}
