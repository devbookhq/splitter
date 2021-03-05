import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

function HorizontalSplit() {
  return (
    <ReactSplit
      direction={SplitDirection.Horizontal}
    >
      <Tile/>
      <Tile/>
      <Tile/>
    </ReactSplit>
  );
}

export default HorizontalSplit;

