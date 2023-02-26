import { List, Repeat, Range } from 'immutable';
import { atomWithReducer } from 'jotai/utils';
import { useReducer } from 'react';
import { match } from 'ts-pattern';

/** A chance de um quadrado conter uma bomba */
export const BOMBS_PROBABILITY = 0.15;
export const boardSize = { x: 16, y: 16 } as const;

export enum SquareState {
  Empty,
  Mine,
}

export type BoardSquareT = {
  state: SquareState;
  isVisible: boolean;
  hasFlag: boolean;
};

export type Vector2 = { x: number; y: number };

export type GameBoardRow = List<BoardSquareT>;
export type GameBoard = List<GameBoardRow>;

export enum GameState {
  Playing,
  PlayerWon,
  PlayerLost,
}

export type Game = {
  gameState: GameState;
  board: GameBoard;
  boardSize: Vector2;
};

type GameAction =
  | { type: 'press'; x: number; y: number }
  | { type: 'right_press'; x: number; y: number }
  | { type: 'reset' };

const gameReducer = (state: Game, action: GameAction): Game =>
  match(action)
    .with({ type: 'press' }, ({ x, y }) => {
      if (
        state.gameState !== GameState.Playing ||
        x > boardSize.x ||
        y > boardSize.y
      ) {
        return state;
      }

      const row: GameBoardRow = state.board.get(y)!;
      const square = row.get(x)!;
      if (!square.hasFlag) {
        const newSquare = { ...square, isVisible: true };
        const newBoard = state.board.set(y, row.set(x, newSquare));

        if (didPlayerWin(newBoard)) {
          return {
            ...state,
            gameState: GameState.PlayerWon,
            board: newBoard,
          };
        } else {
          const newGameState =
            square.state === SquareState.Mine
              ? GameState.PlayerLost
              : GameState.Playing;

          return {
            ...state,
            gameState: newGameState,
            board: newBoard,
          };
        }
      }

      return state;
    })
    .with({ type: 'right_press' }, ({ x, y }) => {
      if (
        state.gameState !== GameState.Playing ||
        x > boardSize.x ||
        y > boardSize.y
      ) {
        return state;
      }

      const row: GameBoardRow = state.board.get(y)!;
      const square = row.get(x)!;
      if (!square.isVisible) {
        const newSquare: BoardSquareT = { ...square, hasFlag: !square.hasFlag };
        const newBoard = state.board.set(y, row.set(x, newSquare));
        const newGameState = didPlayerWin(newBoard)
          ? GameState.PlayerWon
          : state.gameState;

        return { ...state, board: newBoard, gameState: newGameState };
      }

      return state;
    })
    .with({ type: 'reset' }, () => ({
      ...state,
      gameState: GameState.Playing,
      board: createMinefield(state.boardSize.x, state.boardSize.y),
    }))
    .exhaustive();

function createMinefield(sizeX: number, sizeY: number): GameBoard {
  return Range(0, sizeY)
    .map((_i) => {
      return Range(0, sizeX)
        .map((_j) => {
          const isMine = Math.random() < BOMBS_PROBABILITY;
          return {
            state: isMine ? SquareState.Mine : SquareState.Empty,
            hasFlag: false,
            isVisible: false,
          };
        })
        .toList();
    })
    .toList();
}

function getInitialState(sizeX: number, sizeY: number): Game {
  return {
    board: createMinefield(sizeX, sizeY),
    gameState: GameState.Playing,
    boardSize: {
      x: sizeX,
      y: sizeY,
    },
  };
}

export function useGameState() {
  return useReducer(gameReducer, getInitialState(boardSize.x, boardSize.y));
}

/** Buscar as coordenadas ao redor do quadrado */
export function findCoordsAround(pos: Vector2, boardSize: Vector2): Vector2[] {
  const coords: Vector2[] = [
    // linha de cima
    { x: pos.x - 1, y: pos.y - 1 },
    { x: pos.x + 0, y: pos.y - 1 },
    { x: pos.x + 1, y: pos.y - 1 },

    // linha do meio
    { x: pos.x - 1, y: pos.y },
    { x: pos.x + 0, y: pos.y },
    { x: pos.x + 1, y: pos.y },

    // linha de baixo
    { x: pos.x - 1, y: pos.y + 1 },
    { x: pos.x + 0, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y + 1 },
  ];

  // filtrar coordenadas fora do campo
  return coords.filter((c) => areCoordsInBoundaries(c, boardSize));
}

export function areCoordsInBoundaries(coords: Vector2, boardSize: Vector2) {
  return (
    coords.x >= 0 &&
    coords.x < boardSize.x &&
    coords.y >= 0 &&
    coords.y < boardSize.y
  );
}

/** COnta quantas minas tem em volta do quadrado */
export function countMinesAround(position: Vector2, board: GameBoard): number {
  return findCoordsAround(position, getBoardSize(board))
    .map((coords) => board.get(coords.y)!.get(coords.x)!)
    .map((square) => (square.state === SquareState.Mine ? 1 : 0))
    .reduce((acc: number, num) => acc + num, 0);
}

export function didPlayerWin(board: GameBoard): boolean {
  return board
    .flatMap((row) => row)
    .every((square) => {
      const isMine = square.state === SquareState.Mine;
      const isFlaggedBomb = isMine && !square.isVisible && square.hasFlag;
      const isConfirmedEmpty = !isMine && square.isVisible;
      return isFlaggedBomb || isConfirmedEmpty;
    });
}

function getBoardSize(board: GameBoard): Vector2 {
  return {
    x: board.get(0)!.size,
    y: board.size,
  };
}
