import React from 'react';
import type { PieceSymbol, Color } from 'chess.js';
import type { PieceSetId } from '../types/chess';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  pieceSet?: PieceSetId;
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  pieceSet = 'neo',
  className = 'w-full h-full',
}) => {
  const isWhite = color === 'w';

  // --- Theme Gradient & Stroke Definitions ---
  let gradId = isWhite ? 'piece-white-grad' : 'piece-black-grad';
  let stroke = isWhite ? '#27272a' : '#09090b';
  let innerDetail = isWhite ? '#cbd5e1' : '#64748b';

  if (pieceSet === 'wood') {
    gradId = isWhite ? 'piece-wood-white' : 'piece-wood-black';
    stroke = isWhite ? '#78350f' : '#291404';
    innerDetail = isWhite ? '#fde68a' : '#92400e';
  } else if (pieceSet === 'minimalist') {
    gradId = isWhite ? 'piece-min-white' : 'piece-min-black';
    stroke = isWhite ? '#334155' : '#020617';
    innerDetail = isWhite ? '#f1f5f9' : '#475569';
  }

  const fill = `url(#${gradId})`;

  // Render Modern Minimalist Geometric Set
  if (pieceSet === 'minimalist') {
    return (
      <svg
        viewBox="0 0 45 45"
        className={`${className} select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-transform`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="piece-min-white" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#e2e8f0" />
          </linearGradient>
          <linearGradient id="piece-min-black" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#334155" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>

        <g stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          {type === 'p' && (
            <>
              <circle cx="22.5" cy="14" r="5" />
              <path d="M 16 38 C 16 28 20 22 20 20 L 25 20 C 25 22 29 28 29 38 Z" />
              <rect x="13" y="38" width="19" height="3" rx="1.5" />
            </>
          )}

          {type === 'n' && (
            <>
              <path d="M 14 38 L 31 38 C 31 34 29 26 31 16 C 30 14 26 10 22 9 C 18 10 13 14 13 22 C 13 26 17 26 17 28 C 17 31 14 33 14 38 Z" />
              <circle cx="18" cy="16" r="1.5" fill={isWhite ? '#0f172a' : '#ffffff'} stroke="none" />
              <path d="M 23 12 L 28 17" fill="none" strokeWidth="1.5" />
            </>
          )}

          {type === 'b' && (
            <>
              <path d="M 22.5 7 L 29 17 C 31 23 30 31 29 38 L 16 38 C 15 31 14 23 16 17 Z" />
              <path d="M 20 18 L 25 23" fill="none" stroke={stroke} strokeWidth="2" />
              <circle cx="22.5" cy="6" r="1.5" />
              <rect x="13" y="38" width="19" height="3" rx="1.5" />
            </>
          )}

          {type === 'r' && (
            <>
              <rect x="15" y="16" width="15" height="22" />
              <path d="M 13 16 L 32 16 L 32 10 L 29 10 L 29 13 L 24 13 L 24 10 L 21 10 L 21 13 L 16 13 L 16 10 L 13 10 Z" />
              <rect x="12" y="38" width="21" height="3" rx="1.5" />
            </>
          )}

          {type === 'q' && (
            <>
              <path d="M 14 38 L 31 38 L 33 18 L 27 25 L 22.5 13 L 18 25 L 12 18 Z" />
              <circle cx="12" cy="15" r="2" />
              <circle cx="22.5" cy="10" r="2" />
              <circle cx="33" cy="15" r="2" />
              <rect x="12" y="38" width="21" height="3" rx="1.5" />
            </>
          )}

          {type === 'k' && (
            <>
              <path d="M 14 38 L 31 38 C 32 29 34 23 29 18 C 26 15 19 15 16 18 C 11 23 13 29 14 38 Z" />
              <path d="M 22.5 7 L 22.5 14" strokeWidth="2" fill="none" />
              <path d="M 19 10 L 26 10" strokeWidth="2" fill="none" />
              <rect x="12" y="38" width="21" height="3" rx="1.5" />
            </>
          )}
        </g>
      </svg>
    );
  }

  // Render Neo or Wood Set
  return (
    <svg
      viewBox="0 0 45 45"
      className={`${className} select-none pointer-events-none drop-shadow-[0_3px_5px_rgba(0,0,0,0.35)] transition-transform`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Neo Gradients */}
        <linearGradient id="piece-white-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="65%" stop-color="#f8fafc" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </linearGradient>
        <linearGradient id="piece-black-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#334155" />
          <stop offset="40%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>

        {/* Vintage Wood Gradients */}
        <linearGradient id="piece-wood-white" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffedd5" />
          <stop offset="50%" stop-color="#fed7aa" />
          <stop offset="100%" stop-color="#fdba74" />
        </linearGradient>
        <linearGradient id="piece-wood-black" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#78350f" />
          <stop offset="60%" stop-color="#451a03" />
          <stop offset="100%" stop-color="#291404" />
        </linearGradient>
      </defs>

      {type === 'p' && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
          {isWhite && <path d="M 12 37.5 C 19 36 26 36 33 37.5" fill="none" stroke={stroke} strokeWidth="1.2" />}
        </g>
      )}

      {type === 'n' && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 22 10 C 32.5 11 38.5 18 38 39 L 15 39 C 15 30 25 32.5 23 18" />
          <path d="M 24 18 C 24.38 20.91 18.45 25.37 16 27 C 13 29 13.18 31.34 11 31 C 9.958 30.06 12.41 27.96 11 28 C 10 28 11.19 29.23 10 30 C 9 30 5.997 31 6 26 C 6 24 12 14 12 14 C 12 14 13.89 12.1 14 10.5 C 13.27 9.506 13.5 8.5 13.5 7.5 C 14.5 6.5 16.5 10 16.5 10 L 18.5 10 C 18.5 10 19.28 8.008 21 7 C 22 7 22 10 22 10" />
          <circle cx="15.5" cy="15.5" r="1.5" fill={isWhite ? '#0f172a' : '#f8fafc'} stroke="none" />
          <circle cx="10.5" cy="22.5" r="1" fill={isWhite ? '#0f172a' : '#f8fafc'} stroke="none" />
        </g>
      )}

      {type === 'b' && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 9 36 C 12.39 35.03 19.11 36.43 22.5 34 C 25.89 36.43 32.61 35.03 36 36 C 36 36 37.65 36.54 39 38 C 38.32 38.97 37.35 38.99 36 38.5 C 32.61 37.53 25.89 38.96 22.5 37.5 C 19.11 38.96 12.39 37.53 9 38.5 C 7.646 38.99 6.677 38.97 6 38 C 7.354 36.54 9 36 9 36 z" />
          <path d="M 15 32 C 17.5 34.5 27.5 34.5 30 32 C 30.5 30.5 30 30 30 30 C 30 27.5 27.5 26 27.5 26 C 33 24.5 33.5 14.5 22.5 10.5 C 11.5 14.5 12 24.5 17.5 26 C 17.5 26 15 27.5 15 30 C 15 30 14.5 30.5 15 32 z" />
          <circle cx="22.5" cy="8" r="2" fill={fill} stroke={stroke} />
          <path d="M 17.5 26 L 27.5 26" fill="none" stroke={stroke} />
          <path d="M 22.5 15 L 22.5 22.5" fill="none" stroke={innerDetail} strokeWidth="1.2" />
          <path d="M 19 18.5 L 26 18.5" fill="none" stroke={innerDetail} strokeWidth="1.2" />
        </g>
      )}

      {type === 'r' && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 9 39 L 36 39 L 36 36 L 9 36 z" />
          <path d="M 12 36 L 12 32 L 33 32 L 33 36 z" />
          <path d="M 11 14 L 11 9 L 15 9 L 15 11 L 20 11 L 20 9 L 25 9 L 25 11 L 30 11 L 30 9 L 34 9 L 34 14 z" />
          <path d="M 34 14 L 31 17 L 14 17 L 11 14" />
          <path d="M 14 17 L 14 29.5 L 31 29.5 L 31 17 z" />
          <path d="M 14 29.5 L 11 32 L 34 32 L 31 29.5" />
          <path d="M 14 17 L 31 17" fill="none" stroke={innerDetail} strokeWidth="1" />
        </g>
      )}

      {type === 'q' && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 9 26 C 17.5 24.5 30 24.5 36 26 L 38.5 31.5 L 6.5 31.5 z" />
          <path d="M 9 31.5 L 9 36 L 36 36 L 36 31.5 z" />
          <path d="M 9 36 L 9 39 L 36 39 L 36 36 z" />
          <path d="M 9 26 C 9 28 10.5 28 11.5 30 C 12.5 31.5 32.5 31.5 33.5 30 C 34.5 28 36 28 36 26 C 35.5 24.5 35 18 35 12 L 28 20 L 22.5 9 L 17 20 L 10 12 C 10 18 9.5 24.5 9 26 z" />
          <circle cx="6" cy="12" r="2" fill={fill} stroke={stroke} />
          <circle cx="14" cy="9" r="2" fill={fill} stroke={stroke} />
          <circle cx="22.5" cy="6" r="2" fill={fill} stroke={stroke} />
          <circle cx="31" cy="9" r="2" fill={fill} stroke={stroke} />
          <circle cx="39" cy="12" r="2" fill={fill} stroke={stroke} />
        </g>
      )}

      {type === 'k' && (
        <g stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill}>
          <path d="M 22.5 11.63 L 22.5 6" fill="none" stroke={stroke} strokeWidth="1.8" />
          <path d="M 20 8 L 25 8" fill="none" stroke={stroke} strokeWidth="1.8" />
          <path d="M 22.5 25 C 22.5 25 27 17.5 25.5 14.5 C 24 11.5 21 11.5 19.5 14.5 C 18 17.5 22.5 25 22.5 25 z" />
          <path d="M 11.5 37 C 17 40.5 28 40.5 33.5 37 C 36.5 35 34.5 32 34.5 32 C 34.5 32 37.5 29.5 36.5 26 C 35.5 22.5 32 20.5 28.5 20.5 C 27 20.5 25.5 21.5 25.5 21.5 C 25.5 21.5 24.5 19.5 22.5 19.5 C 20.5 19.5 19.5 21.5 19.5 21.5 C 19.5 21.5 18 20.5 16.5 20.5 C 13 20.5 9.5 22.5 8.5 26 C 7.5 29.5 10.5 32 10.5 32 C 10.5 32 8.5 35 11.5 37 z" />
          <path d="M 11.5 30 C 17 27 28 27 33.5 30" fill="none" stroke={stroke} />
          <path d="M 11.5 33.5 C 17 30.5 28 30.5 33.5 33.5" fill="none" stroke={stroke} />
          <path d="M 11.5 37 C 17 34 28 34 33.5 37" fill="none" stroke={stroke} />
        </g>
      )}
    </svg>
  );
};
