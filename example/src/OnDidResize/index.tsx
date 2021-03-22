import React, {useState} from 'react';
import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

function OnDidResizeSplit() {
  const [sizes, setSizes] = useState([1/3, 1/3, 1/3]);

  function handleResize(gutterIdx: number, allSizes: number[]) {
    console.log('gutterIdx', gutterIdx);
    console.log('allSizes in %', allSizes);
    // TODO: Bug that causes to tiles to reset their width.
    // This is caused because calling setSizes re-renders OnDidResizeSplit
    // Which re-renders the Splitter.
    // One solution is to pass the sizes to tiles.
    setSizes(allSizes);
  }

  return (
    <ReactSplit
      direction={SplitDirection.Horizontal}
      onDidResize={handleResize}
    >
      <Tile>Takes {sizes[0]}%</Tile>
      <Tile>Takes {sizes[1]}%</Tile>
      <Tile>Takes {sizes[2]}%</Tile>
    </ReactSplit>
  );
}

export default OnDidResizeSplit;


