import React from 'react';
import './Tile.css';

interface TileProps {
  children?: React.ReactNode;
}

function Tile({ children }: TileProps) {
  return (
    <div className="tile">
      {children}
    </div>
  );
}

export default Tile;

