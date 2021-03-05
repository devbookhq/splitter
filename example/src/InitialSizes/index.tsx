import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

function InitialSizes() {
  return (
    <ReactSplit
      direction={SplitDirection.Horizontal}
      initialSizes={[60, 20, 20]} // In percentage.
    >
      <Tile/>
      <Tile/>
      <Tile/>
    </ReactSplit>
  );
}

export default InitialSizes;

