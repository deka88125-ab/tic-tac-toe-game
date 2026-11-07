import React, { useEffect } from 'react';
import { Player, GameStatus, GameMode } from '../types/game';
import { XSymbol, OSymbol } from './GameSymbols';
import { Trophy, Frown, Sparkles, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface WinModalProps {
  status: GameStatus;
  winner: Player | null;
  gameMode: GameMode;
  userPlayer: Player;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  status,
  winner,
  gameMode,
  userPlayer,
  onPlayAgain,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        sounds.playTap();
        onPlayAgain();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayAgain, onClose]);

  if (status === 'playing') return null;

  const isDraw = status === 'draw';
  const isHumanWinner = gameMode === 'ai' && winner === userPlayer;
  const isAiWinner = gameMode === 'ai' && winner !== null && winner !== userPlayer;

  let title = '';
  let subtitle = '';

  if (isDraw) {
    title = "It's a Draw!";
    subtitle = 'Both sides matched wits equally.';
  } else if (gameMode === 'pvp') {
    title = `Player ${winner} Takes It!`;
    subtitle = `Flawless three-in-a-row victory.`;
  } else if (isHumanWinner) {
    title = 'Victory is Yours!';
    subtitle = 'You outsmarted the computer.';
  } else if (isAiWinner) {
    title = 'Computer Won!';
    subtitle = 'The AI found the perfect path.';
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl border-[6px] border-black shadow-[10px_10px_0px_#000000] p-6 text-center select-none animate-pop-in">
        {/* Decorative Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black bg-amber-300 text-black text-xs font-black uppercase tracking-wider mb-4 shadow-[2px_2px_0px_#000]">
          {isDraw ? (
            <>
              <Frown className="w-3.5 h-3.5" />
              <span>Stalemate</span>
            </>
          ) : (
            <>
              <Trophy className="w-3.5 h-3.5 text-amber-900" />
              <span>Match Decided</span>
            </>
          )}
        </div>

        {/* Big Graphic Showcase */}
        <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
          {winner === 'X' && <XSymbol className="animate-bounce" />}
          {winner === 'O' && <OSymbol className="animate-bounce" />}
          {isDraw && (
            <div className="flex items-center gap-1 scale-90">
              <div className="w-12 h-12">
                <XSymbol />
              </div>
              <div className="w-12 h-12">
                <OSymbol />
              </div>
            </div>
          )}
        </div>

        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight mb-1">
          {title}
        </h2>
        <p className="text-sm font-semibold text-slate-600 mb-6">
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={() => {
              sounds.playReset();
              onPlayAgain();
            }}
            className="w-full py-3 px-4 bg-[#FFDF00] hover:bg-[#FFE833] text-black font-black text-base rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[3]" />
            <span>Play Next Round</span>
            <span className="text-[11px] font-bold text-black/60 hidden sm:inline">
              (Press Space)
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-black font-extrabold text-xs sm:text-sm rounded-xl border-2 border-black active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            Inspect Board
          </button>
        </div>
      </div>
    </div>
  );
};
