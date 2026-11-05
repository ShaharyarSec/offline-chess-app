import { Chess, type Square } from 'chess.js';

// Standard piece values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (White's perspective; flipped for Black)
const PAWN_PST = [
  0,   0,   0,   0,   0,   0,   0,   0,
  50, 50,  50,  50,  50,  50,  50,  50,
  10, 10,  20,  30,  30,  20,  10,  10,
  5,   5,  10,  25,  25,  10,   5,   5,
  0,   0,   0,  20,  20,   0,   0,   0,
  5,  -5, -10,   0,   0, -10,  -5,   5,
  5,  10,  10, -20, -20,  10,  10,   5,
  0,   0,   0,   0,   0,   0,   0,   0,
];

const KNIGHT_PST = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const BISHOP_PST = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const ROOK_PST = [
  0,   0,   0,   0,   0,   0,   0,   0,
  5,  10,  10,  10,  10,  10,  10,   5,
 -5,   0,   0,   0,   0,   0,   0,  -5,
 -5,   0,   0,   0,   0,   0,   0,  -5,
 -5,   0,   0,   0,   0,   0,   0,  -5,
 -5,   0,   0,   0,   0,   0,   0,  -5,
 -5,   0,   0,   0,   0,   0,   0,  -5,
  0,   0,   0,   5,   5,   0,   0,   0,
];

const QUEEN_PST = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
   -5,   0,   5,   5,   5,   5,   0,  -5,
    0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20,
];

const KING_MID_PST = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
   20,  20,   0,   0,   0,   0,  20,  20,
   20,  30,  10,   0,   0,  10,  30,  20,
];

// Master Opening Repertoire
const OPENING_BOOK: Record<string, string[]> = {
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['c7c5', 'e7e5', 'e7e6', 'c7c6'],
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['d7d5', 'g8f6', 'e7e6', 'c7c5'],
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2': ['g1f3', 'f2f4', 'b1c3', 'd2d4'],
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2': ['g1f3', 'b1c3', 'c2c3', 'd2d4'],
};

// Memory-bounded transposition table to prevent mobile RAM bloat
const MAX_TT_ENTRIES = 25000;
const transpositionTable = new Map<string, { depth: number; score: number; bestMove?: any }>();

function clearOldEntriesIfFull() {
  if (transpositionTable.size > MAX_TT_ENTRIES) {
    transpositionTable.clear();
  }
}

export function evaluatePosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const baseVal = PIECE_VALUES[piece.type] || 0;
      let pstVal = 0;
      const index = piece.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;

      switch (piece.type) {
        case 'p': pstVal = PAWN_PST[index]; break;
        case 'n': pstVal = KNIGHT_PST[index]; break;
        case 'b': pstVal = BISHOP_PST[index]; break;
        case 'r': pstVal = ROOK_PST[index]; break;
        case 'q': pstVal = QUEEN_PST[index]; break;
        case 'k': pstVal = KING_MID_PST[index]; break;
      }

      const totalVal = baseVal + pstVal;
      if (piece.color === 'w') {
        score += totalVal;
      } else {
        score -= totalVal;
      }
    }
  }

  if (chess.inCheck()) {
    score += chess.turn() === 'w' ? -30 : 30;
  }

  return score;
}

function scoreMove(move: { piece: string; captured?: string; promotion?: string }): number {
  let score = 0;
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured] || 0;
    const attackerVal = PIECE_VALUES[move.piece] || 0;
    score += victimVal * 10 - attackerVal; // MVV-LVA
  }
  if (move.promotion) {
    score += (PIECE_VALUES[move.promotion] || 900) * 8;
  }
  return score;
}

function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  deadline: number,
  qDepth: number = 0
): number {
  if (performance.now() >= deadline || qDepth >= 3) {
    return evaluatePosition(chess);
  }

  const standPat = evaluatePosition(chess);
  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;
  }

  const captures = chess.moves({ verbose: true }).filter((m) => m.captured);
  captures.sort((a, b) => scoreMove(b) - scoreMove(a));

  for (const move of captures) {
    chess.move(move);
    const score = quiescence(chess, alpha, beta, !isMaximizing, deadline, qDepth + 1);
    chess.undo();

    if (isMaximizing) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }

  return isMaximizing ? alpha : beta;
}

function alphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  deadline: number
): { score: number; bestMove?: any; timeExpired?: boolean } {
  if (performance.now() >= deadline) {
    return { score: evaluatePosition(chess), timeExpired: true };
  }

  const fen = chess.fen();
  const cached = transpositionTable.get(fen);
  if (cached && cached.depth >= depth) {
    return { score: cached.score, bestMove: cached.bestMove };
  }

  if (depth === 0 || chess.isGameOver()) {
    const qScore = quiescence(chess, alpha, beta, isMaximizing, deadline, 0);
    return { score: qScore };
  }

  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) {
    return { score: evaluatePosition(chess) };
  }

  // Move ordering: PV move first (from cache), then captures, then quiet
  if (cached && cached.bestMove) {
    const pvIndex = moves.findIndex(
      (m) => m.from === cached.bestMove.from && m.to === cached.bestMove.to
    );
    if (pvIndex > 0) {
      const pv = moves.splice(pvIndex, 1)[0];
      moves.unshift(pv);
    }
  }
  moves.sort((a, b) => scoreMove(b) - scoreMove(a));

  let bestMove = moves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const res = alphaBeta(chess, depth - 1, alpha, beta, false, deadline);
      chess.undo();

      if (res.timeExpired) {
        return { score: maxEval, bestMove, timeExpired: true };
      }

      if (res.score > maxEval) {
        maxEval = res.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, res.score);
      if (beta <= alpha) break; // Beta cutoff
    }

    clearOldEntriesIfFull();
    transpositionTable.set(fen, { depth, score: maxEval, bestMove });
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const res = alphaBeta(chess, depth - 1, alpha, beta, true, deadline);
      chess.undo();

      if (res.timeExpired) {
        return { score: minEval, bestMove, timeExpired: true };
      }

      if (res.score < minEval) {
        minEval = res.score;
        bestMove = move;
      }
      beta = Math.min(beta, res.score);
      if (beta <= alpha) break; // Alpha cutoff
    }

    clearOldEntriesIfFull();
    transpositionTable.set(fen, { depth, score: minEval, bestMove });
    return { score: minEval, bestMove };
  }
}

// Worker message listener
self.onmessage = (event: MessageEvent) => {
  const { type, id, fen, difficulty, timeLimitMs, targetDepth } = event.data;

  // Handle position evaluation request (for draw offers or analysis)
  if (type === 'evaluate') {
    const chess = new Chess(fen);
    const evalScore = evaluatePosition(chess);
    self.postMessage({ id, type: 'eval_result', evalScore });
    return;
  }

  const startTime = performance.now();
  const deadline = startTime + (timeLimitMs || 500);
  const chess = new Chess(fen);

  if (chess.isGameOver()) {
    self.postMessage({ id, bestMove: null, depthReached: 0, evalScore: 0 });
    return;
  }

  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) {
    self.postMessage({ id, bestMove: null, depthReached: 0, evalScore: 0 });
    return;
  }

  // Level 1: Beginner (Random / Instant Heuristic)
  if (difficulty === 1) {
    const captures = legalMoves.filter((m) => m.captured);
    const chosen =
      captures.length > 0 && Math.random() < 0.55
        ? captures[Math.floor(Math.random() * captures.length)]
        : legalMoves[Math.floor(Math.random() * legalMoves.length)];

    self.postMessage({
      id,
      bestMove: { from: chosen.from, to: chosen.to, promotion: chosen.promotion },
      depthReached: 1,
      evalScore: evaluatePosition(chess),
    });
    return;
  }

  // Check Opening Book for Lv 3-5
  if (difficulty >= 3) {
    const bookOptions = OPENING_BOOK[fen];
    if (bookOptions && bookOptions.length > 0) {
      const chosenUci = bookOptions[Math.floor(Math.random() * bookOptions.length)];
      const from = chosenUci.substring(0, 2) as Square;
      const to = chosenUci.substring(2, 4) as Square;
      const promotion = chosenUci.length > 4 ? chosenUci[4] : undefined;

      const matching = legalMoves.find(
        (m) => m.from === from && m.to === to && (!promotion || m.promotion === promotion)
      );
      if (matching) {
        self.postMessage({
          id,
          bestMove: { from: matching.from, to: matching.to, promotion: matching.promotion },
          depthReached: 99, // book move
          evalScore: 0,
        });
        return;
      }
    }
  }

  // Iterative Deepening Minimax Search
  const isWhite = chess.turn() === 'w';
  let bestMoveOverall = legalMoves[0];
  let depthCompleted = 1;
  let finalScore = 0;

  const maxDepth = targetDepth || (difficulty === 2 ? 3 : difficulty === 3 ? 6 : difficulty === 4 ? 8 : 10);

  for (let d = 1; d <= maxDepth; d++) {
    if (performance.now() >= deadline) break;

    const result = alphaBeta(chess, d, -Infinity, Infinity, isWhite, deadline);
    if (!result.timeExpired && result.bestMove) {
      bestMoveOverall = result.bestMove;
      depthCompleted = d;
      finalScore = result.score;
    } else {
      break;
    }
  }

  self.postMessage({
    id,
    bestMove: {
      from: bestMoveOverall.from,
      to: bestMoveOverall.to,
      promotion: bestMoveOverall.promotion,
    },
    depthReached: depthCompleted,
    evalScore: finalScore,
  });
};
