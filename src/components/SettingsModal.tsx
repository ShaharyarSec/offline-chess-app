import React from 'react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Eye,
  RefreshCw,
  Palette,
  Bot,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import type { GameSettings, BotDifficulty, BoardThemeId, PieceSetId } from '../types/chess';
import { BOARD_THEMES, BOT_CONFIGS, PIECE_SETS } from '../data/themes';

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
  botDifficulty,
  onUpdateSettings,
  onUpdateBotDifficulty,
  onClose,
}) => {
  if (!isOpen) return null;

  const themes: { id: BoardThemeId; name: string; previewClass: string }[] = [
    { id: 'emerald', name: 'Emerald Green', previewClass: 'bg-[#769656]' },
    { id: 'glass-ice', name: 'Glass Ice', previewClass: 'bg-cyan-500' },
    { id: 'charcoal', name: 'Dark Charcoal', previewClass: 'bg-slate-800' },
    { id: 'walnut', name: 'Rich Walnut', previewClass: 'bg-[#b58863]' },
  ];

  const timeOptions = [
    { label: 'Untimed', seconds: 0, inc: 0 },
    { label: '1 min Bullet', seconds: 60, inc: 0 },
    { label: '3 min Blitz (+2s)', seconds: 180, inc: 2 },
    { label: '5 min Blitz', seconds: 300, inc: 0 },
    { label: '10 min Rapid', seconds: 600, inc: 0 },
    { label: '15 min (+10s)', seconds: 900, inc: 10 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/95 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-white">Customization & Engine</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">
          {/* Piece Set Customization */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Piece Set Style
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PIECE_SETS.map((ps) => (
                <button
                  key={ps.id}
                  onClick={() => onUpdateSettings({ pieceSet: ps.id })}
                  className={`p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                    settings.pieceSet === ps.id
                      ? 'border-amber-400 bg-amber-500/15 text-white font-bold ring-1 ring-amber-400/40'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-bold">{ps.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{ps.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Board Theme */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <Palette className="w-4 h-4 text-amber-400" />
              Board Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ boardTheme: t.id })}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                    settings.boardTheme === t.id
                      ? 'border-amber-400 bg-amber-500/15 text-white font-bold'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${t.previewClass} border border-white/20 shrink-0`} />
                  <span className="text-xs truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bot Difficulty Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-amber-400" />
                Web Worker AI Level
              </h3>
              <span className="text-xs font-bold text-amber-400 font-mono">
                Level {botDifficulty}: {BOT_CONFIGS[botDifficulty].name} (~{BOT_CONFIGS[botDifficulty].rating} ELO)
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={botDifficulty}
                onChange={(e) => onUpdateBotDifficulty(parseInt(e.target.value) as BotDifficulty)}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-1">
                <span>Lv.1 Instant</span>
                <span>Lv.2 (100ms)</span>
                <span>Lv.3 (250ms)</span>
                <span>Lv.4 (500ms)</span>
                <span>Lv.5 GM (700ms)</span>
              </div>
              <p className="text-xs text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/5 leading-relaxed">
                {BOT_CONFIGS[botDifficulty].description}
              </p>
            </div>
          </div>

          {/* Time Controls */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Clock Preset
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() =>
                    onUpdateSettings({
                      timeControlSeconds: opt.seconds,
                      incrementSeconds: opt.inc,
                    })
                  }
                  className={`p-2 rounded-xl border text-center text-xs font-medium transition cursor-pointer ${
                    settings.timeControlSeconds === opt.seconds
                      ? 'border-amber-400 bg-amber-500/15 text-amber-300 font-bold'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            {/* Sound FX Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-white">Synthesized Audio</div>
                  <div className="text-[11px] text-slate-400">Web Audio API sound effects (100% offline)</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Legal Move Indicators */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Legal Move Indicators</div>
                  <div className="text-[11px] text-slate-400">Target dots & capture halos on reachable squares</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ showLegalMoves: !settings.showLegalMoves })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.showLegalMoves ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.showLegalMoves ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-flip in Pass & Play */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Auto-Flip in Pass & Play</div>
                  <div className="text-[11px] text-slate-400">Rotates board to face active turn player</div>
                </div>
              </div>
              <button
                onClick={() => onUpdateSettings({ autoFlipBoard: !settings.autoFlipBoard })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.autoFlipBoard ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.autoFlipBoard ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
