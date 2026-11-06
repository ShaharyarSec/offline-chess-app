import React from 'react';
import { Play } from 'lucide-react';
import type { GameMode, BotDifficulty, Color, SavedGameState } from '../types/chess';

interface HomeDashboardProps {
  onSelectMode: (mode: GameMode, botLevel?: BotDifficulty, playerSide?: Color) => void;
  onResumeSavedGame: () => void;
  onDiscardSavedGame: () => void;
  savedGame: SavedGameState | null;
  botDifficulty: BotDifficulty;
  onSelectBotDifficulty: (level: BotDifficulty) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectMode,
  onResumeSavedGame,
  onDiscardSavedGame,
  savedGame,
  botDifficulty,
  onSelectBotDifficulty,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-14 select-none">
      {/* Title */}
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
          Chess
        </h1>
      </div>

      {/* Ongoing Game Banner (Minimal) */}
      {savedGame && (
        <div className="mb-8 p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
            <span>Ongoing Game</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
              ({savedGame.moveHistory.length} moves)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDiscardSavedGame}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={onResumeSavedGame}
              className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Clean Minimal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Play Computer */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Play Computer
            </h2>

            <div className="mt-4">
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as BotDifficulty[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onSelectBotDifficulty(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      botDifficulty === lvl
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('bot', botDifficulty, 'w')}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            Play
          </button>
        </div>

        {/* Card 2: Pass & Play */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Pass & Play
            </h2>
          </div>

          <button
            onClick={() => onSelectMode('pass-and-play')}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            Start 1v1
          </button>
        </div>

        {/* Card 3: Puzzles */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Puzzles
            </h2>
          </div>

          <button
            onClick={() => onSelectMode('puzzle')}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            Solve
          </button>
        </div>
      </div>
    </div>
  );
};
