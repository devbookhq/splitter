import React from 'react';
import styled from 'styled-components';
import { SplitDirection, GutterTheme } from './index';

const Container = styled.div<{ dir?: SplitDirection, theme?: GutterTheme }>`
  padding: ${props => props.dir === SplitDirection.Horizontal ? '0 2px' : '2px 0'};
  ${props => props.dir === SplitDirection.Horizontal ? 'height: 100%' : 'width: 100%'};

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: ${props => props.dir === SplitDirection.Horizontal ? 'column' : 'row'};

  background: ${props => props.theme === GutterTheme.Dark ? '#020203' : '#EDF0EF'};

  :hover {
    cursor: ${props => props.dir === SplitDirection.Horizontal ? 'col-resize' : 'row-resize'};

    // Set the Dragger background.
    & > * {
      background: ${props => props.theme === GutterTheme.Dark ? '#9995A3' : '#76747B'};
    }
  }
`;

const Dragger = styled.div<{ dir?: SplitDirection, theme?: GutterTheme }>`
  width: ${props => props.dir === SplitDirection.Horizontal ? '4' : '24'}px;
  height: ${props => props.dir === SplitDirection.Horizontal ? '24' : '4'}px;
  background: ${props => props.theme === GutterTheme.Dark ? '#434252' : '#A6ACB5'};
  border-radius: 2px;
`;

interface GutterProps {
  className?: string;
  theme?: GutterTheme;
  draggerClassName?: string;
  direction?: SplitDirection;
  onMouseDown?: (e: any) => void;
}

const Gutter = React.forwardRef<HTMLDivElement, GutterProps>((
  {
    className,
    theme,
    draggerClassName,
    direction,
    onMouseDown,
  },
  ref,
) => {
  const DraggerEl = () => (
    <Dragger
      dir={direction}
      theme={theme}
    />
  )
  return (
    <>
      {className &&
        <div
          className={className}
          ref={ref}
          dir={direction}
          onMouseDown={onMouseDown}
        >
          {draggerClassName &&
            <div
              className={draggerClassName}
              dir={direction}
            />
          }
          {!draggerClassName &&
            <DraggerEl />
          }
        </div>
      }

      {!className &&
        <Container
          ref={ref}
          className={className}
          dir={direction}
          onMouseDown={onMouseDown}
          theme={theme}
        >
          {draggerClassName &&
            <div
              className={draggerClassName}
              dir={direction}
            />
          }
          {!draggerClassName &&
            <DraggerEl />
          }
        </Container>
      }
    </>
  );
});

export default Gutter;

