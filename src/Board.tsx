import { MouseEvent, useEffect } from 'react';
import { GamePlayer, useGame } from './Game';
import { useAudioPlayer } from './AudioPlayer';

import './Board.css'

import XIcon from './assets/x.svg?react';
import OIcon from './assets/o.svg?react';

import MusicAudio from '/sfx/music1.wav?url';
import XAudio from '/sfx/punch1.wav?url';
import OAudio from '/sfx/punch2.wav?url';
import WinnerAudio from '/sfx/applause1.wav?url';
import TieAudio from '/sfx/boo1.wav?url';

interface SpaceProps {
  state: number;
  winning: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

function Space({ state, winning, onClick }: SpaceProps) {
  const extraClassName = winning ? "space-winning" : "";

  return (
    <div className={`space ${extraClassName}`} onClick={onClick}>
      {state == 1 ? <XIcon /> : (state == 2 ? <OIcon /> : null)}
    </div>
  );
}

export function Board() {
  const {boardState, currentPlayer, takeTurn, gameOver, restart} = useGame();
  const {loadAudio, playAudio} = useAudioPlayer();

  useEffect(() => {
    loadAudio("music", MusicAudio, true, true);
    loadAudio("X", XAudio);
    loadAudio("O", OAudio);
    loadAudio("winner", WinnerAudio);
    loadAudio("tie", TieAudio);
  }, []);

  let message = `${currentPlayer == GamePlayer.X ? "X" : "O"} take your turn.`;
  if (gameOver) {
    if (gameOver.winner != GamePlayer.None) {
      message = `Game over!  ${gameOver.winner == GamePlayer.X ? "X" : "O"} wins!`;
      playAudio("winner");
    } else {
      message = `Game over!  It was a tie.`;
      playAudio("tie");
    }
  }

  const isWinning = (rowNum: number, colNum: number) => {
    if (gameOver && gameOver.winningSpaces) {
      return gameOver.winningSpaces.some(space => space[0] == rowNum && space[1] == colNum);
    }
    return false;
  };

  return (
    <div>
      <div className="message">{message}</div>
      <div className="board">
        {
          boardState?.map((row, rowNum) =>
            row.map((state, colNum) =>
              <Space
                key={`${rowNum}_${colNum}`}
                state={state}
                winning={isWinning(rowNum, colNum)}
                onClick={() => {
                    if (!gameOver) {
                        const prevPlayer = currentPlayer;
                        const valid = takeTurn(rowNum, colNum);
                        if (valid) {
                            if (prevPlayer == GamePlayer.X) {
                                playAudio("X");
                            } else {
                                playAudio("O");
                            }
                        }
                    }
                }}
              />
            )
          )
        }
      </div>
      <div>
        <button
          className="restart"
          onClick={restart}
        >
          Restart Game
        </button>
      </div>
    </div>
  );
}
