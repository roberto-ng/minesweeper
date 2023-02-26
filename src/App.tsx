import { GameState, useGameState } from './gameState';
import { BoardSquare } from './BoardSquare';

function App() {
  const [game, dispatch] = useGameState();

  return (
    <div className="h-screen w-screen m-0 flex flex-col items-center justify-center bg-slate-900 ">
      {game.gameState !== GameState.Playing && (
        <div className="absolute flex flex-col items-center gap-4 bg-white p-3 rounded shadow-lg">
          <p className="text-5xl font-bold text-lime-700 mt-2 select-none animate-bounce">
            {game.gameState === GameState.PlayerLost && 'VOCÊ PERDEU!!!'}
            {game.gameState === GameState.PlayerWon && 'VOCÊ GANHOU!!!'}
          </p>

          <button
            className="text-white rounded p-2 shadow bg-lime-600 hover:bg-lime-700"
            onClick={() => dispatch({ type: 'reset' })}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="flex flex-row items-center justify-center shadow-md shadow-lime-400">
        {game.board.map((row, y) => (
          <div key={y}>
            {row.map((square, x) => (
              <BoardSquare
                key={x}
                pos={{ x, y }}
                board={game.board}
                square={square}
                onClick={() => dispatch({ type: 'press', x, y })}
                onRightClick={() => dispatch({ type: 'right_press', x, y })}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
