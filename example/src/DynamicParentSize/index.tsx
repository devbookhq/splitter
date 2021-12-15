import { useEffect, useState } from 'react'
import styled from 'styled-components';
import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import Tile from '../Tile';

const Zero = styled.div<{ isReady: boolean }>`
  height: 100%;
  width: ${props => props.isReady ? '100%' : '0%'}
`

function HorizontalSplit() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setReady(true)
    }, 5000)
  }, [])

  return (
    <Zero isReady={ready}>
      <ReactSplit
        direction={SplitDirection.Horizontal}
        >
        <Tile/>
        <Tile/>
        <Tile/>
      </ReactSplit>
    </Zero>
  );
}

export default HorizontalSplit;

