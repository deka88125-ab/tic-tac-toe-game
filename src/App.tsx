/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardState,
  Player,
  WinningLine,
  ScoreState,
  GameMode,
  AIDifficulty,
  GameStatus,
} from './types/game';
import { checkWinner, isBoardFull, getAIMove } from './utils/ai';
import { sounds } from './utils/audio';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { Controls } from './components/Controls';
import { WinModal } from './components/WinModal';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { Info, X, HelpCircle, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function App() {
  // Board state (9 cells)
  const [board, setBoard] = useState<BoardState>(() => Array(9).fill(null));

  // Current turn
  const [turn, setTurn] = useState<Player>('X');

  // Game Status
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);

  // Game configuration
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [userPlayer, setUserPlayer] = useState<Player>('X');
  const [roundStarter, setRoundStarter] = useState<Player>('X');

  // Scoreboard
  const [scores, setScores] = useState<ScoreState>(() => {
    try {
      const saved = localStorage.getItem('ttt_scores');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return { x: 0, o: 0, draws: 0 };
  });

  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);

  const aiTimeoutRef = useRef<number | null>(null);

  // Sync scores to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ttt_scores', JSON.stringify(scores));
    } catch {
      // ignore in restricted iframes
    }
  }, [scores]);

  // Handle cell click (human player)
  const handleCellClick = useCallback(
    (index: number) => {
      // Ignore if cell occupied, game over, or AI is currently thinking
      if (board[index] !== null || gameStatus !== 'playing' || isAiThinking) {
        return;
      }

      // If playing vs AI and it's not the human's turn, ignore
      if (gameMode === 'ai' && turn !== userPlayer) {
        return;
      }

      // Sound effect
      sounds.playMove(turn);

      // Mobile haptic feedback if available
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }

      // Make move
      const nextBoard = [...board];
      nextBoard[index] = turn;
      setBoard(nextBoard);

      // Check win or draw
      const winResult = checkWinner(nextBoard);
      if (winResult) {
        setWinner(winResult.winner);
        setWinningLine(winResult.line);
        setGameStatus('won');
        setShowWinModal(true);
        setShowConfetti(true);
        sounds.playWin();

        setScores((prev) => ({
          ...prev,
          [winResult.winner.toLowerCase()]: prev[winResult.winner.toLowerCase() as 'x' | 'o'] + 1,
        }));
        return;
      }

      if (isBoardFull(nextBoard)) {
        setGameStatus('draw');
        setShowWinModal(true);
        sounds.playDraw();
        setScores((prev) => ({
          ...prev,
          draws: prev.draws + 1,
        }));
        return;
      }

      // Toggle turn
      const nextTurn = turn === 'X' ? 'O' : 'X';
      setTurn(nextTurn);
    },
    [board, gameStatus, isAiThinking, gameMode, turn, userPlayer]
  );

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (gameMode !== 'ai' || gameStatus !== 'playing') {
      return;
    }

    const aiPlayer: Player = userPlayer === 'X' ? 'O' : 'X';

    if (turn === aiPlayer) {
      setIsAiThinking(true);

      // Add a natural slight thinking delay (350ms - 550ms)
      const delay = Math.floor(Math.random() * 200) + 350;
      aiTimeoutRef.current = window.setTimeout(() => {
        const bestMove = getAIMove(board, aiPlayer, aiDifficulty);

        if (bestMove !== -1) {
          sounds.playMove(aiPlayer);

          const nextBoard = [...board];
          nextBoard[bestMove] = aiPlayer;
          setBoard(nextBoard);
          setIsAiThinking(false);

          // Check win or draw
          const winResult = checkWinner(nextBoard);
          if (winResult) {
            setWinner(winResult.winner);
            setWinningLine(winResult.line);
            setGameStatus('won');
            setShowWinModal(true);
            setShowConfetti(true);
            sounds.playWin();

            setScores((prev) => ({
              ...prev,
              [winResult.winner.toLowerCase()]: prev[winResult.winner.toLowerCase() as 'x' | 'o'] + 1,
            }));
            return;
          }

          if (isBoardFull(nextBoard)) {
            setGameStatus('draw');
            setShowWinModal(true);
            sounds.playDraw();
            setScores((prev) => ({
              ...prev,
              draws: prev.draws + 1,
            }));
            return;
          }

          setTurn(userPlayer);
        } else {
          setIsAiThinking(false);
        }
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [turn, gameMode, gameStatus, userPlayer, board, aiDifficulty]);

  // Restart the current round (keeps scores intact)
  const handleRestartRound = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    setBoard(Array(9).fill(null));
    setGameStatus('playing');
    setWinner(null);
    setWinningLine(null);
    setShowWinModal(false);
    setShowConfetti(false);
    setIsAiThinking(false);

    // Alternate starter for the next round
    const nextStarter = roundStarter === 'X' ? 'O' : 'X';
    setRoundStarter(nextStarter);
    setTurn(nextStarter);
    setRoundNumber((r) => r + 1);
  }, [roundStarter]);

  // Start fresh game match
  const handleNewGame = useCallback(() => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    setBoard(Array(9).fill(null));
    setGameStatus('playing');
    setWinner(null);
    setWinningLine(null);
    setShowWinModal(false);
    setShowConfetti(false);
    setIsAiThinking(false);
    setRoundStarter('X');
    setTurn('X');
    setRoundNumber(1);
  }, []);

  // Reset scores to 0-0
  const handleResetScores = useCallback(() => {
    setResetConfirmOpen(true);
  }, []);

  const confirmResetScores = () => {
    sounds.playTap();
    setScores({ x: 0, o: 0, draws: 0 });
    setRoundNumber(1);
    setResetConfirmOpen(false);
    handleNewGame();
  };

  // Switch game mode
  const handleGameModeChange = (newMode: GameMode) => {
    if (newMode === gameMode) return;
    setGameMode(newMode);
    handleNewGame();
  };

  // Change AI Difficulty
  const handleDifficultyChange = (newDiff: AIDifficulty) => {
    setAiDifficulty(newDiff);
  };

  // Change user player (X or O)
  const handleUserPlayerChange = (player: Player) => {
    setUserPlayer(player);
    handleNewGame();
  };

  // Toggle audio mute
  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Keyboard shortcut listener for numpad / 1-9 keys and R for restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an open modal (handled separately)
      if (showWinModal || showHelpModal || resetConfirmOpen) return;

      // Number keys 1-9 mapping:
      // 1 2 3 -> 0 1 2
      // 4 5 6 -> 3 4 5
      // 7 8 9 -> 6 7 8
      if (/^[1-9]$/.test(e.key)) {
        const cellIndex = parseInt(e.key, 10) - 1;
        handleCellClick(cellIndex);
      } else if (e.key.toLowerCase() === 'r') {
        sounds.playReset();
        handleRestartRound();
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCellClick, handleRestartRound, showWinModal, showHelpModal, resetConfirmOpen]);

  return (
    <div className="min-h-screen w-full bg-[#FF7700] text-black flex flex-col justify-between selection:bg-black selection:text-white relative overflow-x-hidden">
      {/* Confetti celebration canvas */}
      <ConfettiCanvas active={showConfetti} />

      {/* Decorative background pattern (subtle retro halftone dots) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-8"
        style={{
          backgroundImage:
            'radial-gradient(#000000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-3 sm:pt-5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo mark */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border-[3px] border-black shadow-[3px_3px_0px_#000] flex items-center justify-center font-black text-lg text-black select-none">
            <span className="text-[#FF2A85]">X</span>
            <span className="text-black text-xs mx-0.5">/</span>
            <span className="text-[#0284C7]">O</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-black">
              TIC TAC TOE
            </h1>
            <p className="text-[11px] font-bold text-black/75 tracking-wide hidden sm:block">
              NEO ARCADE CLASSIC
            </p>
          </div>
        </div>

        {/* Header Actions: Rules & Sound */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setShowHelpModal(true);
            }}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white text-black font-extrabold text-xs border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1 cursor-pointer"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-1.5 sm:p-2 rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${
              isMuted ? 'text-neutral-400' : 'text-black'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] text-amber-700" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-xl mx-auto px-4 py-2 sm:py-4 flex flex-col items-center gap-3 sm:gap-4 my-auto">
        {/* Scoreboard */}
        <ScoreBoard
          scores={scores}
          turn={turn}
          gameStatus={gameStatus}
          gameMode={gameMode}
          userPlayer={userPlayer}
          isAiThinking={isAiThinking}
        />

        {/* 3x3 Game Board with thick black border and orange background */}
        <div className="w-full flex justify-center my-1 sm:my-2">
          <GameBoard
            board={board}
            onCellClick={handleCellClick}
            turn={turn}
            gameStatus={gameStatus}
            winningLine={winningLine}
            disabled={isAiThinking}
          />
        </div>

        {/* Game Controls */}
        <Controls
          gameMode={gameMode}
          onGameModeChange={handleGameModeChange}
          aiDifficulty={aiDifficulty}
          onDifficultyChange={handleDifficultyChange}
          userPlayer={userPlayer}
          onUserPlayerChange={handleUserPlayerChange}
          onRestartRound={handleRestartRound}
          onNewGame={handleNewGame}
          onResetScores={handleResetScores}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          roundNumber={roundNumber}
        />
      </main>

      {/* Bottom Footer / Info */}
      <footer className="relative z-10 w-full max-w-xl mx-auto px-4 py-2 text-center text-black/60 text-xs font-semibold select-none">
        <p className="flex items-center justify-center gap-2">
          <span>Tip: Press 1-9 on keyboard to place symbols</span>
          <span>·</span>
          <span>R to Restart</span>
        </p>
      </footer>

      {/* Win / Result Celebration Modal */}
      {showWinModal && (
        <WinModal
          status={gameStatus}
          winner={winner}
          gameMode={gameMode}
          userPlayer={userPlayer}
          onPlayAgain={handleRestartRound}
          onClose={() => setShowWinModal(false)}
        />
      )}

      {/* Rules & Tips Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl border-[5px] border-black shadow-[8px_8px_0px_#000] p-6 text-black select-none">
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowHelpModal(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-black hover:bg-neutral-100 transition-colors"
              aria-label="Close rules"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[#FFDF00] border-2 border-black flex items-center justify-center">
                <Trophy className="w-5 h-5 text-black stroke-[2.5]" />
              </div>
              <h2 className="text-xl font-black tracking-tight">How to Play</h2>
            </div>

            <div className="space-y-3 text-sm font-semibold text-slate-800">
              <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black/20">
                <p className="font-extrabold text-black mb-1">🎯 Objective</p>
                <p>
                  Be the first to connect 3 of your symbols in a horizontal,
                  vertical, or diagonal line.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black/20">
                <p className="font-extrabold text-black mb-1">🤖 AI Difficulty Levels</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>
                    <span className="font-bold text-black">Easy:</span> Playful &
                    forgiving with random moves.
                  </li>
                  <li>
                    <span className="font-bold text-black">Medium:</span> Blocks
                    your wins and seizes open opportunities.
                  </li>
                  <li>
                    <span className="font-bold text-black">Hard:</span> Unbeatable
                    Minimax AI. Perfect strategy!
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border-2 border-black/20">
                <p className="font-extrabold text-black mb-1">⌨️ Keyboard Shortcuts</p>
                <p className="text-xs">
                  Keys 1 to 9 correspond to cells top-left to bottom-right. Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-black rounded text-[11px] font-mono">
                    R
                  </kbd>{' '}
                  to restart or{' '}
                  <kbd className="px-1.5 py-0.5 bg-white border border-black rounded text-[11px] font-mono">
                    M
                  </kbd>{' '}
                  to mute.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setShowHelpModal(false);
              }}
              className="mt-5 w-full py-2.5 bg-black text-white font-extrabold text-sm rounded-xl border-2 border-black shadow-[2px_2px_0px_#FF7700] hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Got it, let's play!
            </button>
          </div>
        </div>
      )}

      {/* Reset Score Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl border-[5px] border-black shadow-[8px_8px_0px_#000] p-6 text-black select-none text-center">
            <h3 className="text-xl font-black mb-2">Reset All Scores?</h3>
            <p className="text-sm font-semibold text-slate-600 mb-6">
              This will clear all win counts and tie records back to 0-0.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-black font-extrabold text-sm rounded-xl border-2 border-black transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetScores}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
