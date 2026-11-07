export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[];

export type GameMode = 'pvp' | 'ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type StarterChoice = 'X' | 'O' | 'alternate';

export interface WinningLine {
  indices: [number, number, number];
  direction: 'horizontal' | 'vertical' | 'diagonal-main' | 'diagonal-anti';
  lineIndex: number;
}

export interface ScoreState {
  x: number;
  o: number;
  draws: number;
}

export type GameStatus = 'playing' | 'won' | 'draw';
