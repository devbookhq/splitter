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
import reducer from './state/reducer';
import getGutterSizes from 'utils/getGutterSize';

export enum SplitDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

const Container = styled.div<{ dir: SplitDirection }>`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: ${props => props.dir === SplitDirection.Horizontal ? 'row' : 'column'};
  overflow: hidden;
`;

const ChildWrapper = styled.div`
  height: 100%;
  width: 100%;
`;

function getMousePosition(dir: SplitDirection, e: MouseEvent) {
  if (dir === SplitDirection.Horizontal) return e.clientX;
  return e.clientY;
}

function getCursorIcon(dir: SplitDirection) {
  if (dir === SplitDirection.Horizontal) return 'col-resize';
  return 'row-resize';
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

  // Ref containgin an array of refs.
  // To access specific ref: 'childRefs.current[idx].current'.
  const childRefs = useRef(
    children && Array.isArray(children)
    ? children.map(() => createRef<HTMLDivElement>())
    : null
  );
  // The same principle as 'childRefs'.
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

    const pair = state.pairs[gutterIdx];

    // Disable selection.
    pair.a.style.userSelect = 'none';
    pair.b.style.userSelect = 'none';

    // Set the mouse cursor.
    // Must be done at multiple levels, nut just for a gutter.
    // The mouse cursor might move outside of the gutter element.
    pair.gutter.style.cursor = getCursorIcon(state.direction);
    pair.parent.style.cursor = getCursorIcon(state.direction);
    document.body.style.cursor = getCursorIcon(state.direction);
  }, [state.pairs, state.direction]);

  const stopDragging = React.useCallback(() => {
    dispatch({
      type: ActionType.StopDragging,
    });

    if (state.draggingIdx === undefined) throw new Error(`Could not reset cursor and user-select because 'state.draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];

    // Disable selection.
    pair.a.style.userSelect = '';
    pair.b.style.userSelect = '';

    // Set the mouse cursor.
    // Must be done at multiple levels, nut just for a gutter.
    // The mouse cursor might move outside of the gutter element.
    pair.gutter.style.cursor = '';
    pair.parent.style.cursor = '';
    document.body.style.cursor = '';
  }, [state.draggingIdx, state.pairs]);

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
  /////////

  // This method is called on the initial render.
  // It iterates through the all children and make them equal wide.
  const setInitialSizes = React.useCallback((children: HTMLElement[], gutters: HTMLElement[]) => {
    // All children must have common parent.
    const parent = children[0].parentNode;
    if (!parent) throw new Error(`Cannot set initial sizes - parent is undefined.`);
    const parentSize = getInnerSize(state.direction, parent as HTMLElement);
    if (parentSize === undefined) throw new Error(`Cannot set initial sizes - parent has undefined or zero size: ${parentSize}.`);

    children.forEach((c, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === children.length - 1;

      const gutter = gutters[isLast ? idx-1 : idx];
      let gutterSize = gutter.getBoundingClientRect()[state.direction === SplitDirection.Horizontal ? 'width' : 'height'];
      gutterSize = isFirst || isLast ? gutterSize / 2 : gutterSize;

      // '100 / children.length' makes all the children same wide.
      const calc = `calc(${100 / children.length}% - ${gutterSize}px)`;
      if (state.direction === SplitDirection.Horizontal) {
        c.style.width = calc;
      } else {
        c.style.height = calc;
      }
    });
  }, [state.direction]);

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
    if (pair.gutterSize === undefined) throw new Error(`Cannot adjust size - 'pair.gutterSize' is undefined.`);
    const percentage = pair.aSizePct + pair.bSizePct;

    const aSizePct = (offset / pair.size) * percentage;
    const bSizePct = percentage - (offset / pair.size) * percentage;

    const isFirst = state.draggingIdx === 0;
    const isLast = state.draggingIdx === state.pairs.length - 1;
    const { aGutterSize, bGutterSize } = getGutterSizes(pair.gutterSize, isFirst, isLast);

    const aCalc = `calc(${aSizePct}% - ${aGutterSize}px)`;
    const bCalc = `calc(${bSizePct}% - ${bGutterSize}px)`;
    if (state.direction === SplitDirection.Horizontal) {
      pair.a.style.width = aCalc;
      pair.b.style.width = bCalc;
    } else {
      pair.a.style.height = aCalc;
      pair.b.style.height = bCalc;
    }
  }, [state.draggingIdx, state.pairs, state.direction]);

  const drag = React.useCallback((e: MouseEvent) => {
    if (!state.isDragging) return
    if (state.draggingIdx === undefined) throw new Error(`Cannot drag - 'draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.start === undefined) throw new Error(`Cannot drag - 'pair.start' is undefined.`);
    if (pair.size === undefined) throw new Error(`Cannot drag - 'pair.size' is undefined.`);
    if (pair.gutterSize === undefined) throw new Error(`Cannot drag - 'pair.gutterSize' is undefined.`);

    // 'offset' is the width of the 'a' element in a pair.
    let offset = getMousePosition(state.direction, e) - pair.start;

    // Limit the maximum and minimum size of resized children.
    // Use hardcoded value, for now.
    const visibleSize = 16;
    if (offset < pair.gutterSize + visibleSize) {
      offset = pair.gutterSize + visibleSize;
    }

    if (offset >= pair.size - (pair.gutterSize + visibleSize)) {
      offset = pair.size - (pair.gutterSize + visibleSize);
    }

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

    setInitialSizes(childRefs.current.map(el => el.current!), gutterRefs.current.map(el => el.current!));
    // By the time first useEffect runs refs are already set.
    createPairs(childRefs.current.map(el => el.current!), gutterRefs.current.map(el => el.current!));
  }, [setInitialSizes, createPairs]);

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
