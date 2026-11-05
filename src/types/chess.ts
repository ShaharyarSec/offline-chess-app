import type { Square, PieceSymbol, Color } from 'chess.js';
export type { Square, PieceSymbol, Color };

export type ScreenView = 'home' | 'game';

export type GameMode = 'bot' | 'pass-and-play' | 'puzzle';

export type BotDifficulty = 1 | 2 | 3 | 4 | 5;

export interface BotConfig {
  level: BotDifficulty;
  name: string;
  title: string;
  rating: number;
  avatar: string;
  description: string;
  depth: number;
  timeLimitMs: number;
}

export type BoardThemeId = 'emerald' | 'glass-ice' | 'charcoal' | 'walnut';

export type PieceSetId = 'neo' | 'wood' | 'minimalist';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  lightSquare: string;
  darkSquare: string;
  highlightMove: string;
  legalMoveDot: string;
  checkSquare: string;
  border: string;
  glowColor: string;
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  captured?: PieceSymbol;
  fenAfter: string;
  moveNumber: number;
}

export interface ChessPuzzle {
  id: string;
  title: string;
  rating: number;
  theme: string;
  description: string;
  fen: string;
  moves: string[]; // sequence of moves in UCI e.g. ["e2e4", "e7e5"]
  hint: string;
  playerColor: 'w' | 'b';
}

export interface GameSettings {
  boardTheme: BoardThemeId;
  pieceSet: PieceSetId;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  highlightLastMove: boolean;
  autoFlipBoard: boolean;
  flipBoard: boolean;
  timeControlSeconds: number; // 0 for untimed, 180 for 3 min, etc.
  incrementSeconds: number;
  darkMode: boolean;
}

export interface PlayerClocks {
  white: number;
  black: number;
  activeColor: Color | null;
  isRunning: boolean;
}

export interface SavedGameState {
  fen: string;
  gameMode: GameMode;
  userSide: Color;
  botDifficulty: BotDifficulty;
  moveHistory: MoveRecord[];
  clocks: PlayerClocks;
  timeControlSeconds: number;
  incrementSeconds: number;
  lastMove: { from: Square; to: Square } | null;
  timestamp: number;
}

export interface CompletedGameRecord {
  id: string;
  date: string;
  mode: GameMode;
  whitePlayer: string;
  blackPlayer: string;
  result: '1-0' | '0-1' | '1/2-1/2';
  outcomeTitle: string;
  reason: string;
  movesCount: number;
  pgn: string;
  finalFen: string;
}
