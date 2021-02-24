import React from 'react';
import styled from 'styled-components';
import { SplitDirection } from './index';

const Container = styled.div<{ dir?: SplitDirection }>`
  padding: ${props => props.dir === SplitDirection.Horizontal ? '0 2px' : '2px 0'};
  ${props => props.dir === SplitDirection.Horizontal ? 'height: 100%' : 'width: 100%'};

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${props => props.dir === SplitDirection.Horizontal ? 'column' : 'row'};

  background: #020203;

  :hover {
    cursor: ${props => props.dir === SplitDirection.Horizontal ? 'col-resize' : 'row-resize'};

    // Set background to the Dragger.
    & > * {
      background: #9995A3;
    }
  }
`;

const Dragger = styled.div<{ dir?: SplitDirection }>`
  width: ${props => props.dir === SplitDirection.Horizontal ? '3' : '24'}px;
  height: ${props => props.dir === SplitDirection.Horizontal ? '24' : '3'}px;
  background: #434252;
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
    >
      <Dragger dir={direction}/>
    </Container>
  );
});

export default Gutter;

