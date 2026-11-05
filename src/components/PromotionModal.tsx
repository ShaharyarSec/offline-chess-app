import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import { ChessPiece } from './ChessPiece';

interface PromotionModalProps {
  isOpen: boolean;
  color: Color;
  onSelect: (piece: PieceSymbol) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, color, onSelect, onCancel }) => {
  if (!isOpen) return null;

  const pieces: { type: PieceSymbol; label: string }[] = [
    { type: 'q', label: 'Queen' },
    { type: 'r', label: 'Rook' },
    { type: 'b', label: 'Bishop' },
    { type: 'n', label: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-center">
        <h3 className="text-lg font-bold text-white mb-1">Promote Pawn</h3>
        <p className="text-xs text-slate-400 mb-5">Choose a piece to replace your promoted pawn</p>

        <div className="grid grid-cols-4 gap-3">
          {pieces.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="group flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ChessPiece type={type} color={color} />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-300 group-hover:text-amber-300">
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-6 text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
        >
          Cancel move
        </button>
      </div>
    </div>
  );
};
