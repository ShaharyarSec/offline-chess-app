import React from 'react';
import { Handshake, CheckCircle2, XCircle, Bot, Users } from 'lucide-react';
import type { Color } from 'chess.js';
import type { GameMode } from '../types/chess';

interface DrawOfferModalProps {
  isOpen: boolean;
  gameMode: 'bot' | 'pass-and-play' | 'puzzle';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/90 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl text-center text-slate-100">
        <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <Handshake className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-bold text-white">Draw Offer</h3>

        {gameMode === 'pass-and-play' ? (
          <>
            <p className="text-xs text-slate-300 mt-2 mb-6 leading-relaxed">
              <strong className="text-amber-400">{offeringName}</strong> has offered a peaceful draw.
              Does <strong className="text-white">{opponentName}</strong> accept?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onDecline}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Decline
              </button>
              <button
                onClick={onAccept}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Accept Draw
              </button>
            </div>
          </>
        ) : (
          <>
            {botDecision === 'evaluating' && (
              <div className="py-6 space-y-3">
                <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">
                  Computer is evaluating positional balance...
                </p>
              </div>
            )}

            {botDecision === 'accepted' && (
              <div className="space-y-4 my-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 py-2.5 px-3 rounded-xl text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Computer evaluated the position and accepts the draw!</span>
                </div>
                <button
                  onClick={onAccept}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Agree to Draw (1/2 - 1/2)
                </button>
              </div>
            )}

            {botDecision === 'declined' && (
              <div className="space-y-4 my-3">
                <div className="flex items-center justify-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/30 py-2.5 px-3 rounded-xl text-xs font-semibold">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>Computer evaluated an advantage and declined the draw.</span>
                </div>
                <button
                  onClick={onDecline}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Play On
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
