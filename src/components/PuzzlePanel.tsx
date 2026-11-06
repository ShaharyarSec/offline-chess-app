import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Eye,
} from 'lucide-react';
import type { ChessPuzzle } from '../types/chess';

interface PuzzlePanelProps {
  puzzle: ChessPuzzle;
  puzzleIndex: number;
  totalPuzzles: number;
  status: 'playing' | 'success' | 'failed';
  feedbackMessage?: string;
  onRetry: () => void;
  onNextPuzzle: () => void;
  onPrevPuzzle: () => void;
  onShowSolution: () => void;
  solvedCount: number;
  streak: number;
}

export const PuzzlePanel: React.FC<PuzzlePanelProps> = ({
  puzzle,
  puzzleIndex,
  totalPuzzles,
  status,
  feedbackMessage,
  onRetry,
  onNextPuzzle,
  onPrevPuzzle,
  onShowSolution,
}) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Puzzle {puzzleIndex + 1}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 font-mono">
            {puzzle.rating}
          </span>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {puzzleIndex + 1} / {totalPuzzles}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4 text-slate-900 dark:text-slate-100">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {puzzle.playerColor === 'w' ? 'White to move' : 'Black to move'}
          </div>

          <h3 className="text-base font-bold">{puzzle.title}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {puzzle.description}
          </p>
        </div>

        {/* Feedback Banners */}
        {status === 'success' && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Solved! Correct sequence.</span>
          </div>
        )}

        {status === 'failed' && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300 flex items-center gap-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{feedbackMessage || 'Incorrect move.'}</span>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200 text-xs">
            <span className="font-bold">Hint: </span>
            {puzzle.hint}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {status === 'failed' ? (
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-xs transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            ) : status === 'success' ? (
              <button
                onClick={onNextPuzzle}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Hint'}</span>
              </button>
            )}

            <button
              onClick={onShowSolution}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Reveal solution"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <button
              onClick={onPrevPuzzle}
              disabled={puzzleIndex <= 0}
              className="hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={onNextPuzzle}
              disabled={puzzleIndex >= totalPuzzles - 1}
              className="hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
