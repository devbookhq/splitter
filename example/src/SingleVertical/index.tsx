import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import Tile from '../Tile';

function SingleVertical() {
  return (
    <ReactSplit
      direction={SplitDirection.Vertical}
    >
      <Tile>
        Single tile in vertical split
      </Tile>
    </ReactSplit>
  );
}

export default SingleVertical;
