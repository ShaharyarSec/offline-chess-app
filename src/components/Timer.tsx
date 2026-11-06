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
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
          isActive
            ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
            : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-zinc-700'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            color === 'w' ? 'bg-white ring-1 ring-slate-300' : 'bg-slate-800 ring-1 ring-slate-600'
          }`}
        />
        <span>{label || (color === 'w' ? 'White' : 'Black')}</span>
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
      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs font-bold transition-all ${
        isTimeOut
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
          : isLowTime && isActive
          ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300 animate-pulse border border-rose-400'
          : isActive
          ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
          : 'bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-700'
      }`}
    >
      <Clock className="w-3 h-3" />
      <span>{formatted}</span>
    </div>
  );
};
