import { Chess, type Square } from 'chess.js';
import type { BotDifficulty } from '../types/chess';
import { engineService } from './engineWorkerService';

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const val = PIECE_VALUES[piece.type] || 0;
      score += piece.color === 'w' ? val : -val;
    }
  }
  return score;
}

/**
 * Primary asynchronous entry point for bot move calculation
 * Offloaded to Web Worker to guarantee zero UI lag and no mobile browser freezing!
 */
export async function getBestBotMove(
  fen: string,
  difficulty: BotDifficulty
): Promise<{ from: Square; to: Square; promotion?: string } | null> {
  // 1. Attempt worker offload first
  const workerResult = await engineService.getBotMove(fen, difficulty);
  if (workerResult) {
    return {
      from: workerResult.from,
      to: workerResult.to,
      promotion: workerResult.promotion,
    };
  }

  // 2. Ultra-lightweight fallback if workers are completely disabled
  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const captures = moves.filter((m) => m.captured);
  if (captures.length > 0 && Math.random() < 0.6) {
    const chosen = captures[Math.floor(Math.random() * captures.length)];
    return { from: chosen.from, to: chosen.to, promotion: chosen.promotion };
  }
  const chosen = moves[Math.floor(Math.random() * moves.length)];
  return { from: chosen.from, to: chosen.to, promotion: chosen.promotion };
}
