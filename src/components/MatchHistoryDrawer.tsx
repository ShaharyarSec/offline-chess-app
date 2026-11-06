import React, { useState } from 'react';
import {
  X,
  History,
  Copy,
  Download,
  Check,
  Calendar,
  Layers,
  Trash2,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full sm:max-w-md h-full bg-white dark:bg-zinc-900 border-l border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col p-5 text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Match List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
          {matches.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <p className="text-sm">No finished games</p>
            </div>
          ) : (
            matches.map((m) => {
              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {m.outcomeTitle}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{m.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-slate-600 dark:text-slate-300">
                      {m.whitePlayer} <span className="text-slate-400">vs</span> {m.blackPlayer}
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {m.result}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-zinc-700/50 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{m.movesCount} moves</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyPgn(m)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                        title="Copy PGN"
                      >
                        {copiedId === m.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadPgn(m)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition cursor-pointer"
                        title="Download PGN"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
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
          <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
