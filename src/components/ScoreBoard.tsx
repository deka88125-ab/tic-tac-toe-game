import React from 'react';
import { Player, ScoreState, GameMode, GameStatus } from '../types/game';
import { XSymbol, OSymbol } from './GameSymbols';
import { Minus } from 'lucide-react';

interface ScoreBoardProps {
  scores: ScoreState;
  turn: Player;
  gameStatus: GameStatus;
  gameMode: GameMode;
  userPlayer: Player;
  isAiThinking: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  scores,
  turn,
  gameStatus,
  gameMode,
  userPlayer,
  isAiThinking,
}) => {
  const isXTurn = turn === 'X' && gameStatus === 'playing';
  const isOTurn = turn === 'O' && gameStatus === 'playing';

  const getLabelX = () => {
    if (gameMode === 'pvp') return 'Player X';
    return userPlayer === 'X' ? 'You (X)' : 'AI (X)';
  };

  const getLabelO = () => {
    if (gameMode === 'pvp') return 'Player O';
    return userPlayer === 'O' ? 'You (O)' : 'AI (O)';
  };

  return (
    <div className="w-full max-w-[440px] mx-auto grid grid-cols-3 gap-2 sm:gap-3 select-none">
      {/* Player X Card */}
      <div
        className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border-[3.5px] border-black transition-all duration-300 ${
          isXTurn
            ? 'bg-pink-100 shadow-[5px_5px_0px_#000000] scale-[1.03] ring-2 ring-black'
            : 'bg-white shadow-[3px_3px_0px_#000000] opacity-90'
        }`}
      >
        {/* Active Turn Indicator */}
        {isXTurn && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FF2A85] text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border-2 border-black whitespace-nowrap shadow-[1px_1px_0px_#000]">
            {isAiThinking && userPlayer !== 'X' ? 'Thinking...' : 'Your Turn'}
          </span>
        )}

        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-5 h-5 flex items-center justify-center">
            <XSymbol />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-black truncate max-w-[80px]">
            {getLabelX()}
          </span>
        </div>

        <span className="text-2xl sm:text-3xl font-black text-black tabular-nums tracking-tight">
          {scores.x}
        </span>
      </div>

      {/* Draws Card */}
      <div className="flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border-[3.5px] border-black bg-amber-50 shadow-[3px_3px_0px_#000000] opacity-90">
        <div className="flex items-center gap-1.5 mb-1 text-slate-700">
          <Minus className="w-4 h-4 stroke-[3]" />
          <span className="text-xs sm:text-sm font-extrabold text-black">
            Ties
          </span>
        </div>

        <span className="text-2xl sm:text-3xl font-black text-black tabular-nums tracking-tight">
          {scores.draws}
        </span>
      </div>

      {/* Player O Card */}
      <div
        className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3 rounded-2xl border-[3.5px] border-black transition-all duration-300 ${
          isOTurn
            ? 'bg-sky-100 shadow-[5px_5px_0px_#000000] scale-[1.03] ring-2 ring-black'
            : 'bg-white shadow-[3px_3px_0px_#000000] opacity-90'
        }`}
      >
        {/* Active Turn Indicator */}
        {isOTurn && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0284C7] text-white text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border-2 border-black whitespace-nowrap shadow-[1px_1px_0px_#000]">
            {isAiThinking && userPlayer !== 'O' ? 'Thinking...' : 'Your Turn'}
          </span>
        )}

        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-5 h-5 flex items-center justify-center">
            <OSymbol />
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-black truncate max-w-[80px]">
            {getLabelO()}
          </span>
        </div>

        <span className="text-2xl sm:text-3xl font-black text-black tabular-nums tracking-tight">
          {scores.o}
        </span>
      </div>
    </div>
  );
};
