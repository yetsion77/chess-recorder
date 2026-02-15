import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import type { ChessMove } from '../types'
import { playMoveSound, playCaptureSound } from '../lib/sounds'

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
      // Play appropriate sound
      if (result.captured) {
        playCaptureSound()
      } else {
        playMoveSound()
      }

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

  // Helper: select a piece only if it has legal moves
  const selectPiece = useCallback((square: string) => {
    const sqMoves = game.moves({ square: square as any, verbose: true })
    if (sqMoves.length > 0) {
      setSelectedSquare(square)
      setLegalMoves(sqMoves.map((m) => m.to))
    } else {
      // No legal moves → don't select, clear any previous selection
      setSelectedSquare(null)
      setLegalMoves([])
    }
  }, [game])

  const handleSquareClick = useCallback((square: string) => {
    if (selectedSquare) {
      // Click same square again → deselect
      if (square === selectedSquare) {
        setSelectedSquare(null)
        setLegalMoves([])
        return
      }

      // Try to move to the clicked square
      const moved = applyMove(selectedSquare, square)
      if (moved) return

      // Clicked a different friendly piece → switch selection (only if it has moves)
      const piece = game.get(square as any)
      if (piece && piece.color === game.turn()) {
        selectPiece(square)
        return
      }

      // Clicked an invalid square → deselect
      setSelectedSquare(null)
      setLegalMoves([])
      return
    }

    const piece = game.get(square as any)
    if (piece && piece.color === game.turn()) {
      selectPiece(square)
    }
  }, [game, selectedSquare, applyMove, selectPiece])

  const undoMove = useCallback(() => {
    if (moves.length === 0) return
    // Rebuild from the previous FEN (fens has one more entry than moves)
    const previousFen = fens[fens.length - 2]
    setGame(new Chess(previousFen))
    setMoves((prev) => prev.slice(0, -1))
    setFens((prev) => prev.slice(0, -1))
    setSelectedSquare(null)
    setLegalMoves([])
  }, [moves.length, fens])

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
