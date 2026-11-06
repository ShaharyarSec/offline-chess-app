import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, type Square, type PieceSymbol, type Color } from 'chess.js';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  RefreshCw,
  Volume2,
  VolumeX,
  History,
  Flag,
  Handshake,
  ChevronLeft,
  Settings,
} from 'lucide-react';

import type {
  ScreenView,
  GameMode,
  BotDifficulty,
  GameSettings,
  MoveRecord,
  PlayerClocks,
  SavedGameState,
  CompletedGameRecord,
} from './types/chess';
import { BOT_CONFIGS } from './data/themes';
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

const DEFAULT_SETTINGS: GameSettings = {
  boardTheme: 'emerald',
  pieceSet: 'neo',
  soundEnabled: true,
  showLegalMoves: true,
  highlightLastMove: true,
  autoFlipBoard: false,
  flipBoard: false,
  timeControlSeconds: 0,
  incrementSeconds: 0,
  darkMode: false, // Default clean light mode, persistent toggle
};

const SAVED_MATCH_KEY = 'gm_chess_active_match';
const HISTORY_MATCHES_KEY = 'gm_chess_completed_matches';

export default function App() {
  const [currentView, setCurrentView] = useState<ScreenView>('home');
  const [gameMode, setGameMode] = useState<GameMode>('bot');

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

  const [completedMatches, setCompletedMatches] = useState<CompletedGameRecord[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_MATCHES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [savedActiveMatch, setSavedActiveMatch] = useState<SavedGameState | null>(() => {
    try {
      const saved = localStorage.getItem(SAVED_MATCH_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const chessRef = useRef<Chess>(new Chess());
  const [, setRenderTrigger] = useState(0);
  const forceUpdate = () => setRenderTrigger((n) => n + 1);

  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
    color: Color;
  } | null>(null);

  const [clocks, setClocks] = useState<PlayerClocks>({
    white: 0,
    black: 0,
    activeColor: null,
    isRunning: false,
  });

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

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [puzzleMoveStep, setPuzzleMoveStep] = useState(0);
  const [puzzleStatus, setPuzzleStatus] = useState<'playing' | 'success' | 'failed'>('playing');
  const [puzzleFeedback, setPuzzleFeedback] = useState<string>('');
  const [puzzleSolvedCount, setPuzzleSolvedCount] = useState<number>(0);
  const [puzzleStreak, setPuzzleStreak] = useState<number>(0);

  // Sync sound setting
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Sync dark/light mode class and colors on document element & body
  useEffect(() => {
    const root = document.documentElement;
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (settings.darkMode) {
      root.classList.add('dark');
      root.style.backgroundColor = '#0a0a0a';
      document.body.style.backgroundColor = '#0a0a0a';
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#0a0a0a');
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = '#f8fafc';
      document.body.style.backgroundColor = '#f8fafc';
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#f8fafc');
    }
    localStorage.setItem('gm_chess_settings', JSON.stringify(settings));
  }, [settings.darkMode]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('gm_chess_settings', JSON.stringify(settings));
  }, [settings]);

  // Save bot difficulty
  useEffect(() => {
    localStorage.setItem('gm_chess_bot_difficulty', botDifficulty.toString());
  }, [botDifficulty]);

  // Save completed matches
  useEffect(() => {
    localStorage.setItem(HISTORY_MATCHES_KEY, JSON.stringify(completedMatches.slice(0, 10)));
  }, [completedMatches]);

  // Auto-save active match to localStorage on move
  useEffect(() => {
    if (gameMode === 'puzzle') return;

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

  // Timer countdown
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
            `${winner} wins on time`,
            `${color === 'w' ? 'White' : 'Black'} ran out of time`,
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

  const generatePgn = (overrideResult?: string): string => {
    const whitePlayer =
      gameMode === 'bot'
        ? userSide === 'w'
          ? 'White'
          : `Computer (L${botDifficulty})`
        : 'White';
    const blackPlayer =
      gameMode === 'bot'
        ? userSide === 'b'
          ? 'Black'
          : `Computer (L${botDifficulty})`
        : 'Black';

    let resultTag = overrideResult || '*';
    if (!overrideResult) {
      if (chessRef.current.isCheckmate()) {
        resultTag = chessRef.current.turn() === 'w' ? '0-1' : '1-0';
      } else if (chessRef.current.isDraw()) {
        resultTag = '1/2-1/2';
      }
    }

    const headers = [
      `[Event "Casual Game"]`,
      `[Site "Chess"]`,
      `[Date "${new Date().toISOString().slice(0, 10).replace(/-/g, '.')}"]`,
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
          : `Computer (L${botDifficulty})`
        : 'Player 1';
    const blackName =
      gameMode === 'bot'
        ? userSide === 'b'
          ? 'Player'
          : `Computer (L${botDifficulty})`
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
    localStorage.removeItem(SAVED_MATCH_KEY);
    setSavedActiveMatch(null);
  };

  const handleGameEnd = (
    title: string,
    subtitle: string,
    reason: string,
    result: '1-0' | '0-1' | '1/2-1/2'
  ) => {
    setGameResultModal({ title, subtitle, reason, result });
    archiveCompletedMatch(title, reason, result);
  };

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
      console.warn('Failed to resume:', e);
      startNewGame();
    }
  };

  const handleDiscardSavedMatch = () => {
    localStorage.removeItem(SAVED_MATCH_KEY);
    setSavedActiveMatch(null);
  };

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

  const checkGameEnd = (chess: Chess) => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Black' : 'White';
      const outcome: '1-0' | '0-1' = chess.turn() === 'w' ? '0-1' : '1-0';
      handleGameEnd(
        `${winner} wins`,
        'Checkmate',
        'Checkmate',
        outcome
      );

      if ((gameMode === 'bot' && userSide === (chess.turn() === 'w' ? 'b' : 'w')) || gameMode === 'pass-and-play') {
        soundManager.playVictory();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } else {
        soundManager.playDefeat();
      }
    } else if (chess.isStalemate()) {
      handleGameEnd('Draw', 'Stalemate', 'Stalemate', '1/2-1/2');
      soundManager.playDefeat();
    } else if (chess.isThreefoldRepetition()) {
      handleGameEnd('Draw', 'Threefold repetition', 'Threefold Repetition', '1/2-1/2');
    } else if (chess.isInsufficientMaterial()) {
      handleGameEnd('Draw', 'Insufficient material', 'Insufficient Material', '1/2-1/2');
    }
  };

  const handleBoardMove = (from: Square, to: Square, chosenPromotion?: PieceSymbol): boolean => {
    if (isBotThinking) return false;
    const chess = chessRef.current;
    if (chess.isGameOver()) return false;

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
            setPuzzleFeedback('');
            soundManager.playVictory();
            confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
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
            }, 300);
          }
          return true;
        } else {
          soundManager.playIllegal();
          setPuzzleStatus('failed');
          setPuzzleFeedback('Incorrect move.');
          setPuzzleStreak(0);
          return false;
        }
      }

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
      console.error('Move error:', err);
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

  const handleResign = () => {
    const activeColor = chessRef.current.turn();
    const winner = activeColor === 'w' ? 'Black' : 'White';
    const outcome: '1-0' | '0-1' = activeColor === 'w' ? '0-1' : '1-0';
    handleGameEnd(
      `${winner} wins`,
      'Resignation',
      'Resignation',
      outcome
    );
    soundManager.playDefeat();
  };

  const handleInitiateDrawOffer = async () => {
    if (chessRef.current.isGameOver() || isBotThinking) return;
    setIsDrawOfferOpen(true);

    if (gameMode === 'bot') {
      setDrawOfferBotDecision('evaluating');
      const evalScore = await engineService.evaluateFen(chessRef.current.fen());
      const botPerspectiveScore = userSide === 'w' ? -evalScore : evalScore;
      setTimeout(() => {
        if (botPerspectiveScore < 70) {
          setDrawOfferBotDecision('accepted');
        } else {
          setDrawOfferBotDecision('declined');
        }
      }, 350);
    }
  };

  const handleAcceptDraw = () => {
    setIsDrawOfferOpen(false);
    setDrawOfferBotDecision(null);
    handleGameEnd(
      'Draw',
      'Mutual agreement',
      'Draw Agreed',
      '1/2-1/2'
    );
  };

  const handleDeclineDraw = () => {
    setIsDrawOfferOpen(false);
    setDrawOfferBotDecision(null);
  };

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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
      settings.darkMode ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Header strictly: Simple logo icon + title "Chess" | Top right strictly: [History Icon], [Sound Toggle], [Theme Toggle] */}
      <header className="sticky top-0 z-30 px-4 sm:px-8 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            {currentView === 'game' ? (
              <button
                onClick={() => {
                  setGameResultModal(null);
                  setCurrentView('home');
                }}
                className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Back"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Chess</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl leading-none">♟</span>
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  Chess
                </span>
              </div>
            )}
          </div>

          {/* Strictly: [History Icon], [Sound Toggle], [Settings Gear Icon] */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="History"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main View */}
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
        />
      ) : (
        /* In-Game View */
        <main className="flex-1 max-w-5xl mx-auto w-full p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Board Column */}
          <div className="lg:col-span-8 flex flex-col items-center space-y-2">
            {/* Top Player Info */}
            <div className="w-full max-w-[540px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {gameMode === 'bot'
                    ? topColor === (userSide === 'w' ? 'b' : 'w')
                      ? `Computer (Level ${botDifficulty})`
                      : 'Player'
                    : topColor === 'b'
                    ? 'Black'
                    : 'White'}
                </span>
                <CapturedPieces
                  capturedByWhite={capturedByWhite}
                  capturedByBlack={capturedByBlack}
                  color={topColor}
                />
              </div>

              <Timer
                secondsRemaining={clocks[topColor === 'w' ? 'white' : 'black']}
                isActive={clocks.isRunning && currentTurn === topColor}
                color={topColor}
                isUntimed={settings.timeControlSeconds === 0}
              />
            </div>

            {/* ChessBoard */}
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

            {/* Bottom Player Info */}
            <div className="w-full max-w-[540px] flex items-center justify-between px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {gameMode === 'bot'
                    ? bottomColor === userSide
                      ? 'You'
                      : `Computer (Level ${botDifficulty})`
                    : bottomColor === 'w'
                    ? 'White'
                    : 'Black'}
                </span>
                <CapturedPieces
                  capturedByWhite={capturedByWhite}
                  capturedByBlack={capturedByBlack}
                  color={bottomColor}
                />
              </div>

              <Timer
                secondsRemaining={clocks[bottomColor === 'w' ? 'white' : 'black']}
                isActive={clocks.isRunning && currentTurn === bottomColor}
                color={bottomColor}
                isUntimed={settings.timeControlSeconds === 0}
              />
            </div>

            {/* In-Game Controls Bar */}
            <div className="w-full max-w-[540px] flex items-center justify-between pt-1 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleFlipBoard}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Flip"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Flip</span>
                </button>

                <button
                  onClick={() => startNewGame()}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="New Game"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              {gameMode !== 'puzzle' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleInitiateDrawOffer}
                    disabled={moveHistory.length === 0 || chessRef.current.isGameOver() || isBotThinking}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>Draw</span>
                  </button>

                  <button
                    onClick={handleResign}
                    disabled={moveHistory.length === 0 || chessRef.current.isGameOver()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Resign</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Move List or Puzzles */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
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
                  setPuzzleFeedback(`Solution: ${puzzle.moves.join(' ')}`);
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

      {/* Promotion Dialog */}
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

      {/* Settings Dialog */}
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

      {/* Result Modal */}
      {currentView === 'game' && gameResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-xl text-center text-slate-900 dark:text-white">
            <h3 className="text-lg font-bold">{gameResultModal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
              {gameResultModal.subtitle}
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setGameResultModal(null);
                  startNewGame();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-xs transition cursor-pointer"
              >
                New Game
              </button>
              <button
                onClick={() => {
                  setGameResultModal(null);
                  setCurrentView('home');
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
