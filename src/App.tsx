import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  RefreshCw,
  Trophy,
  Bot,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Flag,
  Handshake,
  ChevronLeft,
  Share2,
  History,
  Home,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import type {
  ScreenView,
  GameMode,
  BotDifficulty,
  BoardThemeId,
  PieceSetId,
  GameSettings,
  MoveRecord,
  PlayerClocks,
  SavedGameState,
  CompletedGameRecord,
} from './types/chess';
import { BOARD_THEMES, BOT_CONFIGS } from './data/themes';
import { CHESS_PUZZLES } from './data/puzzles';
import { soundManager } from './utils/audio';
import { getBestBotMove } from './utils/engine';
import { engineService } from './utils/engineWorkerService';

import { HomeDashboard } from './components/HomeDashboard';
import { ChessBoard } from './components/ChessBoard';
import { MoveHistory } from './components/MoveHistory';
import { CapturedPieces } from './components/CapturedPieces';
import { Timer } from './components/Timer';
import { PromotionModal } from './components/PromotionModal';
import { SettingsModal } from './components/SettingsModal';
import { PuzzlePanel } from './components/PuzzlePanel';
import { MatchHistoryDrawer } from './components/MatchHistoryDrawer';
import { DrawOfferModal } from './components/DrawOfferModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const DEFAULT_SETTINGS: GameSettings = {
  boardTheme: 'glass-ice',
  pieceSet: 'neo',
  soundEnabled: true,
  showLegalMoves: true,
  highlightLastMove: true,
  autoFlipBoard: false,
  flipBoard: false,
  timeControlSeconds: 0,
  incrementSeconds: 0,
  darkMode: true,
};

const SAVED_MATCH_KEY = 'gm_chess_active_match';
const HISTORY_MATCHES_KEY = 'gm_chess_completed_matches';

export default function App() {
  // --- Navigation & View Mode ---
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [gameMode, setGameMode] = useState<GameMode>('bot');

  // --- Settings State ---
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('gm_chess_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>(() => {
    try {
      const saved = localStorage.getItem('gm_chess_bot_difficulty');
      if (saved) return parseInt(saved) as BotDifficulty;
    } catch {}
    return 3;
  });

  const [userSide, setUserSide] = useState<Color>('w');
  const [isBotThinking, setIsBotThinking] = useState(false);

  // --- Completed Match History (last 10 games) ---
  const [completedMatches, setCompletedMatches] = useState<CompletedGameRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_MATCHES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // --- Auto-Saved Active Match State ---
  const [savedActiveMatch, setSavedActiveMatch] = useState<SavedGameState | null>(() => {
    try {
      const saved = localStorage.getItem(SAVED_MATCH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // --- Core Chess Instance ---
  const chessRef = useRef<Chess>(new Chess());
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger((n) => n + 1);

  // --- Move & Position State ---
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  // --- Pawn Promotion Modal ---
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: Color;
  } | null>(null);

  // --- Clocks State ---
  const [clocks, setClocks] = useState<PlayerClocks>({
    white: 0,
    black: 0,
    activeColor: null,
    isRunning: false,
  });

  // --- Modals State ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isDrawOfferOpen, setIsDrawOfferOpen] = useState(false);
  const [drawOfferBotDecision, setDrawOfferBotDecision] = useState<'evaluating' | 'accepted' | 'declined' | null>(null);

  const [gameResultModal, setGameResultModal] = useState<{
    title: string;
    subtitle: string;
    reason: string;
    result: '1-0' | '0-1' | '1/2-1/2';
  } | null>(null);

  // --- Puzzle State ---
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleMoveStep, setPuzzleMoveStep] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'playing' | 'success' | 'failed'>('playing');
  const [puzzleFeedback, setPuzzleFeedback] = useState<string>('');
  const [puzzleSolvedCount, setPuzzleSolvedCount] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('gm_chess_puzzles_solved') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [puzzleStreak, setPuzzleStreak] = useState<number>(0);

  // Sync sound settings with audio engine
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('gm_chess_settings', JSON.stringify(settings));
  }, [settings]);

  // Persist bot difficulty
  useEffect(() => {
    localStorage.setItem('gm_chess_bot_difficulty', botDifficulty.toString());
  }, [botDifficulty]);

  // Persist completed matches
  useEffect(() => {
    localStorage.setItem(HISTORY_MATCHES_KEY, JSON.stringify(completedMatches.slice(0, 10)));
  }, [completedMatches]);

  // Persist puzzle progress
  useEffect(() => {
    localStorage.setItem('gm_chess_puzzles_solved', puzzleSolvedCount.toString());
  }, [puzzleSolvedCount]);

  // Clock countdown ticker
  useEffect(() => {
    if (!clocks.isRunning || clocks.white <= 0 || clocks.black <= 0 || settings.timeControlSeconds === 0) {
      return;
    }

    const timer = setInterval(() => {
      setClocks((prev) => {
        if (!prev.isRunning || !prev.activeColor) return prev;
        const color = prev.activeColor;
        const current = prev[color === 'w' ? 'white' : 'black'];
        if (current <= 1) {
          clearInterval(timer);
          const winner = color === 'w' ? 'Black' : 'White';
          const outcomeRes: '1-0' | '0-1' = color === 'w' ? '0-1' : '1-0';
          handleGameEnd(
            `${winner} Wins on Time!`,
            `${color === 'w' ? 'White' : 'Black'} flagged out of time.`,
            'Timeout',
            outcomeRes
          );
          soundManager.playDefeat();
          return {
            ...prev,
            [color === 'w' ? 'white' : 'black']: 0,
            isRunning: false,
          };
        }

        return {
          ...prev,
          [color === 'w' ? 'white' : 'black']: current - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clocks.isRunning, clocks.activeColor, settings.timeControlSeconds]);

  // Auto-Save Active Match to localStorage whenever moveHistory or position changes
  useEffect(() => {
    if (gameMode === 'puzzle') return; // Don't auto-save puzzles

    if (moveHistory.length > 0 && !chessRef.current.isGameOver()) {
      const stateToSave: SavedGameState = {
        fen: chessRef.current.fen(),
        gameMode,
        userSide,
        botDifficulty,
        moveHistory,
        clocks,
        timeControlSeconds: settings.timeControlSeconds,
        incrementSeconds: settings.incrementSeconds,
        lastMove,
        timestamp: Date.now(),
      };
      localStorage.setItem(SAVED_MATCH_KEY, JSON.stringify(stateToSave));
      setSavedActiveMatch(stateToSave);
    }
  }, [moveHistory, gameMode, userSide, botDifficulty, clocks, lastMove, settings]);

  // Recalculate captured pieces
  const recalculateCaptured = (chess: Chess) => {
    const board = chess.board();
    const currentCounts: Record<string, number> = {
      wp: 0, wn: 0, wb: 0, wr: 0, wq: 0,
      bp: 0, bn: 0, bb: 0, br: 0, bq: 0,
    };
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type !== 'k') {
          currentCounts[`${piece.color}${piece.type}`]++;
        }
      }
    }
    const startingCounts: Record<string, number> = {
      p: 8, n: 2, b: 2, r: 2, q: 1,
    };
    const whiteCaptured: PieceSymbol[] = [];
    const blackCaptured: PieceSymbol[] = [];

    (['p', 'n', 'b', 'r', 'q'] as PieceSymbol[]).forEach((type) => {
      const lostBlack = startingCounts[type] - currentCounts[`b${type}`];
      for (let i = 0; i < lostBlack; i++) whiteCaptured.push(type);

      const lostWhite = startingCounts[type] - currentCounts[`w${type}`];
      for (let i = 0; i < lostWhite; i++) blackCaptured.push(type);
    });

    setCapturedByWhite(whiteCaptured);
    setCapturedByBlack(blackCaptured);
  };

  // Generate standard PGN format text
  const generatePgn = (overrideResult?: string): string => {
    const whitePlayer =
      gameMode === 'bot'
        ? userSide === 'w'
          ? 'Human Player'
          : BOT_CONFIGS[botDifficulty].name
        : 'Player 1';
    const blackPlayer =
      gameMode === 'bot'
        ? userSide === 'b'
          ? 'Human Player'
          : BOT_CONFIGS[botDifficulty].name
        : 'Player 2';

    let resultTag = overrideResult || '*';
    if (!overrideResult) {
      if (chessRef.current.isCheckmate()) {
        resultTag = chessRef.current.turn() === 'w' ? '0-1' : '1-0';
      } else if (chessRef.current.isDraw()) {
        resultTag = '1/2-1/2';
      }
    }

    const headers = [
      `[Event "Grandmaster Chess PWA"]`,
      `[Site "Offline Web Engine"]`,
      `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}"]`,
      `[Round "1"]`,
      `[White "${whitePlayer}"]`,
      `[Black "${blackPlayer}"]`,
      `[Result "${resultTag}"]`,
    ].join('\n');

    let movesText = '';
    for (let i = 0; i < moveHistory.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      movesText += `${num}. ${moveHistory[i].san} `;
      if (moveHistory[i + 1]) {
        movesText += `${moveHistory[i + 1].san} `;
      }
    }

    return `${headers}\n\n${movesText.trim()} ${resultTag}`;
  };

  // Archive a completed game record
  const archiveCompletedMatch = (
    title: string,
    reason: string,
    result: '1-0' | '0-1' | '1/2-1/2'
  ) => {
    const pgn = generatePgn(result);
    const whiteName =
      gameMode === 'bot'
        ? userSide === 'w'
          ? 'Player'
          : BOT_CONFIGS[botDifficulty].name
        : 'Player 1';
    const blackName =
      gameMode === 'bot'
        ? userSide === 'b'
          ? 'Player'
          : BOT_CONFIGS[botDifficulty].name
        : 'Player 2';

    const newMatch: CompletedGameRecord = {
      id: `match_${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: gameMode,
      whitePlayer: whiteName,
      blackPlayer: blackName,
      result,
      outcomeTitle: title,
      reason,
      movesCount: moveHistory.length,
      pgn,
      finalFen: chessRef.current.fen(),
    };

    setCompletedMatches((prev) => [newMatch, ...prev].slice(0, 10));
    // Clear active saved game
    localStorage.removeItem(SAVED_MATCH_KEY);
    setSavedActiveMatch(null);
  };

  // Handle Game End Trigger
  const handleGameEnd = (
    title: string,
    subtitle: string,
    reason: string,
    result: '1-0' | '0-1' | '1/2-1/2'
  ) => {
    setGameResultModal({ title, subtitle, reason, result });
    archiveCompletedMatch(title, reason, result);
  };

  // Start a fresh game
  const startNewGame = useCallback(
    (mode: GameMode = gameMode, playerSide: Color = userSide, botLvl: BotDifficulty = botDifficulty) => {
      const newChess = new Chess();
      chessRef.current = newChess;
      setMoveHistory([]);
      setHistoryIndex(-1);
      setLastMove(null);
      setCapturedByWhite([]);
      setCapturedByBlack([]);
      setPendingPromotion(null);
      setGameResultModal(null);
      setGameMode(mode);
      setUserSide(playerSide);
      setBotDifficulty(botLvl);
      setCurrentView('game');

      setClocks({
        white: settings.timeControlSeconds,
        black: settings.timeControlSeconds,
        activeColor: null,
        isRunning: false,
      });

      if (mode === 'puzzle') {
        loadPuzzle(currentPuzzleIndex);
      } else if (mode === 'bot' && playerSide === 'b') {
        forceUpdate();
        triggerBotMove(newChess, botLvl);
      } else {
        forceUpdate();
      }
    },
    [gameMode, userSide, botDifficulty, currentPuzzleIndex, settings.timeControlSeconds]
  );

  // Resume saved ongoing match
  const handleResumeSavedMatch = () => {
    if (!savedActiveMatch) return;
    try {
      const resumedChess = new Chess(savedActiveMatch.fen);
      chessRef.current = resumedChess;
      setGameMode(savedActiveMatch.gameMode);
      setUserSide(savedActiveMatch.userSide);
      setBotDifficulty(savedActiveMatch.botDifficulty);
      setMoveHistory(savedActiveMatch.moveHistory);
      setHistoryIndex(savedActiveMatch.moveHistory.length - 1);
      setLastMove(savedActiveMatch.lastMove);
      setClocks(savedActiveMatch.clocks);
      recalculateCaptured(resumedChess);
      setCurrentView('game');
      forceUpdate();
    } catch (e) {
      console.warn('Failed to resume match:', e);
      startNewGame();
    }
  };

  const handleDiscardSavedMatch = () => {
    localStorage.removeItem(SAVED_MATCH_KEY);
    setSavedActiveMatch(null);
  };

  // Load a tactical puzzle
  const loadPuzzle = useCallback(
    (index: number) => {
      const puzzle = CHESS_PUZZLES[index];
      if (!puzzle) return;

      const pChess = new Chess(puzzle.fen);
      chessRef.current = pChess;
      setMoveHistory([]);
      setHistoryIndex(-1);
      setLastMove(null);
      setPendingPromotion(null);
      setPuzzleMoveStep(0);
      setPuzzleStatus('playing');
      setPuzzleFeedback('');
      setGameResultModal(null);
      recalculateCaptured(pChess);
      forceUpdate();
    },
    []
  );

  // Asynchronous Bot move trigger (Web Worker)
  const triggerBotMove = async (chessInstance: Chess, lvl: BotDifficulty = botDifficulty) => {
    if (chessInstance.isGameOver()) return;
    setIsBotThinking(true);

    try {
      const fen = chessInstance.fen();
      const botMove = await getBestBotMove(fen, lvl);
      if (!botMove) {
        setIsBotThinking(false);
        return;
      }

      const moveResult = chessInstance.move({
        from: botMove.from,
        to: botMove.to,
        promotion: (botMove.promotion as PieceSymbol) || 'q',
      });

      if (moveResult) {
        if (moveResult.captured) {
          soundManager.playCapture();
        } else if (moveResult.san.includes('O-O')) {
          soundManager.playCastle();
        } else {
          soundManager.playMove();
        }

        if (chessInstance.inCheck()) {
          soundManager.playCheck();
        }

        setLastMove({ from: moveResult.from as Square, to: moveResult.to as Square });
        recalculateCaptured(chessInstance);

        const newRecord: MoveRecord = {
          san: moveResult.san,
          from: moveResult.from as Square,
          to: moveResult.to as Square,
          piece: moveResult.piece,
          color: moveResult.color,
          captured: moveResult.captured,
          fenAfter: chessInstance.fen(),
          moveNumber: Math.floor(moveHistory.length / 2) + 1,
        };

        setMoveHistory((prev) => [...prev, newRecord]);
        setHistoryIndex((prev) => prev + 1);

        // Update Clocks
        setClocks((prev) => ({
          ...prev,
          activeColor: chessInstance.turn(),
          [moveResult.color === 'w' ? 'white' : 'black']:
            prev[moveResult.color === 'w' ? 'white' : 'black'] + settings.incrementSeconds,
        }));

        checkGameEnd(chessInstance);
      }
    } catch (err) {
      console.error('Bot move error:', err);
    } finally {
      setIsBotThinking(false);
      forceUpdate();
    }
  };

  // Check end conditions
  const checkGameEnd = (chess: Chess) => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Black' : 'White';
      const outcome: '1-0' | '0-1' = chess.turn() === 'w' ? '0-1' : '1-0';
      handleGameEnd(
        `Checkmate! ${winner} Wins!`,
        `${winner} has delivered a decisive checkmate.`,
        'Checkmate',
        outcome
      );

      if ((gameMode === 'bot' && userSide === (chess.turn() === 'w' ? 'b' : 'w')) || gameMode === 'pass-and-play') {
        soundManager.playVictory();
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      } else {
        soundManager.playDefeat();
      }
    } else if (chess.isStalemate()) {
      handleGameEnd(
        'Draw by Stalemate!',
        'The active player has no legal moves and is not in check.',
        'Stalemate',
        '1/2-1/2'
      );
      soundManager.playDefeat();
    } else if (chess.isThreefoldRepetition()) {
      handleGameEnd(
        'Draw by Threefold Repetition!',
        'The identical board position has repeated 3 times.',
        'Threefold Repetition',
        '1/2-1/2'
      );
    } else if (chess.isInsufficientMaterial()) {
      handleGameEnd(
        'Draw by Insufficient Material!',
        'Neither side has enough remaining pieces to force mate.',
        'Insufficient Material',
        '1/2-1/2'
      );
    }
  };

  // Board Move Handler
  const handleBoardMove = (from: Square, to: Square, chosenPromotion?: PieceSymbol): boolean => {
    if (isBotThinking) return false;
    const chess = chessRef.current;
    if (chess.isGameOver()) return false;

    // Check promotion condition
    const piece = chess.get(from);
    if (piece && piece.type === 'p') {
      const isWhitePromoting = piece.color === 'w' && to.endsWith('8');
      const isBlackPromoting = piece.color === 'b' && to.endsWith('1');
      if ((isWhitePromoting || isBlackPromoting) && !chosenPromotion) {
        setPendingPromotion({ from, to, color: piece.color });
        return false;
      }
    }

    try {
      // Puzzle validation
      if (gameMode === 'puzzle') {
        const puzzle = CHESS_PUZZLES[currentPuzzleIndex];
        const moveUci = `${from}${to}${chosenPromotion || ''}`;
        const expectedMove = puzzle.moves[puzzleMoveStep];

        if (moveUci === expectedMove || moveUci.startsWith(expectedMove)) {
          const moveResult = chess.move({ from, to, promotion: chosenPromotion || 'q' });
          if (!moveResult) return false;

          soundManager.playMove();
          setLastMove({ from, to });
          recalculateCaptured(chess);
          forceUpdate();

          const nextStep = puzzleMoveStep + 1;
          setPuzzleMoveStep(nextStep);

          if (nextStep >= puzzle.moves.length) {
            setPuzzleStatus('success');
            setPuzzleFeedback('Brilliant tactical solution!');
            soundManager.playVictory();
            confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
            setPuzzleSolvedCount((prev) => prev + 1);
            setPuzzleStreak((prev) => prev + 1);
          } else {
            setTimeout(() => {
              const oppMoveUci = puzzle.moves[nextStep];
              const oppFrom = oppMoveUci.substring(0, 2) as Square;
              const oppTo = oppMoveUci.substring(2, 4) as Square;
              const oppProm = (oppMoveUci.length > 4 ? oppMoveUci[4] : undefined) as PieceSymbol | undefined;

              const oppRes = chess.move({ from: oppFrom, to: oppTo, promotion: oppProm || 'q' });
              if (oppRes) {
                soundManager.playMove();
                setLastMove({ from: oppFrom, to: oppTo });
                recalculateCaptured(chess);
                setPuzzleMoveStep(nextStep + 1);
                forceUpdate();
              }
            }, 350);
          }
          return true;
        } else {
          soundManager.playIllegal();
          setPuzzleStatus('failed');
          setPuzzleFeedback('That move is not part of the winning sequence.');
          setPuzzleStreak(0);
          return false;
        }
      }

      // Standard Move
      const moveResult = chess.move({
        from,
        to,
        promotion: chosenPromotion || 'q',
      });

      if (!moveResult) {
        soundManager.playIllegal();
        return false;
      }

      if (moveResult.captured) {
        soundManager.playCapture();
      } else if (moveResult.san.includes('O-O')) {
        soundManager.playCastle();
      } else if (chosenPromotion) {
        soundManager.playPromote();
      } else {
        soundManager.playMove();
      }

      if (chess.inCheck()) {
        soundManager.playCheck();
      }

      setLastMove({ from, to });
      recalculateCaptured(chess);

      const newRecord: MoveRecord = {
        san: moveResult.san,
        from: moveResult.from as Square,
        to: moveResult.to as Square,
        piece: moveResult.piece,
        color: moveResult.color,
        captured: moveResult.captured,
        fenAfter: chess.fen(),
        moveNumber: Math.floor(moveHistory.length / 2) + 1,
      };

      setMoveHistory((prev) => [...prev, newRecord]);
      setHistoryIndex((prev) => prev + 1);

      setClocks((prev) => ({
        ...prev,
        isRunning: true,
        activeColor: chess.turn(),
        [moveResult.color === 'w' ? 'white' : 'black']:
          prev[moveResult.color === 'w' ? 'white' : 'black'] + settings.incrementSeconds,
      }));

      checkGameEnd(chess);

      if (gameMode === 'pass-and-play' && settings.autoFlipBoard) {
        setSettings((prev) => ({ ...prev, flipBoard: !prev.flipBoard }));
      }

      forceUpdate();

      if (gameMode === 'bot' && !chess.isGameOver()) {
        triggerBotMove(chess);
      }

      return true;
    } catch (err) {
      console.error('Move execution error:', err);
      soundManager.playIllegal();
      return false;
    }
  };

  const handlePromotionSelect = (piece: PieceSymbol) => {
    if (pendingPromotion) {
      handleBoardMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  const handleGoToMove = (targetIndex: number) => {
    if (targetIndex < -1 || targetIndex >= moveHistory.length) return;

    if (targetIndex === -1) {
      const startChess = new Chess();
      chessRef.current = startChess;
      setHistoryIndex(-1);
      setLastMove(null);
      recalculateCaptured(startChess);
    } else {
      const targetRecord = moveHistory[targetIndex];
      const targetChess = new Chess(targetRecord.fenAfter);
      chessRef.current = targetChess;
      setHistoryIndex(targetIndex);
      setLastMove({ from: targetRecord.from, to: targetRecord.to });
      recalculateCaptured(targetChess);
    }
    forceUpdate();
  };

  const handleUndo = () => {
    if (isBotThinking) return;
    const chess = chessRef.current;
    if (gameMode === 'bot') {
      chess.undo();
      chess.undo();
      const updatedHistory = moveHistory.slice(0, -2);
      setMoveHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      const prevMove = updatedHistory[updatedHistory.length - 1];
      setLastMove(prevMove ? { from: prevMove.from, to: prevMove.to } : null);
      recalculateCaptured(chess);
    } else {
      const undone = chess.undo();
      if (undone) {
        const updatedHistory = moveHistory.slice(0, -1);
        setMoveHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
        const prevMove = updatedHistory[updatedHistory.length - 1];
        setLastMove(prevMove ? { from: prevMove.from, to: prevMove.to } : null);
        recalculateCaptured(chess);
      }
    }
    soundManager.playMove();
    forceUpdate();
  };

  const handleRedo = () => {
    if (historyIndex < moveHistory.length - 1) {
      handleGoToMove(historyIndex + 1);
    }
  };

  const toggleFlipBoard = () => {
    setSettings((prev) => ({ ...prev, flipBoard: !prev.flipBoard }));
  };

  // Dedicated Resign Flow
  const handleResign = () => {
    const activeColor = chessRef.current.turn();
    const winner = activeColor === 'w' ? 'Black' : 'White';
    const outcome: '1-0' | '0-1' = activeColor === 'w' ? '0-1' : '1-0';
    handleGameEnd(
      `${winner} Wins by Resignation!`,
      `${activeColor === 'w' ? 'White' : 'Black'} has resigned the match.`,
      'Resignation',
      outcome
    );
    soundManager.playDefeat();
  };

  // Dedicated Draw Offer Flow
  const handleInitiateDrawOffer = async () => {
    if (chessRef.current.isGameOver() || isBotThinking) return;
    setIsDrawOfferOpen(true);

    if (gameMode === 'bot') {
      setDrawOfferBotDecision('evaluating');
      const evalScore = await engineService.evaluateFen(chessRef.current.fen());
      // Bot accepts if position is balanced (|score| <= 65 cp) or player is winning
      const botPerspectiveScore = userSide === 'w' ? -evalScore : evalScore;
      setTimeout(() => {
        if (botPerspectiveScore < 70) {
          setDrawOfferBotDecision('accepted');
        } else {
          setDrawOfferBotDecision('declined');
        }
      }, 400);
    }
  };

  const handleAcceptDraw = () => {
    setIsDrawOfferOpen(false);
    setDrawOfferBotDecision(null);
    handleGameEnd(
      'Game Drawn by Mutual Agreement!',
      'Both players agreed to conclude the match in a peaceful draw.',
      'Draw Agreed',
      '1/2-1/2'
    );
  };

  const handleDeclineDraw = () => {
    setIsDrawOfferOpen(false);
    setDrawOfferBotDecision(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFlipBoard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHistory.length, historyIndex, isBotThinking]);

  const isBoardFlipped =
    gameMode === 'bot'
      ? userSide === 'b'
      : gameMode === 'puzzle'
      ? CHESS_PUZZLES[currentPuzzleIndex]?.playerColor === 'b'
      : settings.flipBoard;

  const currentTurn = chessRef.current.turn();
  const topColor: Color = isBoardFlipped ? 'w' : 'b';
  const bottomColor: Color = isBoardFlipped ? 'b' : 'w';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950">
      <OfflineIndicator />

      {/* iOS-Inspired Top Bar */}
      <header className="sticky top-0 z-30 px-3 sm:px-6 py-2.5 bg-slate-900/60 backdrop-blur-2xl border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left Title / Home Back Action */}
          <div className="flex items-center gap-2">
            {currentView === 'game' ? (
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold backdrop-blur-xl transition active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/30">
                  ♟
                </div>
                <span className="font-black text-sm tracking-tight text-white hidden sm:inline">
                  GM Chess
                </span>
              </div>
            )}

            {currentView === 'game' && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <span className="capitalize px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                  {gameMode === 'bot'
                    ? `vs ${BOT_CONFIGS[botDifficulty].name}`
                    : gameMode === 'pass-and-play'
                    ? '1v1 Pass & Play'
                    : 'Tactical Puzzle'}
                </span>
              </div>
            )}
          </div>

          {/* Quick Header Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PWAInstallButton />

            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Completed Matches Archive"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Customization & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      {currentView === 'home' ? (
        <HomeDashboard
          onSelectMode={(mode, botLvl, side) => {
            startNewGame(mode, side || 'w', botLvl || botDifficulty);
          }}
          onResumeSavedGame={handleResumeSavedMatch}
          onDiscardSavedGame={handleDiscardSavedMatch}
          savedGame={savedActiveMatch}
          botDifficulty={botDifficulty}
          onSelectBotDifficulty={(lvl) => setBotDifficulty(lvl)}
          puzzleSolvedCount={puzzleSolvedCount}
          totalPuzzles={CHESS_PUZZLES.length}
          puzzleStreak={puzzleStreak}
          matchesCompletedCount={completedMatches.length}
          onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        /* In-Game Glass Arena */
        <main className="flex-1 max-w-7xl mx-auto w-full p-2.5 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start animate-in fade-in duration-200">
          {/* Board & Player Indicators */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center space-y-2.5">
            {/* Top Player Glass Pill */}
            <div className="w-full max-w-[540px] flex items-center justify-between px-3 py-2 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {gameMode === 'bot'
                    ? topColor === (userSide === 'w' ? 'b' : 'w')
                      ? BOT_CONFIGS[botDifficulty].avatar
                      : '👤'
                    : '👤'}
                </span>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                    <span>
                      {gameMode === 'bot'
                        ? topColor === (userSide === 'w' ? 'b' : 'w')
                          ? `${BOT_CONFIGS[botDifficulty].name} (~${BOT_CONFIGS[botDifficulty].rating})`
                          : 'Player'
                        : topColor === 'b'
                        ? 'Black Player'
                        : 'White Player'}
                    </span>
                    {isBotThinking && topColor === (userSide === 'w' ? 'b' : 'w') && (
                      <span className="text-[10px] text-amber-400 font-mono animate-pulse">
                        Calculating...
                      </span>
                    )}
                  </div>
                  <CapturedPieces
                    capturedByWhite={capturedByWhite}
                    capturedByBlack={capturedByBlack}
                    color={topColor}
                  />
                </div>
              </div>

              <Timer
                secondsRemaining={clocks[topColor === 'w' ? 'white' : 'black']}
                isActive={clocks.isRunning && currentTurn === topColor}
                color={topColor}
                isUntimed={settings.timeControlSeconds === 0}
              />
            </div>

            {/* ChessBoard Component */}
            <ChessBoard
              chess={chessRef.current}
              themeId={settings.boardTheme}
              pieceSet={settings.pieceSet}
              isFlipped={isBoardFlipped}
              showLegalMoves={settings.showLegalMoves}
              highlightLastMove={settings.highlightLastMove}
              lastMove={lastMove}
              interactive={!isBotThinking && (gameMode !== 'puzzle' || puzzleStatus === 'playing')}
              onMove={handleBoardMove}
            />

            {/* Bottom Player Glass Pill */}
            <div className="w-full max-w-[540px] flex items-center justify-between px-3 py-2 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">
                  {gameMode === 'bot'
                    ? bottomColor === userSide
                      ? '👤'
                      : BOT_CONFIGS[botDifficulty].avatar
                    : '👤'}
                </span>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-slate-200">
                    <span>
                      {gameMode === 'bot'
                        ? bottomColor === userSide
                          ? 'Player (You)'
                          : `${BOT_CONFIGS[botDifficulty].name} (~${BOT_CONFIGS[botDifficulty].rating})`
                        : bottomColor === 'w'
                        ? 'White Player'
                        : 'Black Player'}
                    </span>
                    {currentTurn === bottomColor && !chessRef.current.isGameOver() && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>
                  <CapturedPieces
                    capturedByWhite={capturedByWhite}
                    capturedByBlack={capturedByBlack}
                    color={bottomColor}
                  />
                </div>
              </div>

              <Timer
                secondsRemaining={clocks[bottomColor === 'w' ? 'white' : 'black']}
                isActive={clocks.isRunning && currentTurn === bottomColor}
                color={bottomColor}
                isUntimed={settings.timeControlSeconds === 0}
              />
            </div>

            {/* Quick Game Controls Bar (Resign, Offer Draw, Flip, New Game) */}
            <div className="w-full max-w-[540px] flex items-center justify-between px-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleFlipBoard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer active:scale-95"
                  title="Flip Board Orientation (F)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flip</span>
                </button>

                <button
                  onClick={() => startNewGame()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer active:scale-95"
                  title="Start a Fresh Match"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>

              {gameMode !== 'puzzle' && (
                <div className="flex items-center gap-1.5">
                  {/* Dedicated Offer Draw Button */}
                  <button
                    onClick={handleInitiateDrawOffer}
                    disabled={moveHistory.length === 0 || chessRef.current.isGameOver() || isBotThinking}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-400 border border-white/10 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
                    title="Offer a Peaceful Draw"
                  >
                    <Handshake className="w-3.5 h-3.5 text-amber-400" />
                    <span>Offer Draw</span>
                  </button>

                  {/* Dedicated Resign Button */}
                  <button
                    onClick={handleResign}
                    disabled={moveHistory.length === 0 || chessRef.current.isGameOver()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95"
                    title="Resign Current Game"
                  >
                    <Flag className="w-3.5 h-3.5 text-rose-400" />
                    <span>Resign</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Move History or Tactical Puzzles */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
            {gameMode === 'puzzle' ? (
              <PuzzlePanel
                puzzle={CHESS_PUZZLES[currentPuzzleIndex]}
                puzzleIndex={currentPuzzleIndex}
                totalPuzzles={CHESS_PUZZLES.length}
                status={puzzleStatus}
                feedbackMessage={puzzleFeedback}
                onRetry={() => loadPuzzle(currentPuzzleIndex)}
                onNextPuzzle={() => {
                  if (currentPuzzleIndex < CHESS_PUZZLES.length - 1) {
                    const next = currentPuzzleIndex + 1;
                    setCurrentPuzzleIndex(next);
                    loadPuzzle(next);
                  }
                }}
                onPrevPuzzle={() => {
                  if (currentPuzzleIndex > 0) {
                    const prev = currentPuzzleIndex - 1;
                    setCurrentPuzzleIndex(prev);
                    loadPuzzle(prev);
                  }
                }}
                onShowSolution={() => {
                  const puzzle = CHESS_PUZZLES[currentPuzzleIndex];
                  setPuzzleFeedback(`Solution: ${puzzle.moves.join(' → ')}`);
                  setPuzzleStatus('failed');
                }}
                solvedCount={puzzleSolvedCount}
                streak={puzzleStreak}
              />
            ) : (
              <MoveHistory
                history={moveHistory}
                currentMoveIndex={historyIndex}
                pgnText={generatePgn()}
                onGoToMove={handleGoToMove}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex >= 0 && !isBotThinking}
                canRedo={historyIndex < moveHistory.length - 1 && !isBotThinking}
                resultText={
                  chessRef.current.isGameOver()
                    ? chessRef.current.isCheckmate()
                      ? `Checkmate — ${chessRef.current.turn() === 'w' ? 'Black' : 'White'} won`
                      : 'Draw'
                    : undefined
                }
              />
            )}
          </div>
        </main>
      )}

      {/* Pawn Promotion Dialog */}
      <PromotionModal
        isOpen={!!pendingPromotion}
        color={pendingPromotion?.color || 'w'}
        onSelect={handlePromotionSelect}
        onCancel={() => setPendingPromotion(null)}
      />

      {/* Draw Offer Dialog */}
      <DrawOfferModal
        isOpen={isDrawOfferOpen}
        gameMode={gameMode}
        offeringPlayerColor={chessRef.current.turn()}
        botDecision={drawOfferBotDecision}
        onAccept={handleAcceptDraw}
        onDecline={handleDeclineDraw}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        botDifficulty={botDifficulty}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onUpdateBotDifficulty={(lvl) => setBotDifficulty(lvl)}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Match History Archive Drawer */}
      <MatchHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        matches={completedMatches}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onClearHistory={() => setCompletedMatches([])}
      />

      {/* Game Over / Result Modal */}
      {gameResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border border-white/10 p-6 shadow-2xl backdrop-blur-2xl text-center text-slate-100 animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl">
              🏆
            </div>
            <h3 className="text-xl font-black text-white">{gameResultModal.title}</h3>
            <p className="text-xs text-slate-300 mt-1 mb-5">{gameResultModal.subtitle}</p>

            <div className="space-y-2">
              <button
                onClick={() => startNewGame()}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                Play Rematch / New Game
              </button>
              <button
                onClick={() => setCurrentView('home')}
                className="w-full py-2 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold text-xs transition cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
