import React from 'react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Eye,
  RefreshCw,
  Palette,
  Clock,
  Layers,
} from 'lucide-react';
import type { GameSettings, BotDifficulty, BoardThemeId } from '../types/chess';
import { PIECE_SETS } from '../data/themes';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  botDifficulty: BotDifficulty;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onUpdateBotDifficulty: (level: BotDifficulty) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  const themes: { id: BoardThemeId; name: string; previewClass: string }[] = [
    { id: 'emerald', name: 'Classic Green', previewClass: 'bg-[#769656]' },
    { id: 'glass-ice', name: 'Slate', previewClass: 'bg-[#64748b]' },
    { id: 'charcoal', name: 'Charcoal', previewClass: 'bg-[#475569]' },
    { id: 'walnut', name: 'Walnut', previewClass: 'bg-[#b58863]' },
  ];

  const timeOptions = [
    { label: 'Untimed', seconds: 0, inc: 0 },
    { label: '1m Bullet', seconds: 60, inc: 0 },
    { label: '3m (+2s)', seconds: 180, inc: 2 },
    { label: '5m Blitz', seconds: 300, inc: 0 },
    { label: '10m Rapid', seconds: 600, inc: 0 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-base font-bold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Theme Mode Toggle (Dark Mode / Light Mode) */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-2.5">
              {settings.darkMode ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-xs font-semibold">Appearance</span>
            </div>

            <div className="flex items-center bg-slate-200 dark:bg-zinc-700 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => onUpdateSettings({ darkMode: false })}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  !settings.darkMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ darkMode: true })}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  settings.darkMode
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <div className="text-xs font-semibold">Sound Effects</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Audio on move and capture</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                settings.soundEnabled ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs ring-0 transition duration-200 ease-in-out ${
                  settings.soundEnabled
                    ? 'translate-x-5 bg-white dark:bg-zinc-950'
                    : 'translate-x-0 bg-white dark:bg-zinc-400'
                }`}
              />
            </button>
          </div>

          {/* Time / Clock Controls */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4" />
              Time Control
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      timeControlSeconds: opt.seconds,
                      incrementSeconds: opt.inc,
                    })
                  }
                  className={`py-2 rounded-xl border text-center text-xs font-medium transition cursor-pointer ${
                    settings.timeControlSeconds === opt.seconds
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-zinc-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Board Theme */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Palette className="w-4 h-4" />
              Board Color
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateSettings({ boardTheme: t.id })}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                    settings.boardTheme === t.id
                      ? 'border-slate-900 bg-slate-100 text-slate-900 font-bold dark:border-white dark:bg-zinc-800 dark:text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-slate-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${t.previewClass} border border-slate-300 dark:border-zinc-700 shrink-0`} />
                  <span className="text-xs">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piece Style */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4" />
              Piece Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PIECE_SETS.map((ps) => (
                <button
                  key={ps.id}
                  type="button"
                  onClick={() => onUpdateSettings({ pieceSet: ps.id })}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-semibold transition cursor-pointer ${
                    settings.pieceSet === ps.id
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  {ps.name}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800">
            {/* Legal Move Indicators */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-semibold">Legal move dots</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ showLegalMoves: !settings.showLegalMoves })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.showLegalMoves ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.showLegalMoves
                      ? 'translate-x-4 bg-white dark:bg-zinc-950'
                      : 'translate-x-0 bg-white dark:bg-zinc-400'
                  }`}
                />
              </button>
            </div>

            {/* Auto-flip in Pass & Play */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-semibold">Auto-flip in Pass & Play</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ autoFlipBoard: !settings.autoFlipBoard })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.autoFlipBoard ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.autoFlipBoard
                      ? 'translate-x-4 bg-white dark:bg-zinc-950'
                      : 'translate-x-0 bg-white dark:bg-zinc-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
