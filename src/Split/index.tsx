
import React, {useEffect, useReducer, useRef, useState, createRef} from 'react';
import styled from 'styled-components';

import Gutter from './Gutter';
import useEventListener from '../useEventListener';

const Container = styled.div`
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
  overflow: hidden;

  background: yellow;
`;

const A = styled.div`
  height: 100%;
  width: 100%;
  padding: 30px;
  background: red;
  overflow-y: auto;
`;

const B = styled.div`
  height: 100%;
  width: 100%;
  padding: 30px;
  background: green;
`;

const ChildWrapper = styled.div`
  height: 100%;
  width: 100%;
  background: blue;
`;

function getMousePosition(e: MouseEvent) {
  // TODO: Must be clientY for a vertical split.
  return e.clientX;
}

enum ActionType {
  CreatePairs,

  CalculateSizes,
  StartDragging,
  StopDragging,
}

interface CreatePairs {
  type: ActionType.CreatePairs;
  payload: {
    children: HTMLElement[],
    gutters: HTMLElement[],
  };
}

interface CalculateSizes {
  type: ActionType.CalculateSizes;
  payload: {
    gutterIdx: number;
  };
  /*
  payload: {
    a: HTMLElement,
    b: HTMLElement,
  };
  */
}

interface StartDragging {
  type: ActionType.StartDragging;
  payload: {
    gutterIdx: number;
  };
}

interface StopDragging {
  type: ActionType.StopDragging;
}

type Action = CreatePairs
  | CalculateSizes
  | StartDragging
  | StopDragging;

interface State {
  isDragging: boolean;
  draggingIdx?: number; // Index of a gutter that is being dragged.
  gutterSize: number;

  pairs: Pair[];
  /*
  start?: number;
  end?: number;
  size?: number;

  gutterSize: number;
  aSizePct: number;
  bSizePct: number;
  */
}

interface Pair {
  idx: number; // Index of the pair (e.i. gutter), not the resizable elements!

  // Index of 'a' is 'pair.idx'.
  // Index of 'b' is 'pair.idx + 1'.
  a: HTMLElement;
  b: HTMLElement;
  // Index of 'gutter' is 'pair.idx'.
  gutter: HTMLElement;

  parent: HTMLElement;

  start?: number;
  end?: number;
  size?: number;

  aSizePct: number;
  bSizePct: number;
}

const initialState: State = {
  isDragging: false,

  gutterSize: 14,
  pairs: [],
  /*
  // Parent element is 700px wide for this demo.
  // Gutter takes (7/700) * 100 = 1 % of the parent.
  // Each element takes (100-1)/2 = 49.5 % of the parent.
  aSizePct: 49.5, // We have only 2 elements in the split for this demo, minus the gutter size.
  bSizePct: 49.5, // We have only 2 elements in the split for this demo, minus the gutter size.
  */
};

function getInnerSize(element: HTMLElement) {
  // Returns undefined if parent element has no layout yet.

  const computedStyle = getComputedStyle(element);
  if (!computedStyle) return;

  // TODO: Must be 'clientHeight' for a vertical split.
  let size = element.clientWidth;

  if (size === 0) return;

  size -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

  // TODO: Must subtract 'paddingTop' and 'paddingBottom' for a vertical split.

  return size;
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.CreatePairs: {
      const { children, gutters } = action.payload;

      // All children must have common parent.
      const parent = children[0].parentNode;
      if (!parent) throw new Error(`Cannot create pairs - child's parent is undefined.`);
      const parentSize = getInnerSize(parent as HTMLElement);
      if (!parentSize) throw new Error(`Cannot create pairs - parent has undefined or zero size: ${parentSize}`)

      const pairs: Pair[] = [];
      children.forEach((_, idx) => {
        if (idx > 0) {
          const a = children[idx-1];
          const b = children[idx];
          const gutter = gutters[idx-1];

          const size = a.getBoundingClientRect().width + gutter.getBoundingClientRect().width + b.getBoundingClientRect().width;

          // TODO: Must be 'height' for a vertical split.
          //const aSizePct = (a.getBoundingClientRect().width / parentSize) * 100;
          //const bSizePct = (b.getBoundingClientRect().width / parentSize) * 100;
          // const aSizePct = (a.getBoundingClientRect().width / size) * 100;
          //const bSizePct = (b.getBoundingClientRect().width / size) * 100;
          // const aSizePct = ((a.getBoundingClientRect().width + state.gutterSize) / parentSize) * 100;
          // const bSizePct = ((b.getBoundingClientRect().width + state.gutterSize) / parentSize) * 100;

          const pair: Pair = {
            idx: idx-1,
            // TODO: Do we need to have a reference to the whole elements? Aren't indexes enough?
            a,
            b,
            gutter,
            parent: parent as HTMLElement,
            // TODO: Must be 'top' for a vertical split.
            start: a.getBoundingClientRect().left,
            // TODO: Must be 'bottom' for a vertical split.
            end: b.getBoundingClientRect().right,
            size,
            // At the start, all elements has the same width.
            aSizePct: 100 / children.length,
            bSizePct: 100 / children.length,
          };

          pairs.push(pair);
        }
      });
      console.log('pairs', pairs);

      return {
        ...state,
        pairs,
      };
    }
    case ActionType.StartDragging: {
      const { gutterIdx } = action.payload;
      return {
        ...state,
        isDragging: true,
        draggingIdx: gutterIdx,
      };
    }
    case ActionType.StopDragging: {
      return {
        ...state,
        isDragging: false,
      };
    }
    /*
    case ActionType.CalculateSizes: {
      const { a, b } = action.payload;
      return {
        ...state,
        // TODO: Must be 'top' for a vertical split.
        start: a.getBoundingClientRect().left,
        // TODO: Must be 'bottom' for a vertical split.
        end: b.getBoundingClientRect().right,
        size: a.getBoundingClientRect().width + b.getBoundingClientRect().width + state.gutterSize,
      };
    }
    */
    case ActionType.CalculateSizes: {
      // We need to calculate sizes only for the pair
      // that has the moved gutter.
      const { gutterIdx } = action.payload;
      const pair = state.pairs[gutterIdx];

      const parentSize = getInnerSize(pair.parent);
      if (!parentSize) throw new Error(`Cannot calculate sizes - parent has undefined or zero size: ${parentSize}`)

      const first = gutterIdx === 0;
      const last = gutterIdx === state.pairs.length - 1;
      let aGutterSize: number;
      let bGutterSize: number;
      if (first) {
        aGutterSize = state.gutterSize / 2;
        bGutterSize = state.gutterSize;
      } else if (last) {
        aGutterSize = state.gutterSize;
        bGutterSize = state.gutterSize / 2;
      } else {
        aGutterSize = state.gutterSize;
        bGutterSize = state.gutterSize;
      }

      // TODO: Must be 'height' for a vertical split.
      /*
      const aSizePct = ((pair.a.getBoundingClientRect().width + state.gutterSize / 2) / parentSize) * 100;
      const bSizePct = ((pair.b.getBoundingClientRect().width + state.gutterSize / 2) / parentSize) * 100;
      */
      const aSizePct = ((pair.a.getBoundingClientRect().width + aGutterSize) / parentSize) * 100;
      const bSizePct = ((pair.b.getBoundingClientRect().width + bGutterSize) / parentSize) * 100;

      // TODO: Must be 'height' for a vertical split.
      /*
      const size =
        pair.a.getBoundingClientRect().width +
        pair.gutter.getBoundingClientRect().width +
        pair.b.getBoundingClientRect().width;
      */
      const size =
        pair.a.getBoundingClientRect().width +
        aGutterSize +
        bGutterSize +
        pair.b.getBoundingClientRect().width;

      console.log('state.pairs BEFORE', state.pairs);
      state.pairs[gutterIdx] = {
        ...pair,

        start: pair.a.getBoundingClientRect().left,
        // TODO: Must be 'bottom' for a vertical split.
        end: pair.b.getBoundingClientRect().right,
        size,
        aSizePct,
        bSizePct,
      };
      console.log('state.pairs AFTER', state.pairs);

      return {
        ...state
      };
    }
    default:
      return state;
  }
}

interface SplitProps {
  children?: React.ReactNode;
}

function Split({ children }: SplitProps) {
  /*
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  */

  const [state, dispatch] = useReducer(reducer, initialState);

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

  // ------------------------------------------------
  // |                     |||                      |
  // |                     |||                      |
  // |                     |||                      |
  // |                     |||                      |
  // ------------------------------------------------
  // | <- start                              end -> |

  // ------------------------------------------------
  // |                     |||                      |
  // |                     |||                      |
  // |                     |||                      |
  // |                     |||                      |
  // ------------------------------------------------
  // | <------------------ size ------------------> |

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

  /*
  const calculateSizes = React.useCallback((a: HTMLElement, b: HTMLElement) => {
    dispatch({
      type: ActionType.CalculateSizes,
      payload: { a, b },
    });
  }, []);
  */

  // -----------------------------------------------------------------------
  // |     i=0     |         i=1         |        i=2       |      i=3     |
  // |             |                     |                  |              |
  // |           pair 0                pair 1             pair 2           |
  // |             |                     |                  |              |
  // -----------------------------------------------------------------------
  const createPairs = React.useCallback((children: HTMLElement[], gutters: HTMLElement[]) => {
    dispatch({
      type: ActionType.CreatePairs,
      payload: { children, gutters },
    });
  }, []);

  // We convert the element's sizes into percentage
  // and let the CSS calc function do the heavy lifting.
  // Size of 'a' is same as 'offset'.
  /*
  const adjustSize = React.useCallback((offset: number) => {
    if (!aRef?.current || !bRef?.current) throw new Error(`Cannot adjust size of elements - 'a' or 'b' is undefined.`);
    if (state.size === undefined) throw new Error(`Cannot adjust size of elements - 'size' is undefined.`)

    const a = aRef.current;
    const b = bRef.current;
    const {
      aSizePct,
      bSizePct,
      size,
      gutterSize,
    } = state;

    // For just 2 children total, the percentage adds up always to 100.
    // For >2 children total, the percentage adds to less than 100.
    // That's because a single gutter changes sizes of only the given pair of children.
    // Each gutter changes size only of the two adjacent elements - all children are splitted into pairs.
    // -----------------------------------------------------------------------
    // |                     |||                     |||                     |
    // |       33.3%         |||        33.3%        |||       33.3%         |
    // |                     |||                     |||                     |
    // |                     |||                     |||                     |
    // -----------------------------------------------------------------------
    const percentage = aSizePct + bSizePct;

    const aSize = (offset / size) * percentage;
    const bSize = percentage - (offset / size) * percentage;

    a.style.width = `calc(${aSize}% - ${gutterSize / 2}px)`;
    b.style.width = `calc(${bSize}% - ${gutterSize / 2}px)`;
  }, [
    state.aSizePct,
    state.bSizePct,
    state.size,
    state.gutterSize,
  ]);
  */

  const setInitialSizes = React.useCallback((children: HTMLElement[]) => {
    // All children must have common parent.
    const parent = children[0].parentNode;
    if (!parent) throw new Error(`Cannot set children sizes - child's parent is undefined.`);
    const parentSize = getInnerSize(parent as HTMLElement);
    if (!parentSize) throw new Error(`Cannot set children sizes - parent has undefined or zero size: ${parentSize}`)

    children.forEach((c, idx) => {
      const first = idx === 0;
      const last = idx === children.length - 1;
      const gutterSize = first || last ? state.gutterSize / 2 : state.gutterSize;
      // '100 / children.length' makes all children same wide.
      // TODO: Must be 'c.style.height' for a vertical split.
      c.style.width = `calc(${100 / children.length}% - ${gutterSize}px)`;
    });

  }, [state.gutterSize]);

  const adjustSize = React.useCallback((offset: number) => {
    if (state.draggingIdx === undefined) throw new Error(`Cannot adjust size - 'draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.size === undefined) throw new Error(`Cannot adjust size - 'pair.size' is undefined`);
    const percentage = pair.aSizePct + pair.bSizePct;

    const aSizePct = (offset / pair.size) * percentage;
    const bSizePct = percentage - (offset / pair.size) * percentage;

    const first = state.draggingIdx === 0;
    const last = state.draggingIdx === state.pairs.length - 1;
    let aGutterSize: number;
    let bGutterSize: number;
    if (first) {
      aGutterSize = state.gutterSize / 2;
      bGutterSize = state.gutterSize;
    } else if (last) {
      aGutterSize = state.gutterSize;
      bGutterSize = state.gutterSize / 2;
    } else {
      aGutterSize = state.gutterSize;
      bGutterSize = state.gutterSize;
    }

    pair.a.style.width = `calc(${aSizePct}% - ${aGutterSize}px)`;
    pair.b.style.width = `calc(${bSizePct}% - ${bGutterSize}px)`;
    /*
    pair.a.style.width = `calc(${aSizePct}%)`;
    pair.b.style.width = `calc(${bSizePct}%)`;
    */
  }, [state.draggingIdx, state.pairs, state.gutterSize]);

  /*
  const drag = React.useCallback((e: MouseEvent) => {
    if (state.start === undefined) throw new Error(`Cannot drag, 'start' is undefined.`);

    const {
      start,
      gutterSize,
    } = state;

    // Calculate gutter's offset from the start.
    const offset = getMousePosition(e) - start;
    adjustSize(offset + gutterSize/2);
  }, [state.start, state.gutterSize, adjustSize]);
  */

  const drag = React.useCallback((e: MouseEvent) => {
    if (!state.isDragging) return
    if (state.draggingIdx === undefined) throw new Error(`Cannot drag - 'draggingIdx' is undefined.`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.start === undefined) throw new Error(`Cannot drag - 'pair.start' is undefined.`);

    const offset = getMousePosition(e) - pair.start;
    // console.log('Offset', offset);
    adjustSize(offset);
  }, [state.isDragging, state.draggingIdx, state.pairs, adjustSize]);

  /*
  function handleGutterMouseDown(e: MouseEvent) {
    if (!aRef?.current || !bRef?.current) throw new Error(`Cannot calculate sizes - 'a' or 'b' is undefined.`);

    e.preventDefault();
    calculateSizes(aRef.current, bRef.current);
    startDragging();
  }
  */

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
    // drag(e)
    drag(e);
  }, [state.isDragging, drag]);
  //}, [state.isDragging, state.start]);

  // Initial setup, run on the first render.
  /*
  useEffect(() => {
    console.log('gutterRefs', gutterRefs);
    console.log('childRefs', childRefs);
    createPairs(childRefs.current!.map(el => el.current!), gutterRefs.current!.map(el => el.current!));

    if (!aRef?.current || !bRef?.current) throw new Error(`Cannot calculate sizes - 'a' or 'b' is undefined.`);
    calculateSizes(aRef.current, bRef.current);
  }, [])
  */

  useEffect(() => {
    if (!childRefs.current || !gutterRefs.current)
      throw new Error(`Cannot create pairs - 'childRefs' or 'gutterRefs' is undefined`);

    setInitialSizes(childRefs.current.map(el => el.current!));
    // By the time first useEffect runs refs are already set.
    createPairs(childRefs.current.map(el => el.current!), gutterRefs.current.map(el => el.current!));
  }, []);


  return (
    <Container>
      {children && Array.isArray(children) && children.map((c, idx) => (
        <React.Fragment key={idx}>
          <ChildWrapper ref={childRefs.current![idx]}>{c}</ChildWrapper>
          {idx < children.length - 1 &&
            <Gutter
              ref={gutterRefs.current![idx]}
              onMouseDown={e => handleGutterMouseDown(idx, e)}
             />
          }
        </React.Fragment>
      ))}

      {/*
      <A ref={aRef}>
        {[...Array(30)].map(i => (
          <div key={Math.random()}>
            This is a left text
            <br/>
          </div>
        ))}
      </A>
      <Gutter
        ref={gutterRef}
        onMouseDown={handleGutterMouseDown}
       />
      <B ref={bRef}>
        This is a right text
      </B>
      */}
    </Container>
  );
}

export default Split;
