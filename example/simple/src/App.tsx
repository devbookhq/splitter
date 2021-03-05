import './styles.css';
import './App.css';
import Tile from './Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/react-split';

function App() {
  return (
    <div className="app">
      <ReactSplit
        direction={SplitDirection.Vertical}
        minWidth={100}
        minHeight={100}
      >
        <Tile/>
        <Tile/>
      </ReactSplit>
    </div>
  );
}

export default App;

