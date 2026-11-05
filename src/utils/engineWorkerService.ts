import type { Square } from 'chess.js';
import type { BotDifficulty } from '../types/chess';
import { BOT_CONFIGS } from '../data/themes';

export interface BotMoveResult {
  from: Square;
  to: Square;
  promotion?: string;
  depthReached: number;
  evalScore: number;
}

class EngineWorkerService {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    {
      resolve: (value: any) => void;
      reject: (reason?: any) => void;
      timer: NodeJS.Timeout;
    }
  >();
  private requestId = 0;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    try {
      if (typeof window !== 'undefined' && window.Worker) {
        this.worker = new Worker(new URL('./engine.worker.ts', import.meta.url), {
          type: 'module',
        });

        this.worker.onmessage = (event: MessageEvent) => {
          const { id, bestMove, depthReached, evalScore, type } = event.data;
          const pending = this.pendingRequests.get(id);
          if (pending) {
            clearTimeout(pending.timer);
            this.pendingRequests.delete(id);
            if (type === 'eval_result') {
              pending.resolve(evalScore);
            } else {
              pending.resolve(bestMove ? { ...bestMove, depthReached, evalScore } : null);
            }
          }
        };

        this.worker.onerror = (err) => {
          console.warn('Chess worker encountered an error, recreating worker:', err);
          this.terminate();
          this.initWorker();
        };
      }
    } catch (e) {
      console.warn('Worker initialization failed, using fallback:', e);
      this.worker = null;
    }
  }

  public async getBotMove(
    fen: string,
    difficulty: BotDifficulty
  ): Promise<BotMoveResult | null> {
    const config = BOT_CONFIGS[difficulty];
    const timeLimitMs = config.timeLimitMs;
    const targetDepth = config.depth;

    // If worker available, dispatch asynchronously
    if (this.worker) {
      return new Promise<BotMoveResult | null>((resolve, reject) => {
        const id = `req_${++this.requestId}_${Date.now()}`;

        // Watchdog timer (aborts if worker fails to respond within budget + 400ms margin)
        const timer = setTimeout(() => {
          this.pendingRequests.delete(id);
          resolve(null);
        }, timeLimitMs + 400);

        this.pendingRequests.set(id, { resolve, reject, timer });

        this.worker?.postMessage({
          id,
          fen,
          difficulty,
          timeLimitMs,
          targetDepth,
        });
      });
    }

    // Fallback: simple delay and return null to trigger main thread safety
    return null;
  }

  public async evaluateFen(fen: string): Promise<number> {
    if (this.worker) {
      return new Promise<number>((resolve) => {
        const id = `eval_${++this.requestId}_${Date.now()}`;
        const timer = setTimeout(() => {
          this.pendingRequests.delete(id);
          resolve(0);
        }, 600);

        this.pendingRequests.set(id, { resolve, reject: () => resolve(0), timer });

        this.worker?.postMessage({
          type: 'evaluate',
          id,
          fen,
        });
      });
    }
    return 0;
  }

  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.forEach((req) => clearTimeout(req.timer));
    this.pendingRequests.clear();
  }
}

export const engineService = new EngineWorkerService();
