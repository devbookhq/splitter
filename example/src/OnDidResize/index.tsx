import React, { useState } from 'react';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import Tile from '../Tile';

function OnDidResizeSplit() {
  const [sizes, setSizes] = useState([1/3 * 100, 1/3 * 100, 1/3 * 100]);

  function handleResize(gutterIdx: number, allSizes: number[]) {
    console.log('gutterIdx', gutterIdx);
    console.log('allSizes in %', allSizes);
    setSizes(allSizes);
  }

  return (
    <ReactSplit
      direction={SplitDirection.Horizontal}
      onResizeFinished={handleResize}
      initialSizes={sizes}
    >
      <Tile>Takes {sizes[0]}%</Tile>
      <Tile>Takes {sizes[1]}%</Tile>
      <Tile>Takes {sizes[2]}%</Tile>
    </ReactSplit>
  );
}

export default OnDidResizeSplit;


