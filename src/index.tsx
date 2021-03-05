import React, {
  useEffect,
  useReducer,
  useRef,
} from 'react';
import styled from 'styled-components';

import getInnerSize from './utils/getInnerSize';
import useEventListener from './useEventListener';

import Gutter from './Gutter';

import { ActionType } from './state/reducer.actions';
import reducer, { State } from './state/reducer';
import getGutterSizes from './utils/getGutterSize';

export enum SplitDirection {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

const DefaultMinSize = 16;

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

/*
const stateInit: State = (direction: SplitDirection = SplitDirection.Horizontal) => ({
  direction,
  isDragging: false,
  pairs: [],
});
*/

const initialState: State = {
  isDragging: false,
  pairs: [],
}

interface SplitProps {
  direction: SplitDirection;
  minWidth?: number; // In pixels.
  minHeight?: number; // In pixels.
  initialSizes?: number[]; // In percentage.
  gutterClassName?: string;
  draggerClassName?: string;
  children?: React.ReactNode;
}

function Split({
  direction,
  minWidth,
  minHeight,
  initialSizes,
  gutterClassName,
  draggerClassName,
  children,
}: SplitProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const childRefs = useRef<HTMLElement[]>([]);
  const gutterRefs = useRef<HTMLElement[]>([]);
  // We want to reset refs on each re-render so they don't contain old references.
  childRefs.current = [];
  gutterRefs.current = [];

  // Helper dispatch functions.
  const startDragging = React.useCallback((direction: SplitDirection, gutterIdx: number) => {
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
    pair.gutter.style.cursor = getCursorIcon(direction);
    pair.parent.style.cursor = getCursorIcon(direction);
    document.body.style.cursor = getCursorIcon(direction);
  }, [state.pairs]);

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
    // Must be done at multiple levels, not just for a gutter.
    // The mouse cursor might move outside of the gutter element.
    pair.gutter.style.cursor = '';
    pair.parent.style.cursor = '';
    document.body.style.cursor = '';
  }, [state.draggingIdx, state.pairs]);

  const calculateSizes = React.useCallback((direction: SplitDirection, gutterIdx: number) => {
    dispatch({
      type: ActionType.CalculateSizes,
      payload: { direction, gutterIdx },
    });
  }, []);

  const createPairs = React.useCallback((direction: SplitDirection, children: HTMLElement[], gutters: HTMLElement[]) => {
    dispatch({
      type: ActionType.CreatePairs,
      payload: { direction, children, gutters },
    });
  }, []);
  /////////

  // This method is called on the initial render.
  // It iterates through the all children and make them equal wide.
  const setInitialSizes = React.useCallback((
    direction: SplitDirection,
    children: HTMLElement[],
    gutters: HTMLElement[],
    initialSizes?: number[],
  ) => {
    // All children must have common parent.
    const parent = children[0].parentNode;
    if (!parent) throw new Error(`Cannot set initial sizes - parent is undefined.`);
    const parentSize = getInnerSize(direction, parent as HTMLElement);
    if (parentSize === undefined) throw new Error(`Cannot set initial sizes - parent has undefined or zero size: ${parentSize}.`);

    children.forEach((c, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === children.length - 1;

      const gutter = gutters[isLast ? idx-1 : idx];
      let gutterSize = gutter.getBoundingClientRect()[direction === SplitDirection.Horizontal ? 'width' : 'height'];
      gutterSize = isFirst || isLast ? gutterSize / 2 : gutterSize;

      let calc: string;
      if (initialSizes && idx < initialSizes.length)  {
        calc = `calc(${initialSizes[idx]}% - ${gutterSize}px)`;
      } else {
        // '100 / children.length' makes all the children same wide.
        calc = `calc(${100 / children.length}% - ${gutterSize}px)`;
      }

      if (direction === SplitDirection.Horizontal) {
        c.style.width = calc;
        // Reset the child wrapper's height because the direction could have changed.
        c.style.height = '100%';
      } else {
        c.style.height = calc;
        // Reset the child wrapper's width because the direction could have changed.
        c.style.width = '100%';
      }
    });
  }, []);

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
  const adjustSize = React.useCallback((direction: SplitDirection, offset: number) => {
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
    if (direction === SplitDirection.Horizontal) {
      pair.a.style.width = aCalc;
      pair.b.style.width = bCalc;
    } else {
      pair.a.style.height = aCalc;
      pair.b.style.height = bCalc;
    }
  }, [state.draggingIdx, state.pairs, direction]);

  const drag = React.useCallback((e: MouseEvent, direction: SplitDirection, minSize?: number) => {
    if (!state.isDragging) return
    if (state.draggingIdx === undefined) throw new Error(`Cannot drag - 'draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.start === undefined) throw new Error(`Cannot drag - 'pair.start' is undefined.`);
    if (pair.size === undefined) throw new Error(`Cannot drag - 'pair.size' is undefined.`);
    if (pair.gutterSize === undefined) throw new Error(`Cannot drag - 'pair.gutterSize' is undefined.`);

    // 'offset' is the width of the 'a' element in a pair.
    let offset = getMousePosition(direction, e) - pair.start;

    // Limit the maximum and minimum size of resized children.

    const visibleSize = minSize === undefined ? DefaultMinSize : minSize;
    if (offset < pair.gutterSize + visibleSize) {
      offset = pair.gutterSize + visibleSize;
    }

    if (offset >= pair.size - (pair.gutterSize + visibleSize)) {
      offset = pair.size - (pair.gutterSize + visibleSize);
    }

    adjustSize(direction, offset);
  }, [state.isDragging, state.draggingIdx, state.pairs, adjustSize]);

  function handleGutterMouseDown(gutterIdx: number, e: MouseEvent) {
    e.preventDefault();
    calculateSizes(direction, gutterIdx);
    startDragging(direction, gutterIdx);
  }

  useEventListener('mouseup', () => {
    if (!state.isDragging) return;
    stopDragging();
  }, [state.isDragging, stopDragging]);

  useEventListener('mousemove', (e: MouseEvent) => {
    if (!state.isDragging) return;
    drag(e, direction, direction === SplitDirection.Horizontal ? minWidth : minHeight);
  }, [direction, state.isDragging, drag, minWidth, minHeight]);

  // Initial setup, runs every time the child views changes.
  useEffect(() => {
    if (children === undefined) throw new Error(`Cannot initialize split - 'children' are undefined`);
    if (!Array.isArray(children)) throw new Error(`Cannot initialize split - 'children' isn't an array.`);
    if (children.length <= 1)
      throw new Error(`Cannot initialize split - the 'children' array has 1 or less elements. Provide at least 2 child views for the split.`);

    // By the time first useEffect runs refs should be already set, unless something really bad happened.
    if (!childRefs.current || !gutterRefs.current)
      throw new Error(`Cannot create pairs - 'childRefs' or 'gutterRefs' is undefined.`);

    setInitialSizes(direction, childRefs.current, gutterRefs.current, initialSizes);
    createPairs(direction, childRefs.current, gutterRefs.current);
  // The reason 'children' is in the dependency array is that we have to recalculate
  // the state every time a child view is deleted or added - this is every time the child
  // views change -> hence the deps array.
  // The same goes for 'direction'. We need to recalculate the state if the split's direction
  // changes.
  }, [children, direction, setInitialSizes, createPairs, initialSizes]);

  function addRef(refs: typeof childRefs | typeof gutterRefs, el: any) {
    if (!refs.current) throw new Error(`Can't add element to ref object - ref isn't initialized`);
    if (el && !refs.current.includes(el)) {
      refs.current.push(el);
    }
  }

  return (
    <Container dir={direction}>
      {children && Array.isArray(children) && children.map((c, idx) => (
        <React.Fragment key={idx}>
          <ChildWrapper
            ref={el => addRef(childRefs, el)}
          >
            {c}
          </ChildWrapper>
          {/* A gutter is between each two child views. */}
          {idx < children.length - 1 &&
            <Gutter
              ref={el => addRef(gutterRefs, el)}
              className={gutterClassName}
              draggerClassName={draggerClassName}
              direction={direction}
              onMouseDown={e => handleGutterMouseDown(idx, e)}
            />
          }
        </React.Fragment>
      ))}
    </Container>
  );
}

export default Split;
