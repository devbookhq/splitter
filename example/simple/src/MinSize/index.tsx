import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/react-split';

function MinSize() {
  return (
    <ReactSplit
      direction={SplitDirection.Horizontal}
      minWidth={300} // In pixels.
    >
      <Tile/>
      <ReactSplit
        direction={SplitDirection.Vertical}
        minHeight={100} // In pixels.
      >
        <Tile/>
        <Tile/>
      </ReactSplit>
    </ReactSplit>
  );
}

export default MinSize;

