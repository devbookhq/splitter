import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  height: 100%;
  border: 7px solid #808080;
`;

interface GutterProps {
  onMouseDown?: (e: any) => void;
}

const Gutter = React.forwardRef<HTMLDivElement, GutterProps>((
  { onMouseDown },
  ref,
) => {
  return (
    <Container
      ref={ref}
      onMouseDown={onMouseDown}
    />
  );
});

export default Gutter;

