import React, { useState } from 'react';
import {
  X,
  History,
  Copy,
  Download,
  Check,
  Trophy,
  Calendar,
  Layers,
  Trash2,
  FileText,
} from 'lucide-react';
import type { CompletedGameRecord } from '../types/chess';

interface MatchHistoryDrawerProps {
  isOpen: boolean;
  matches: CompletedGameRecord[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const MatchHistoryDrawer: React.FC<MatchHistoryDrawerProps> = ({
  isOpen,
  matches,
  onClose,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyPgn = async (match: CompletedGameRecord) => {
    try {
      await navigator.clipboard.writeText(match.pgn);
      setCopiedId(match.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleDownloadPgn = (match: CompletedGameRecord) => {
    const blob = new Blob([match.pgn], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chess_${match.id}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md h-full bg-slate-900/95 sm:border-l border-white/10 shadow-2xl flex flex-col p-5 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Match History</h2>
              <p className="text-[11px] text-slate-400">Last 10 completed games with PGN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {matches.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Trophy className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">No matches finished yet</h4>
              <p className="text-xs text-slate-500 mt-1">
                Complete a game against the bot or in Pass & Play to review move archives here.
              </p>
            </div>
          ) : (
            matches.map((m) => {
              const isWhiteWinner = m.result === '1-0';
              const isBlackWinner = m.result === '0-1';
              const isDraw = m.result === '1/2-1/2';

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all shadow-md space-y-2.5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isWhiteWinner
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isBlackWinner
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {m.outcomeTitle}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {m.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="font-semibold text-white">
                      <span>{m.whitePlayer}</span>
                      <span className="text-slate-400 mx-1.5 font-bold">vs</span>
                      <span>{m.blackPlayer}</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">{m.result}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-500" />
                        {m.movesCount} moves
                      </span>
                      <span>•</span>
                      <span>{m.reason}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyPgn(m)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Copy PGN"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadPgn(m)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Download PGN"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {matches.length > 0 && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-500/10 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
