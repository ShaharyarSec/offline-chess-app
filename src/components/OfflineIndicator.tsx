import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/95 backdrop-blur-xs text-slate-950 px-3.5 py-1.5 text-xs font-semibold shadow-xl border border-amber-400 animate-in slide-in-from-bottom-2 duration-200">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Offline Mode — All features & AI run locally</span>
    </div>
  );
};
