import React from 'react';
import { Handshake } from 'lucide-react';
import type { Color } from 'chess.js';
import type { GameMode } from '../types/chess';

interface DrawOfferModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  offeringPlayerColor: Color;
  botDecision: 'evaluating' | 'accepted' | 'declined' | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const DrawOfferModal: React.FC<DrawOfferModalProps> = ({
  isOpen,
  gameMode,
  offeringPlayerColor,
  botDecision,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  const offeringName = offeringPlayerColor === 'w' ? 'White' : 'Black';
  const opponentName = offeringPlayerColor === 'w' ? 'Black' : 'White';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-xl text-center text-slate-900 dark:text-white">
        <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
          <Handshake className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold">Draw Offer</h3>

        {gameMode === 'pass-and-play' ? (
          <>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 mb-6">
              {offeringName} offers a draw. Does {opponentName} accept?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onDecline}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="py-2 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-xs transition cursor-pointer"
              >
                Accept
              </button>
            </div>
          </>
        ) : (
          <>
            {botDecision === 'evaluating' && (
              <div className="py-6 space-y-2">
                <div className="w-5 h-5 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Evaluating position...
                </p>
              </div>
            )}

            {botDecision === 'accepted' && (
              <div className="space-y-4 my-3">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Computer accepts the draw offer.
                </p>
                <button
                  onClick={onAccept}
                  className="w-full py-2 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-xs transition cursor-pointer"
                >
                  Agree to Draw (1/2 - 1/2)
                </button>
              </div>
            )}

            {botDecision === 'declined' && (
              <div className="space-y-4 my-3">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Computer declined the draw and plays on.
                </p>
                <button
                  onClick={onDecline}
                  className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition cursor-pointer"
                >
                  Continue
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
