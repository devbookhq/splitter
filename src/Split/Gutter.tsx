import React from 'react';
import styled from 'styled-components';
import { SplitDirection } from 'Split';

const Container = styled.div<{ dir?: SplitDirection }>`
  ${props => props.dir === SplitDirection.Horizontal ? 'height: 100%' : 'width: 100%'};
  border: 7px solid #808080;

  :hover {
    cursor: ${props => props.dir === SplitDirection.Horizontal ? 'col-resize' : 'row-resize'};
  }
`;

interface GutterProps {
  direction?: SplitDirection;
  onMouseDown?: (e: any) => void;
}

const Gutter = React.forwardRef<HTMLDivElement, GutterProps>((
  { direction, onMouseDown },
  ref,
) => {
  return (
    <Container
      ref={ref}
      dir={direction}
      onMouseDown={onMouseDown}
    />
  );
});

export default Gutter;

