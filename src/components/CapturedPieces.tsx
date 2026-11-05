import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface CapturedPiecesProps {
  capturedByWhite: PieceSymbol[]; // Black pieces that White has captured
  capturedByBlack: PieceSymbol[]; // White pieces that Black has captured
  color: Color; // which player's perspective to show
}

const PIECE_WEIGHTS: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  capturedByWhite,
  capturedByBlack,
  color,
}) => {
  // Sort pieces by descending value (q, r, b, n, p)
  const sortPieces = (list: PieceSymbol[]) => {
    return [...list].sort((a, b) => PIECE_WEIGHTS[b] - PIECE_WEIGHTS[a]);
  };

  const whiteTotal = capturedByWhite.reduce((sum, p) => sum + (PIECE_WEIGHTS[p] || 0), 0);
  const blackTotal = capturedByBlack.reduce((sum, p) => sum + (PIECE_WEIGHTS[p] || 0), 0);

  const diff = color === 'w' ? whiteTotal - blackTotal : blackTotal - whiteTotal;

  // Pieces to display for this player
  const pieces = color === 'w' ? sortPieces(capturedByWhite) : sortPieces(capturedByBlack);
  // Color of the captured pieces is the opposite of the capturing player
  const capturedPieceColor: Color = color === 'w' ? 'b' : 'w';

  return (
    <div className="flex items-center gap-1.5 min-h-[26px]">
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {pieces.map((piece, idx) => (
          <div key={idx} className="w-5 h-5 shrink-0 hover:scale-125 transition-transform">
            <ChessPiece type={piece} color={capturedPieceColor} />
          </div>
        ))}
      </div>

      {diff > 0 && (
        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-mono">
          +{diff}
        </span>
      )}
    </div>
  );
};
