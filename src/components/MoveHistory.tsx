import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Download,
  Check,
  RotateCcw,
  RotateCw,
  FileText,
  X,
} from 'lucide-react';
import type { MoveRecord } from '../types/chess';

interface MoveHistoryProps {
  history: MoveRecord[];
  currentMoveIndex: number;
  pgnText: string;
  onGoToMove: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resultText?: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  history,
  currentMoveIndex,
  pgnText,
  onGoToMove,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  resultText,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPgnModal, setShowPgnModal] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const movePairs: { num: number; white: MoveRecord; black?: MoveRecord; whiteIdx: number; blackIdx?: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
      whiteIdx: i,
      blackIdx: i + 1 < history.length ? i + 1 : undefined,
    });
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length, currentMoveIndex]);

  const handleCopyPgn = async () => {
    try {
      await navigator.clipboard.writeText(pgnText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadPgn = () => {
    const blob = new Blob([pgnText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chess_${new Date().toISOString().slice(0, 10)}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Moves
          </h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-slate-300 font-mono">
            {history.length}
          </span>
        </div>

        <button
          onClick={() => setShowPgnModal(true)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200/60 dark:bg-zinc-700/60 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-lg transition active:scale-95 cursor-pointer"
        >
          <Download className="w-3 h-3" />
          <span>PGN</span>
        </button>
      </div>

      {/* Move list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5 text-xs font-mono select-none min-h-[140px] max-h-[260px] lg:max-h-none"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs py-8">
            Game not started
          </div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteActive = currentMoveIndex === pair.whiteIdx;
            const isBlackActive = pair.blackIdx !== undefined && currentMoveIndex === pair.blackIdx;

            return (
              <div
                key={pair.num}
                className="grid grid-cols-12 gap-1 items-center py-0.5 px-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800/60"
              >
                <span className="col-span-2 text-slate-400 dark:text-slate-500 font-semibold text-right pr-2">
                  {pair.num}.
                </span>
                <button
                  onClick={() => onGoToMove(pair.whiteIdx)}
                  className={`col-span-5 text-left px-2 py-1 rounded transition text-xs font-semibold cursor-pointer ${
                    isWhiteActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {pair.white.san}
                </button>
                {pair.black ? (
                  <button
                    onClick={() => pair.blackIdx !== undefined && onGoToMove(pair.blackIdx)}
                    className={`col-span-5 text-left px-2 py-1 rounded transition text-xs font-semibold cursor-pointer ${
                      isBlackActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {pair.black.san}
                  </button>
                ) : (
                  <div className="col-span-5" />
                )}
              </div>
            );
          })
        )}

        {resultText && (
          <div className="mt-2 p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200 font-sans text-xs text-center font-bold">
            {resultText}
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToMove(-1)}
            disabled={currentMoveIndex <= -1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Start"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(currentMoveIndex - 1)}
            disabled={currentMoveIndex <= -1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(currentMoveIndex + 1)}
            disabled={currentMoveIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(history.length - 1)}
            disabled={currentMoveIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
            title="End"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PGN Modal */}
      {showPgnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 shadow-xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">PGN</h3>
              <button
                onClick={() => setShowPgnModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              readOnly
              value={pgnText}
              className="w-full flex-1 min-h-[160px] my-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-slate-200 text-xs font-mono resize-none focus:outline-hidden"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCopyPgn}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownloadPgn}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 text-xs font-semibold transition active:scale-95 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
