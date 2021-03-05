import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

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
