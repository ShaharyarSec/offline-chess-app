import React from 'react';
import { Clock } from 'lucide-react';
import type { Color } from 'chess.js';

interface TimerProps {
  secondsRemaining: number;
  isActive: boolean;
  color: Color;
  label?: string;
  isUntimed?: boolean;
}

export const Timer: React.FC<TimerProps> = ({
  secondsRemaining,
  isActive,
  color,
  label,
  isUntimed = false,
}) => {
  if (isUntimed) {
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
          isActive
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 ring-2 ring-amber-400/20'
            : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            color === 'w' ? 'bg-white ring-1 ring-slate-400' : 'bg-slate-800 ring-1 ring-slate-600'
          }`}
        />
        <span>{label || (color === 'w' ? 'White' : 'Black')}</span>
        {isActive && <span className="text-[10px] text-amber-400 font-semibold">• Turn</span>}
      </div>
    );
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = secondsRemaining <= 30 && secondsRemaining > 0;
  const isTimeOut = secondsRemaining <= 0;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold transition-all ${
        isTimeOut
          ? 'bg-red-950/80 border-red-500 text-red-400'
          : isLowTime && isActive
          ? 'bg-red-950/50 border-red-500/80 text-red-300 animate-pulse ring-2 ring-red-500/30'
          : isActive
          ? 'bg-amber-500/20 border-amber-400/60 text-amber-300 ring-2 ring-amber-400/30 shadow-md'
          : 'bg-slate-900/80 border-slate-800 text-slate-400'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
      <span>{formatted}</span>
      {label && <span className="font-sans text-[11px] font-medium text-slate-400">({label})</span>}
    </div>
  );
};
