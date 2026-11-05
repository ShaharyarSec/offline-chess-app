import React, { useState, useMemo } from 'react';
import type { Chess, Square, PieceSymbol } from 'chess.js';
import type { BoardThemeId, PieceSetId } from '../types/chess';
import { BOARD_THEMES } from '../data/themes';
import { ChessPiece } from './ChessPiece';

interface ChessBoardProps {
  chess: Chess;
  themeId: BoardThemeId;
  pieceSet: PieceSetId;
  isFlipped: boolean;
  showLegalMoves: boolean;
  highlightLastMove: boolean;
  lastMove: { from: Square; to: Square } | null;
  interactive: boolean;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  themeId,
  pieceSet,
  isFlipped,
  showLegalMoves,
  highlightLastMove,
  lastMove,
  interactive,
  onMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const theme = BOARD_THEMES[themeId] || BOARD_THEMES.emerald;

  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayedFiles = isFlipped ? [...files].reverse() : files;
  const displayedRanks = isFlipped ? [...ranks].reverse() : ranks;

  const legalMovesForSelected = useMemo(() => {
    if (!selectedSquare || !interactive) return new Map<Square, { isCapture: boolean; isPromotion: boolean }>();
    const moves = chess.moves({ square: selectedSquare, verbose: true });
    const map = new Map<Square, { isCapture: boolean; isPromotion: boolean }>();
    moves.forEach((m) => {
      map.set(m.to as Square, {
        isCapture: !!m.captured,
        isPromotion: !!m.promotion,
      });
    });
    return map;
  }, [chess, selectedSquare, interactive]);

  const kingInCheckSquare = useMemo(() => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === turn) {
          const file = files[c];
          const rank = (8 - r).toString();
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, [chess]);

  const handleSquareClick = (square: Square) => {
    if (!interactive) return;

    if (selectedSquare) {
      if (legalMovesForSelected.has(square)) {
        onMove(selectedSquare, square);
        setSelectedSquare(null);
        return;
      }
    }

    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!interactive) return;
    const piece = chess.get(square);
    if (!piece || piece.color !== chess.turn()) {
      e.preventDefault();
      return;
    }
    setDraggedSquare(square);
    setSelectedSquare(square);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', square);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const fromSquare = (e.dataTransfer.getData('text/plain') as Square) || draggedSquare;
    if (fromSquare && fromSquare !== targetSquare) {
      onMove(fromSquare, targetSquare);
    }
    setDraggedSquare(null);
  };

  return (
    <div
      className={`relative w-full max-w-[540px] aspect-square mx-auto rounded-3xl overflow-hidden border-2 sm:border-3 backdrop-blur-xl ${theme.border} ${theme.glowColor} select-none transition-all duration-300 shadow-2xl p-1.5 bg-black/30`}
    >
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-2xl overflow-hidden shadow-inner">
        {displayedRanks.map((rank, rankIndex) =>
          displayedFiles.map((file, fileIndex) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);
            const isLight = (fileIndex + rankIndex) % 2 === 0;

            const isSelected = selectedSquare === square;
            const isLastMoveSquare =
              highlightLastMove && lastMove && (lastMove.from === square || lastMove.to === square);
            const isKingInCheck = kingInCheckSquare === square;
            const legalMoveInfo = legalMovesForSelected.get(square);

            const showRankLabel = fileIndex === 0;
            const showFileLabel = rankIndex === 7;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, square)}
                className={`relative flex items-center justify-center transition-colors cursor-pointer ${
                  isLight ? theme.lightSquare : theme.darkSquare
                }`}
              >
                {/* Last move highlight */}
                {isLastMoveSquare && (
                  <div className={`absolute inset-0 ${theme.highlightMove} pointer-events-none transition-opacity`} />
                )}

                {/* Selected square highlight */}
                {isSelected && (
                  <div className="absolute inset-0 bg-amber-400/35 ring-inset ring-2 ring-amber-400 pointer-events-none shadow-[inset_0_0_12px_rgba(251,191,36,0.6)]" />
                )}

                {/* King in check red highlight */}
                {isKingInCheck && (
                  <div className={`absolute inset-0 ${theme.checkSquare} pointer-events-none`} />
                )}

                {/* Chess piece with chosen piece set */}
                {piece && (
                  <div
                    draggable={interactive && piece.color === chess.turn()}
                    onDragStart={(e) => handleDragStart(e, square)}
                    className="relative w-[84%] h-[84%] flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-grab active:cursor-grabbing z-10"
                  >
                    <ChessPiece type={piece.type} color={piece.color} pieceSet={pieceSet} />
                  </div>
                )}

                {/* Legal move destination indicator */}
                {showLegalMoves && legalMoveInfo && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    {legalMoveInfo.isCapture || piece ? (
                      // Capture ring
                      <div className="w-[82%] h-[82%] rounded-full border-3 sm:border-4 border-amber-400/90 shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-pulse" />
                    ) : (
                      // Destination dot
                      <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full ${theme.legalMoveDot}`} />
                    )}
                  </div>
                )}

                {/* Board Rank Label (1-8) */}
                {showRankLabel && (
                  <span
                    className={`absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-bold leading-none pointer-events-none opacity-70 ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    {rank}
                  </span>
                )}

                {/* Board File Label (a-h) */}
                {showFileLabel && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-bold leading-none pointer-events-none opacity-70 ${
                      isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}
                  >
                    {file}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
