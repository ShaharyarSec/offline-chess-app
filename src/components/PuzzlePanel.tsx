import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
  Flame,
  HelpCircle,
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
  solvedCount,
  streak,
}) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Puzzle #{puzzleIndex + 1}
          </h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold font-mono">
            ★ {puzzle.rating}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-orange-400 font-bold" title="Solving Streak">
            <Flame className="w-3.5 h-3.5 fill-orange-400" />
            {streak}
          </span>
          <span className="text-slate-400 text-[11px]">
            {solvedCount}/{totalPuzzles} Solved
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Badge & Turn */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold">
              {puzzle.theme}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  puzzle.playerColor === 'w' ? 'bg-white ring-1 ring-slate-400' : 'bg-slate-900 ring-1 ring-slate-600'
                }`}
              />
              <span>{puzzle.playerColor === 'w' ? 'White to move' : 'Black to move'}</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-white mb-1">{puzzle.title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{puzzle.description}</p>
        </div>

        {/* Feedback Alert Banners */}
        {status === 'success' && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 flex items-start gap-2.5 animate-in zoom-in-95 duration-200">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Puzzle Solved! Excellent Move!</div>
              <div className="text-[11px] text-emerald-200/90 mt-0.5">
                {feedbackMessage || 'You found the best tactical sequence.'}
              </div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-300 flex items-start gap-2.5 animate-in zoom-in-95 duration-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">That’s not the best move.</div>
              <div className="text-[11px] text-rose-200/90 mt-0.5">
                {feedbackMessage || 'Think carefully about threats, forks, and sacrifices.'}
              </div>
            </div>
          </div>
        )}

        {/* Hint Box */}
        {showHint && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Tactical Hint: </span>
              {puzzle.hint}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {status === 'failed' ? (
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Move</span>
              </button>
            ) : status === 'success' ? (
              <button
                onClick={onNextPuzzle}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>{showHint ? 'Hide Hint' : 'Get Hint'}</span>
              </button>
            )}

            <button
              onClick={onShowSolution}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
              title="Reveal the winning solution"
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span>Solution</span>
            </button>
          </div>

          {/* Navigation between puzzles */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              onClick={onPrevPuzzle}
              disabled={puzzleIndex <= 0}
              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              ← Previous
            </button>
            <span className="font-mono text-[11px]">
              {puzzleIndex + 1} of {totalPuzzles}
            </span>
            <button
              onClick={onNextPuzzle}
              disabled={puzzleIndex >= totalPuzzles - 1}
              className="text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
