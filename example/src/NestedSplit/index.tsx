import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/react-split';

function NestedSplit() {
  return (
    <ReactSplit direction={SplitDirection.Horizontal}>
      <Tile/>
      <ReactSplit direction={SplitDirection.Vertical}>
        <Tile/>
        <ReactSplit direction={SplitDirection.Horizontal}>
          <Tile/>
          <Tile/>
        </ReactSplit>
      </ReactSplit>
    </ReactSplit>
  );
}

export default NestedSplit;
