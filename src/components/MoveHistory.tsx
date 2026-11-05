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
} from 'lucide-react';
import type { MoveRecord } from '../types/chess';

interface MoveHistoryProps {
  history: MoveRecord[];
  currentMoveIndex: number; // -1 = start position, 0 = after move 1, etc.
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

  // Group moves into pairs (White move, Black move)
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

  // Auto-scroll to current move
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
      // Fallback
      setCopied(false);
    }
  };

  const handleDownloadPgn = () => {
    const blob = new Blob([pgnText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chess_game_${new Date().toISOString().slice(0, 10)}.pgn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Move History</h3>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
            {history.length} ply
          </span>
        </div>

        {/* PGN Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPgnModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-lg transition active:scale-95"
            title="View & Export PGN"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>PGN</span>
          </button>
        </div>
      </div>

      {/* Move list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-mono select-none min-h-[140px] max-h-[260px] lg:max-h-none">
        {movePairs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs italic py-8">
            No moves played yet. Make your opening move!
          </div>
        ) : (
          movePairs.map((pair) => {
            const isWhiteActive = currentMoveIndex === pair.whiteIdx;
            const isBlackActive = pair.blackIdx !== undefined && currentMoveIndex === pair.blackIdx;

            return (
              <div key={pair.num} className="grid grid-cols-12 gap-1 items-center py-0.5 px-1 rounded hover:bg-slate-800/40">
                <span className="col-span-2 text-slate-500 font-semibold text-right pr-2">
                  {pair.num}.
                </span>
                <button
                  onClick={() => onGoToMove(pair.whiteIdx)}
                  className={`col-span-5 text-left px-2 py-1 rounded transition text-xs font-semibold cursor-pointer ${
                    isWhiteActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
                  }`}
                >
                  {pair.white.san}
                </button>
                {pair.black ? (
                  <button
                    onClick={() => pair.blackIdx !== undefined && onGoToMove(pair.blackIdx)}
                    className={`col-span-5 text-left px-2 py-1 rounded transition text-xs font-semibold cursor-pointer ${
                      isBlackActive
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-amber-400'
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

        {/* Result summary banner if game completed */}
        {resultText && (
          <div className="mt-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-sans text-xs text-center font-bold">
            {resultText}
          </div>
        )}
      </div>

      {/* Navigation Controls: First, Prev, Next, Last, Undo, Redo */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border-t border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Undo Move"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Redo Move"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onGoToMove(-1)}
            disabled={currentMoveIndex <= -1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Start of Game"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(currentMoveIndex - 1)}
            disabled={currentMoveIndex <= -1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Previous Move"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(currentMoveIndex + 1)}
            disabled={currentMoveIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Next Move"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoToMove(history.length - 1)}
            disabled={currentMoveIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Current Position (Latest)"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PGN Export Modal */}
      {showPgnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Portable Game Notation (PGN)
              </h3>
              <button
                onClick={() => setShowPgnModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 mb-2">
              Standard format compatible with Chess.com, Lichess, ChessBase, and analysis engines.
            </p>

            <textarea
              readOnly
              value={pgnText}
              className="w-full flex-1 min-h-[180px] p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono resize-none focus:outline-hidden focus:border-amber-400/60"
            />

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={handleCopyPgn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copy PGN</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPgn}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download .pgn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
