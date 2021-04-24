import React, { useState } from 'react';
import styled from 'styled-components';
import Tile from '../Tile';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';

function OnDidResizeSplit() {
  const [sizes, setSizes] = useState([1/3, 1/3, 1/3]);

  function handleResize(gutterIdx: number, allSizes: number[]) {
    console.log('gutterIdx', gutterIdx);
    console.log('allSizes in %', allSizes);
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


