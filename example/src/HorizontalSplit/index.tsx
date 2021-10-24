import ReactSplit, { SplitDirection } from '@devbookhq/splitter';
import Tile from '../Tile';


function HorizontalSplit() {  
  return (
    <ReactSplit
      direction={SplitDirection.Vertical}
    >
      <Tile/>        
      <Tile/>
      <Tile/>        
    </ReactSplit>        
  );
}

export default HorizontalSplit;

