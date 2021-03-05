import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/react-split';

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

