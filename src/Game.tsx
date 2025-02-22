import { createContext, useContext, useEffect, useState } from 'react';

export enum GamePlayer {
  None = 0,
  X = 1,
  O = 2
}

export interface GameOver {
  winner: GamePlayer,
  winningSpaces?: Array<Array<number>>
}

interface GameContextProps {
  boardState: Array<Array<GamePlayer>>;
  currentPlayer: GamePlayer;
  takeTurn: (rowNum: number, colNum: number) => boolean;
  gameOver: GameOver | undefined;
  restart: () => void;
}

const emptyBoard: Array<Array<GamePlayer>> = [
  [ GamePlayer.None, GamePlayer.None, GamePlayer.None],
  [ GamePlayer.None, GamePlayer.None, GamePlayer.None],
  [ GamePlayer.None, GamePlayer.None, GamePlayer.None]
];

const gameStartingState: GameContextProps = {
  boardState: emptyBoard,
  currentPlayer: GamePlayer.X,
  takeTurn: () => { throw new Error("GameProvider is missing") },
  gameOver: undefined,
  restart: () => {}
}

const GameContext = createContext<GameContextProps>(gameStartingState);

interface GameProviderProps {
  children: React.ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [boardState, setBoardState] = useState(gameStartingState.boardState);
  const [currentPlayer, setCurrentPlayer] = useState(gameStartingState.currentPlayer);
  const [gameOver, setGameOver] = useState<GameOver | undefined>(undefined);

  const takeTurn = (rowNum: number, colNum: number): boolean => {
    if (boardState[rowNum][colNum] != GamePlayer.None) {
      return false;
    }
    setBoardState(boardState =>
      boardState.map((row, rowNum2) =>
        row.map((state, colNum2) => rowNum2 == rowNum && colNum2 == colNum ? currentPlayer : state)
      )
    );
    setCurrentPlayer(currentPlayer => currentPlayer == GamePlayer.X ? GamePlayer.O : GamePlayer.X);
    return true;
  };

  useEffect(() => {
    const winningSpaces: Array<Array<number>> = [];
    let winner: GamePlayer = GamePlayer.None;
    // Check for matching rows
    // ###
    // ---
    // ---
    for (let rowNum = 0; rowNum < 3; rowNum++) {
      if (
        boardState[rowNum][1] != GamePlayer.None &&
        (winner == GamePlayer.None || boardState[rowNum][1] == winner) &&
        boardState[rowNum][0] == boardState[rowNum][1] &&
        boardState[rowNum][2] == boardState[rowNum][1]
      ) {
        winner = boardState[rowNum][1];
        winningSpaces.push([rowNum, 0]);
        winningSpaces.push([rowNum, 1]);
        winningSpaces.push([rowNum, 2]);
      }
    }
    // Check for matching columns
    // #--
    // #--
    // #--
    for (let colNum = 0; colNum < 3; colNum++) {
      if (
        boardState[1][colNum] != GamePlayer.None &&
        (winner == GamePlayer.None || boardState[1][colNum] == winner) &&
        boardState[0][colNum] == boardState[1][colNum] &&
        boardState[2][colNum] == boardState[1][colNum]
      ) {
        winner = boardState[1][colNum];
        winningSpaces.push([0, colNum]);
        winningSpaces.push([1, colNum]);
        winningSpaces.push([2, colNum]);
      }
    }
    // Check diaganal back
    // #--
    // -#-
    // --#
    if (
      boardState[1][1] != GamePlayer.None &&
      (winner == GamePlayer.None || boardState[1][1] == winner) &&
      boardState[0][0] == boardState[1][1] &&
      boardState[2][2] == boardState[1][1]
    ) {
      winner = boardState[1][1];
      winningSpaces.push([0, 0]);
      winningSpaces.push([1, 1]);
      winningSpaces.push([2, 2]);
    }
    // Check diaganal forward
    // --#
    // -#-
    // #--
    if (
      boardState[1][1] != GamePlayer.None &&
      (winner == GamePlayer.None || boardState[1][1] == winner) &&
      boardState[0][2] == boardState[1][1] &&
      boardState[2][0] == boardState[1][1]
    ) {
      winner = boardState[1][1];
      winningSpaces.push([0, 2]);
      winningSpaces.push([1, 1]);
      winningSpaces.push([2, 0]);
    }
    // Do we have a winner?
    if (winner != GamePlayer.None) {
      setGameOver({
        winner,
        winningSpaces
      });
    } else {
      // Check for tie
      let numSpacesTaken = 0;
      for (let rowNum = 0; rowNum < 3; rowNum++) {
        for (let colNum = 0; colNum < 3; colNum++) {
          if (boardState[rowNum][colNum] != GamePlayer.None) {
            numSpacesTaken += 1;
          }
        }
      }
      if (numSpacesTaken == 9) {
        setGameOver({
          winner: GamePlayer.None
        });
      }
    }
  }, [boardState]);

  const restart = () => {
    setBoardState(gameStartingState.boardState);
    setCurrentPlayer(gameStartingState.currentPlayer);
    setGameOver(undefined);
  };

  const value: GameContextProps = {
    boardState,
    currentPlayer,
    takeTurn,
    gameOver,
    restart
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  return useContext(GameContext);
};
