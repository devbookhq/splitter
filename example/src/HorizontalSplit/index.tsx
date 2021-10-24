import ReactSplit from '@devbookhq/splitter';
import Tile from '../Tile';


function HorizontalSplit() {  
  return (
    <ReactSplit>
      <Tile/>
      <Tile/>
      <Tile/>
    </ReactSplit>        
  );
}

export default HorizontalSplit;

