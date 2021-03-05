import TileOverflowX from './TileOverflowX';
import TileOverflowY from './TileOverflowY';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

function ScrollableChildren() {
  return (
      <ReactSplit direction={SplitDirection.Horizontal}>
        <TileOverflowX/>
        <ReactSplit direction={SplitDirection.Vertical}>
          <TileOverflowY/>
          <ReactSplit direction={SplitDirection.Horizontal}>
            <TileOverflowY/>
            <TileOverflowX/>
          </ReactSplit>
        </ReactSplit>
      </ReactSplit>
  );
}

export default ScrollableChildren;

