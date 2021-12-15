import ReactSplit from '@devbookhq/splitter';
import Tile from '../Tile';

function SingleHorizontal() {
  return (
    <ReactSplit>
      <Tile>
        Single tile in horizontal split
      </Tile>
    </ReactSplit>
  );
}

export default SingleHorizontal;
