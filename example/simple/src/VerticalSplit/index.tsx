import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/react-split';

function VerticalSplit() {
  return (
    <ReactSplit
      direction={SplitDirection.Vertical}
    >
      <Tile/>
      <Tile/>
      <Tile/>
    </ReactSplit>
  );
}

export default VerticalSplit;
