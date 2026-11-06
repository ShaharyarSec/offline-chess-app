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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-xl text-center text-slate-900 dark:text-white">
        <h3 className="text-base font-bold mb-1">Promote Pawn</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Select piece</p>

        <div className="grid grid-cols-4 gap-2.5">
          {pieces.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <ChessPiece type={type} color={color} />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
