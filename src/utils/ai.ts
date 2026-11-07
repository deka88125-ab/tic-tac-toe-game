import { BoardState, Player, WinningLine, AIDifficulty } from '../types/game';

export const WINNING_COMBINATIONS: Array<{
  indices: [number, number, number];
  direction: 'horizontal' | 'vertical' | 'diagonal-main' | 'diagonal-anti';
  lineIndex: number;
}> = [
  // Rows
  { indices: [0, 1, 2], direction: 'horizontal', lineIndex: 0 },
  { indices: [3, 4, 5], direction: 'horizontal', lineIndex: 1 },
  { indices: [6, 7, 8], direction: 'horizontal', lineIndex: 2 },
  // Columns
  { indices: [0, 3, 6], direction: 'vertical', lineIndex: 0 },
  { indices: [1, 4, 7], direction: 'vertical', lineIndex: 1 },
  { indices: [2, 5, 8], direction: 'vertical', lineIndex: 2 },
  // Diagonals
  { indices: [0, 4, 8], direction: 'diagonal-main', lineIndex: 0 },
  { indices: [2, 4, 6], direction: 'diagonal-anti', lineIndex: 1 },
];

/**
 * Checks if there is a winner on the board
 */
export function checkWinner(board: BoardState): { winner: Player; line: WinningLine } | null {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo.indices;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] as Player,
        line: combo,
      };
    }
  }
  return null;
}

/**
 * Checks if the board is full (Draw if no winner)
 */
export function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

/**
 * Get all available (empty) cell indices
 */
export function getAvailableMoves(board: BoardState): number[] {
  const moves: number[] = [];
  board.forEach((cell, index) => {
    if (cell === null) moves.push(index);
  });
  return moves;
}

/**
 * Minimax algorithm for unbeatable Hard AI
 */
function minimax(
  currentBoard: BoardState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  humanPlayer: Player
): { score: number; move?: number } {
  const winResult = checkWinner(currentBoard);
  if (winResult) {
    if (winResult.winner === aiPlayer) {
      return { score: 10 - depth };
    } else {
      return { score: depth - 10 };
    }
  }

  const availableMoves = getAvailableMoves(currentBoard);
  if (availableMoves.length === 0) {
    return { score: 0 };
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      currentBoard[move] = aiPlayer;
      const result = minimax(currentBoard, depth + 1, false, aiPlayer, humanPlayer);
      currentBoard[move] = null;

      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
    }

    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      currentBoard[move] = humanPlayer;
      const result = minimax(currentBoard, depth + 1, true, aiPlayer, humanPlayer);
      currentBoard[move] = null;

      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
    }

    return { score: minScore, move: bestMove };
  }
}

/**
 * Selects the AI's move based on the chosen difficulty
 */
export function getAIMove(
  board: BoardState,
  aiPlayer: Player,
  difficulty: AIDifficulty
): number {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return -1;

  const humanPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // 1. EASY: 85% random, 15% takes an immediate win
  if (difficulty === 'easy') {
    // Check if AI can win immediately (small chance)
    if (Math.random() < 0.25) {
      for (const move of availableMoves) {
        board[move] = aiPlayer;
        if (checkWinner(board)?.winner === aiPlayer) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
    }
    // Random move
    const randomIndex = Math.floor(Math.random() * availableMoves.length);
    return availableMoves[randomIndex];
  }

  // 2. MEDIUM:
  // - Priority 1: Take winning move
  // - Priority 2: Block human winning move (85% of time)
  // - Priority 3: Take center or corners with reasonable strategy, occasionally random
  if (difficulty === 'medium') {
    // Can AI win right now?
    for (const move of availableMoves) {
      board[move] = aiPlayer;
      if (checkWinner(board)?.winner === aiPlayer) {
        board[move] = null;
        return move;
      }
      board[move] = null;
    }

    // Must AI block human?
    if (Math.random() < 0.85) {
      for (const move of availableMoves) {
        board[move] = humanPlayer;
        if (checkWinner(board)?.winner === humanPlayer) {
          board[move] = null;
          return move;
        }
        board[move] = null;
      }
    }

    // Take center if available
    if (availableMoves.includes(4) && Math.random() < 0.6) {
      return 4;
    }

    // Prefer corners (0, 2, 6, 8)
    const corners = [0, 2, 6, 8].filter((idx) => availableMoves.includes(idx));
    if (corners.length > 0 && Math.random() < 0.5) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // Otherwise random
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  // 3. HARD: Perfect Minimax
  // In Hard mode, if it's the very first move of the game (empty board),
  // pick center or a random corner for variety and instant calculation!
  if (availableMoves.length === 9) {
    const openingMoves = [0, 2, 4, 6, 8];
    return openingMoves[Math.floor(Math.random() * openingMoves.length)];
  }

  const result = minimax(board, 0, true, aiPlayer, humanPlayer);
  return result.move !== undefined ? result.move : availableMoves[0];
}
