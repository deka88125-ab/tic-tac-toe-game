import React, { useState } from 'react';
import { BoardState, Player, WinningLine, GameStatus } from '../types/game';
import { XSymbol, OSymbol, GhostSymbol } from './GameSymbols';

interface GameBoardProps {
  board: BoardState;
  onCellClick: (index: number) => void;
  turn: Player;
  gameStatus: GameStatus;
  winningLine: WinningLine | null;
  disabled: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onCellClick,
  turn,
  gameStatus,
  winningLine,
  disabled,
}) => {
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  // Calculate strike line SVG coordinates based on winning line
  const getLineCoordinates = () => {
    if (!winningLine) return null;

    const { direction, lineIndex } = winningLine;

    if (direction === 'horizontal') {
      const yCoords = [16.66, 50, 83.33];
      const y = yCoords[lineIndex];
      return { x1: 6, y1: y, x2: 94, y2: y };
    }

    if (direction === 'vertical') {
      const xCoords = [16.66, 50, 83.33];
      const x = xCoords[lineIndex];
      return { x1: x, y1: 6, x2: x, y2: 94 };
    }

    if (direction === 'diagonal-main') {
      // Top-left to bottom-right
      return { x1: 8, y1: 8, x2: 92, y2: 92 };
    }

    if (direction === 'diagonal-anti') {
      // Top-right to bottom-left
      return { x1: 92, y1: 8, x2: 8, y2: 92 };
    }

    return null;
  };

  const lineCoords = getLineCoordinates();

  return (
    <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[400px] md:max-w-[440px] aspect-square">
      {/* 
        3x3 Game Board:
        Thick black outer border with neo-brutalist shadow.
        Inner divider lines with thick black borders.
      */}
      <div
        className="relative w-full h-full bg-white rounded-2xl md:rounded-3xl border-[6px] sm:border-[8px] border-black shadow-[8px_8px_0px_#000000] sm:shadow-[10px_10px_0px_#000000] overflow-hidden p-2 sm:p-3"
        role="grid"
        aria-label="Tic Tac Toe Board"
      >
        {/* The 3x3 Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 w-full h-full">
          {board.map((cellValue, index) => {
            const isWinningCell = winningLine?.indices.includes(index) ?? false;
            const isEmpty = cellValue === null;
            const isHovered = hoveredCell === index && isEmpty && !disabled && gameStatus === 'playing';

            return (
              <button
                key={index}
                type="button"
                onClick={() => onCellClick(index)}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
                disabled={disabled || cellValue !== null || gameStatus !== 'playing'}
                className={`relative flex items-center justify-center rounded-xl md:rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black border-[3px] border-black ${
                  isWinningCell
                    ? 'bg-amber-100 scale-[1.03] shadow-[0_0_15px_rgba(255,183,3,0.6)] z-10'
                    : 'bg-[#FFFDF7] hover:bg-[#FFF9EA]'
                } ${
                  isEmpty && !disabled && gameStatus === 'playing'
                    ? 'cursor-pointer active:scale-95 hover:shadow-inner'
                    : 'cursor-default'
                }`}
                aria-label={`Cell ${index + 1}: ${cellValue ? cellValue : 'empty'}`}
              >
                {/* Cell Content */}
                <div className="w-[72%] h-[72%] flex items-center justify-center">
                  {cellValue === 'X' && <XSymbol isWinning={isWinningCell} />}
                  {cellValue === 'O' && <OSymbol isWinning={isWinningCell} />}
                  {isHovered && <GhostSymbol player={turn} />}
                </div>

                {/* Subtile corner accent dots in retro arcade style */}
                <span className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-black/15 pointer-events-none" />
                <span className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-black/15 pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Animated Winning Strike Line Overlay */}
        {lineCoords && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
          >
            {/* Outer thick black strike casing */}
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke="#000000"
              strokeWidth="7"
              strokeLinecap="round"
              className="animate-strike-line"
            />
            {/* Inner glowing yellow/gold core */}
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke="#FFE600"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-strike-line"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
