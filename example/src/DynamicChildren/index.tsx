import { useEffect, useState } from 'react'
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import Tile from '../Tile';

function HorizontalSplit() {
  const [insertChildren, setInsertChildren] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setInsertChildren(true)
    }, 5000)
  }, [])


  return (
    <ReactSplit
      initialSizes={insertChildren ? [50, 50] : [100]}
    >
      <Tile>Initial child node</Tile>
      {insertChildren &&
        <>
          <Tile>Dynamically inserted child 1</Tile>
          <ReactSplit
            direction={SplitDirection.Vertical}
          >
            <Tile>Dynamically inserted child 2</Tile>
            <Tile>Dynamically inserted child 3</Tile>
          </ReactSplit>
        </>
      }
    </ReactSplit>
  );
}

export default HorizontalSplit;

