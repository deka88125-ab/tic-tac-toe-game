import React from 'react';
import { GameMode, AIDifficulty, Player } from '../types/game';
import { Users, Bot, RotateCcw, Sparkles, Volume2, VolumeX, Trash2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ControlsProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  aiDifficulty: AIDifficulty;
  onDifficultyChange: (diff: AIDifficulty) => void;
  userPlayer: Player;
  onUserPlayerChange: (player: Player) => void;
  onRestartRound: () => void;
  onNewGame: () => void;
  onResetScores: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  roundNumber: number;
}

export const Controls: React.FC<ControlsProps> = ({
  gameMode,
  onGameModeChange,
  aiDifficulty,
  onDifficultyChange,
  userPlayer,
  onUserPlayerChange,
  onRestartRound,
  onNewGame,
  onResetScores,
  isMuted,
  onToggleMute,
  roundNumber,
}) => {
  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col gap-3 select-none">
      {/* Top Controls: Mode Switcher & Sound Toggle */}
      <div className="flex items-center justify-between gap-2">
        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-black/10 rounded-2xl border-2 border-black/30 backdrop-blur-xs flex-1">
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onGameModeChange('pvp');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              gameMode === 'pvp'
                ? 'bg-white text-black shadow-[2px_2px_0px_#000] border-2 border-black'
                : 'text-black/70 hover:text-black hover:bg-white/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="whitespace-nowrap">2 Players</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              onGameModeChange('ai');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              gameMode === 'ai'
                ? 'bg-white text-black shadow-[2px_2px_0px_#000] border-2 border-black'
                : 'text-black/70 hover:text-black hover:bg-white/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="whitespace-nowrap">vs AI</span>
          </button>
        </div>

        {/* Mute/Sound Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onToggleMute();
          }}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl border-2 border-black bg-white flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
            isMuted ? 'text-neutral-400 bg-neutral-100' : 'text-black'
          }`}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 stroke-[2.5]" />
          ) : (
            <Volume2 className="w-4 h-4 stroke-[2.5] text-amber-600" />
          )}
          <span className="text-xs font-black hidden sm:inline">
            {isMuted ? 'Muted' : 'Sound'}
          </span>
        </button>
      </div>

      {/* AI Settings Sub-panel (only shown when in AI mode) */}
      {gameMode === 'ai' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-2xl bg-white/70 border-2 border-black shadow-[2px_2px_0px_#000] animate-fade-in">
          {/* Difficulty Selection */}
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <span className="text-[11px] font-black uppercase text-black/70 px-1">
              Bot:
            </span>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => {
                  sounds.playTap();
                  onDifficultyChange(diff);
                }}
                className={`flex-1 sm:flex-initial text-xs font-black py-1 px-2.5 rounded-lg border-2 transition-all capitalize ${
                  aiDifficulty === diff
                    ? 'bg-black text-white border-black shadow-[1px_1px_0px_#000]'
                    : 'bg-white text-black border-black/40 hover:border-black'
                }`}
              >
                {diff === 'hard' ? 'Hard (AI)' : diff}
              </button>
            ))}
          </div>

          {/* Player Choice: Play as X or O */}
          <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-black uppercase text-black/70 px-1">
              Play As:
            </span>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onUserPlayerChange('X');
              }}
              className={`text-xs font-black py-1 px-2.5 rounded-lg border-2 transition-all ${
                userPlayer === 'X'
                  ? 'bg-[#FF2A85] text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-white text-black border-black/40 hover:border-black'
              }`}
            >
              X (1st)
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                onUserPlayerChange('O');
              }}
              className={`text-xs font-black py-1 px-2.5 rounded-lg border-2 transition-all ${
                userPlayer === 'O'
                  ? 'bg-[#0284C7] text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-white text-black border-black/40 hover:border-black'
              }`}
            >
              O (2nd)
            </button>
          </div>
        </div>
      )}

      {/* Primary Action Buttons: Restart Round, New Game, Reset Scores */}
      <div className="grid grid-cols-3 gap-2">
        {/* Restart Current Round */}
        <button
          type="button"
          onClick={() => {
            sounds.playReset();
            onRestartRound();
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white text-black font-black text-xs sm:text-sm rounded-xl border-[2.5px] border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-neutral-50 transition-all cursor-pointer"
          title="Restart the current board"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="whitespace-nowrap">Restart</span>
        </button>

        {/* New Game Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playReset();
            onNewGame();
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#FFDF00] text-black font-black text-xs sm:text-sm rounded-xl border-[2.5px] border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-[#FFE833] transition-all cursor-pointer"
          title="Start a fresh match"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="whitespace-nowrap">New Game</span>
        </button>

        {/* Reset Scores Button */}
        <button
          type="button"
          onClick={() => {
            sounds.playTap();
            onResetScores();
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white text-slate-700 hover:text-red-600 font-bold text-xs sm:text-sm rounded-xl border-[2.5px] border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-red-50 transition-all cursor-pointer"
          title="Reset scoreboard to 0-0"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          <span className="whitespace-nowrap">Reset Score</span>
        </button>
      </div>

      {/* Round & Match Status Indicator */}
      <div className="flex items-center justify-between text-[11px] font-bold text-black/70 px-1 pt-0.5">
        <span>Round #{roundNumber}</span>
        <span>
          {gameMode === 'ai'
            ? `AI Level: ${aiDifficulty.toUpperCase()}`
            : 'Pass & Play Mode'}
        </span>
      </div>
    </div>
  );
};
