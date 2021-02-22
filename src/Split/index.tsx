import React, {
  useEffect,
  useReducer,
  useRef,
  createRef
} from 'react';
import styled from 'styled-components';

import getInnerSize from 'utils/getInnerSize';
import useEventListener from 'useEventListener';

import Gutter from './Gutter';

import { ActionType } from './state/reducer.actions';
import reducer, { State } from './state/reducer';
import getGutterSizes from 'utils/getGutterSize';

export enum SplitDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

const Container = styled.div<{ dir: SplitDirection }>`
  /*
  position: relative;
  left: 120px;
  height: 150px;
  width: 350px;
  */

  width: 100%;
  width: 700px;
  height: 100%;
  // height: 428px;
  height: calc(100%);
  width: calc(100%);

  display: flex;
  flex-direction: ${props => props.dir === SplitDirection.Horizontal ? 'row' : 'column'};
  overflow: hidden;

  background: yellow;
`;

const ChildWrapper = styled.div`
  height: 100%;
  width: 100%;
  background: blue;
`;

function getMousePosition(dir: SplitDirection, e: MouseEvent) {
  if (dir === SplitDirection.Horizontal) return e.clientX;
  return e.clientY;
}


const stateInit = (direction: SplitDirection = SplitDirection.Horizontal) => ({
  direction,
  isDragging: false,

  gutterSize: 14,
  pairs: [],
});


interface SplitProps {
  direction?: SplitDirection;
  children?: React.ReactNode;
}

function Split({ direction, children }: SplitProps) {
  const [state, dispatch] = useReducer(reducer, direction, stateInit);

  const childRefs = useRef(
    children && Array.isArray(children)
    ? children.map(() => createRef<HTMLDivElement>())
    : null
  );
  const gutterRefs = useRef(
    children && Array.isArray(children)
    ? [...Array(children.length - 1)].map(() => createRef<HTMLDivElement>())
    : null
  );

  // Helper dispatch functions.
  const startDragging = React.useCallback((gutterIdx: number) => {
    dispatch({
      type: ActionType.StartDragging,
      payload: { gutterIdx },
    });
  }, []);

  const stopDragging = React.useCallback(() => {
    dispatch({
      type: ActionType.StopDragging,
    });
  }, []);

  const calculateSizes = React.useCallback((gutterIdx: number) => {
    dispatch({
      type: ActionType.CalculateSizes,
      payload: { gutterIdx },
    });
  }, []);

  const createPairs = React.useCallback((children: HTMLElement[], gutters: HTMLElement[]) => {
    dispatch({
      type: ActionType.CreatePairs,
      payload: { children, gutters },
    });
  }, []);

  // Iterate through all children and make them equal wide.
  const setInitialSizes = React.useCallback((children: HTMLElement[]) => {
    // All children must have common parent.
    const parent = children[0].parentNode;
    if (!parent) throw new Error(`Cannot set initial sizes - parent is undefined.`);
    const parentSize = getInnerSize(state.direction, parent as HTMLElement);
    if (parentSize === undefined) throw new Error(`Cannot set initial sizes - parent has undefined or zero size: ${parentSize}.`);

    children.forEach((c, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === children.length - 1;
      const gutterSize = isFirst || isLast ? state.gutterSize / 2 : state.gutterSize;
      // '100 / children.length' makes all the children same wide.
      // TODO: Must be 'c.style.height' for a vertical split.
      const calc = `calc(${100 / children.length}% - ${gutterSize}px)`;
      if (state.direction === SplitDirection.Horizontal) {
        c.style.width = calc;
      } else {
        c.style.height = calc;
      }
    });
  }, [state.gutterSize, state.direction]);

  // Here we actually change the width of children.
  // We convert the element's sizes into percentage
  // and let the CSS 'calc' function do the heavy lifting.
  // Size of 'a' is same as 'offset'.
  //
  // For just 2 children total, the percentage adds up always to 100.
  // For >2 children total, the percentage adds to less than 100.
  // That's because a single gutter changes sizes of only the given pair of children.
  // Each gutter changes size only of the two adjacent elements.
  // -----------------------------------------------------------------------
  // |                     |||                     |||                     |
  // |       33.3%         |||        33.3%        |||       33.3%         |
  // |                     |||                     |||                     |
  // |                     |||                     |||                     |
  // -----------------------------------------------------------------------
  const adjustSize = React.useCallback((offset: number) => {
    if (state.draggingIdx === undefined) throw new Error(`Cannot adjust size - 'draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.size === undefined) throw new Error(`Cannot adjust size - 'pair.size' is undefined.`);
    const percentage = pair.aSizePct + pair.bSizePct;

    const aSizePct = (offset / pair.size) * percentage;
    const bSizePct = percentage - (offset / pair.size) * percentage;

    const isFirst = state.draggingIdx === 0;
    const isLast = state.draggingIdx === state.pairs.length - 1;
    const { aGutterSize, bGutterSize } = getGutterSizes(state.gutterSize, isFirst, isLast);

    // TODO: Must be 'height' for a vertical split.
    const aCalc = `calc(${aSizePct}% - ${aGutterSize}px)`;
    const bCalc = `calc(${bSizePct}% - ${bGutterSize}px)`;
    if (state.direction === SplitDirection.Horizontal) {
      pair.a.style.width = aCalc;
      pair.b.style.width = bCalc;
    } else {
      pair.a.style.height = aCalc;
      pair.b.style.height = bCalc;
    }
  }, [state.draggingIdx, state.pairs, state.gutterSize, state.direction]);

  const drag = React.useCallback((e: MouseEvent) => {
    if (!state.isDragging) return
    if (state.draggingIdx === undefined) throw new Error(`Cannot drag - 'draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.start === undefined) throw new Error(`Cannot drag - 'pair.start' is undefined.`);

    // 'offset' is the width of the 'a' element in a pair.
    const offset = getMousePosition(state.direction, e) - pair.start;
    adjustSize(offset);
  }, [state.isDragging, state.draggingIdx, state.pairs, adjustSize, state.direction]);

  function handleGutterMouseDown(gutterIdx: number, e: MouseEvent) {
    e.preventDefault();
    calculateSizes(gutterIdx);
    startDragging(gutterIdx);
  }

  useEventListener('mouseup', () => {
    if (!state.isDragging) return;
    stopDragging();
  }, [state.isDragging, stopDragging]);

  useEventListener('mousemove', (e: MouseEvent) => {
    if (!state.isDragging) return;
    drag(e);
  }, [state.isDragging, drag]);

  // Initial setup, runs on the first render.
  useEffect(() => {
    if (!childRefs.current || !gutterRefs.current)
      throw new Error(`Cannot create pairs - 'childRefs' or 'gutterRefs' is undefined.`);

    setInitialSizes(childRefs.current.map(el => el.current!));
    // By the time first useEffect runs refs are already set.
    createPairs(childRefs.current.map(el => el.current!), gutterRefs.current.map(el => el.current!));
  }, []);

  return (
    <Container dir={state.direction}>
      {children && Array.isArray(children) && children.map((c, idx) => (
        <React.Fragment key={idx}>
          <ChildWrapper ref={childRefs.current![idx]}>{c}</ChildWrapper>
          {idx < children.length - 1 &&
            <Gutter
              ref={gutterRefs.current![idx]}
              direction={state.direction}
              onMouseDown={e => handleGutterMouseDown(idx, e)}
            />
          }
        </React.Fragment>
      ))}
    </Container>
  );
}

export default Split;
