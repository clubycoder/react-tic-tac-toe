import { AudioPlayerProvider } from './AudioPlayer';
import { GameProvider } from './Game';
import { Board } from './Board';

import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <AudioPlayerProvider>
      <GameProvider>
        <Board />
      </GameProvider>
    </AudioPlayerProvider>
  );
}

export default App
