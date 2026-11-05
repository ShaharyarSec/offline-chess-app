import React from 'react';
import {
  Bot,
  Users,
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Flame,
  History,
  Settings,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import type { GameMode, BotDifficulty, Color, SavedGameState } from '../types/chess';
import { BOT_CONFIGS } from '../data/themes';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeDashboardProps {
  onSelectMode: (mode: GameMode, botLevel?: BotDifficulty, playerSide?: Color) => void;
  onResumeSavedGame: () => void;
  onDiscardSavedGame: () => void;
  savedGame: SavedGameState | null;
  botDifficulty: BotDifficulty;
  onSelectBotDifficulty: (level: BotDifficulty) => void;
  puzzleSolvedCount: number;
  totalPuzzles: number;
  puzzleStreak: number;
  matchesCompletedCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onSelectMode,
  onResumeSavedGame,
  onDiscardSavedGame,
  savedGame,
  botDifficulty,
  onSelectBotDifficulty,
  puzzleSolvedCount,
  totalPuzzles,
  puzzleStreak,
  matchesCompletedCount,
  onOpenHistory,
  onOpenSettings,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col justify-between max-w-5xl mx-auto px-4 py-6 sm:py-8 select-none">
      {/* Subtle iOS Ambient Background Glows */}
      <div className="absolute top-12 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Hero Section */}
      <div className="relative z-10 text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-xl text-xs font-semibold text-amber-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Ultra-Optimized • 100% Offline PWA</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
          Grandmaster Chess
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Zero-lag Web Worker engine, tactical puzzles, and local two-player matches crafted with an iOS glassmorphic interface.
        </p>
      </div>

      {/* Ongoing Match Quick Resume Banner if present */}
      {savedGame && (
        <div className="relative z-10 mb-6 p-4 rounded-3xl bg-amber-500/15 border border-amber-500/30 backdrop-blur-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-3">
          <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
              ♟
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Active Game In Progress
              </div>
              <div className="text-sm font-bold text-white">
                {savedGame.gameMode === 'bot'
                  ? `vs ${BOT_CONFIGS[savedGame.botDifficulty].name}`
                  : savedGame.gameMode === 'pass-and-play'
                  ? 'Pass & Play 1v1'
                  : 'Tactical Puzzle'}
                <span className="text-xs font-normal text-slate-300 ml-2">
                  ({savedGame.moveHistory.length} moves played)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onDiscardSavedGame}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={onResumeSavedGame}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Resume Game</span>
            </button>
          </div>
        </div>
      )}

      {/* 3 Frosted Glass Menu Action Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {/* Card 1: Play vs Computer */}
        <div className="group relative rounded-3xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-amber-400/40 backdrop-blur-2xl p-5 shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-400/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                5 Levels
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Play vs Computer
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Zero-lag Web Worker engine. From casual beginners to grandmaster minimax tactics.
              </p>
            </div>

            {/* Quick Bot Tier Pills */}
            <div className="pt-2">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Difficulty Level
              </div>
              <div className="grid grid-cols-5 gap-1">
                {([1, 2, 3, 4, 5] as BotDifficulty[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onSelectBotDifficulty(lvl)}
                    className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      botDifficulty === lvl
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              <div className="text-[11px] font-semibold text-amber-300 mt-1.5 flex items-center gap-1.5">
                <span>{BOT_CONFIGS[botDifficulty].avatar}</span>
                <span>{BOT_CONFIGS[botDifficulty].name}</span>
                <span className="text-slate-400 font-mono text-[10px]">
                  (~{BOT_CONFIGS[botDifficulty].rating} ELO)
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('bot', botDifficulty, 'w')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Play Match</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: Pass & Play 1v1 */}
        <div className="group relative rounded-3xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-indigo-400/40 backdrop-blur-2xl p-5 shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 text-2xl shadow-inner group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-400/10 text-indigo-400 border border-indigo-400/20">
                Local 1v1
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                Pass & Play
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Two players on one device. Features optional automatic board rotation after each move.
              </p>
            </div>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Instant move validation & clocks</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Auto-flip or manual board orientation</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('pass-and-play')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Start 1v1</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 3: Tactical Puzzles */}
        <div className="group relative rounded-3xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-400/40 backdrop-blur-2xl p-5 shadow-2xl transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-2xl shadow-inner group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                20 Scenarios
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Tactical Puzzles
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Curated tactical scenarios (Mate in 1, Mate in 2, Forks, Pins, Greek Gift sacrifice).
              </p>
            </div>

            {/* Puzzle Progress stats */}
            <div className="pt-2 bg-white/5 p-2.5 rounded-2xl border border-white/5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Progress</span>
                <span className="text-emerald-400 font-bold font-mono">
                  {puzzleSolvedCount}/{totalPuzzles} Solved
                </span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (puzzleSolvedCount / totalPuzzles) * 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-[11px] text-orange-400 font-bold pt-1">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>Streak: {puzzleStreak} in a row</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelectMode('puzzle')}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <span>Solve Puzzles</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Glass Navigation Bar */}
      <div className="relative z-10 p-3 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer active:scale-95"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Match Archives ({matchesCompletedCount})</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition cursor-pointer active:scale-95"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Preferences</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />
        </div>
      </div>
    </div>
  );
};
