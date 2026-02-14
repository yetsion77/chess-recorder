import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { ChessMove } from '../types'

export function useChessGame() {
  const [game, setGame] = useState(new Chess())
  const [moves, setMoves] = useState<ChessMove[]>([])
  const [fens, setFens] = useState<string[]>([new Chess().fen()])
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [legalMoves, setLegalMoves] = useState<string[]>([])

  const position = game.fen()

  const applyMove = useCallback((from: string, to: string) => {
    const gameCopy = new Chess(game.fen())

    const piece = gameCopy.get(from as any)
    const isPromotion =
      piece?.type === 'p' &&
      ((piece.color === 'w' && to[1] === '8') ||
        (piece.color === 'b' && to[1] === '1'))

    const result = gameCopy.move({
      from,
      to,
      promotion: isPromotion ? 'q' : undefined,
    })

    if (result) {
      const newMove: ChessMove = {
        from,
        to,
        san: result.san,
        ...(isPromotion ? { promotion: 'q' } : {}),
      }

      setGame(gameCopy)
      setMoves((prev) => [...prev, newMove])
      setFens((prev) => [...prev, gameCopy.fen()])
      setSelectedSquare(null)
      setLegalMoves([])
      return true
    }
    return false
  }, [game])

  const makeMove = useCallback((from: string, to: string) => {
    return applyMove(from, to)
  }, [applyMove])

  const handleSquareClick = useCallback((square: string) => {
    if (selectedSquare) {
      const moved = applyMove(selectedSquare, square)
      if (moved) return

      const piece = game.get(square as any)
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square)
        const sqMoves = game.moves({ square: square as any, verbose: true })
        setLegalMoves(sqMoves.map((m) => m.to))
        return
      }

      setSelectedSquare(null)
      setLegalMoves([])
      return
    }

    const piece = game.get(square as any)
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square)
      const sqMoves = game.moves({ square: square as any, verbose: true })
      setLegalMoves(sqMoves.map((m) => m.to))
    }
  }, [game, selectedSquare, applyMove])

  const undoMove = useCallback(() => {
    if (moves.length === 0) return
    const gameCopy = new Chess(game.fen())
    gameCopy.undo()
    setGame(gameCopy)
    setMoves((prev) => prev.slice(0, -1))
    setFens((prev) => prev.slice(0, -1))
    setSelectedSquare(null)
    setLegalMoves([])
  }, [game, moves.length])

  const reset = useCallback(() => {
    setGame(new Chess())
    setMoves([])
    setFens([new Chess().fen()])
    setSelectedSquare(null)
    setLegalMoves([])
  }, [])

  const turn = useMemo(() => game.turn(), [game])
  const isCheckmate = useMemo(() => game.isCheckmate(), [game])
  const isCheck = useMemo(() => game.inCheck(), [game])

  return {
    position,
    moves,
    fens,
    turn,
    makeMove,
    handleSquareClick,
    selectedSquare,
    legalMoves,
    undoMove,
    reset,
    isCheckmate,
    isCheck,
  }
}
