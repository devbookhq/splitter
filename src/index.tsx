import React, {
  useEffect,  
  useReducer,
  useRef,
} from 'react';

import './index.css';
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

export enum GutterTheme {
  Light = 'Light',
  Dark = 'Dark',
}

const DefaultMinSize = 16;

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
  isReady: false,
  isKeyboardDragging: false,
  isDragging: false,
  pairs: [],
}

interface SplitProps {
  direction?: SplitDirection;
  minWidths?: number[]; // In pixels.
  minHeights?: number[]; // In pixels.
  initialSizes?: number[]; // In percentage.
  gutterTheme?: GutterTheme;
  gutterClassName?: string;
  draggerClassName?: string;
  children?: React.ReactNode;
  onResizeStarted?: (pairIdx: number) => void;
  onResizeFinished?: (pairIdx: number, newSizes: number[]) => void;
  classes?: string[];
}

function Split({
  direction = SplitDirection.Horizontal,
  minWidths = [],
  minHeights = [],
  initialSizes,
  gutterTheme = GutterTheme.Dark,
  gutterClassName,
  draggerClassName,
  children,
  onResizeStarted,
  onResizeFinished,
  classes = [],
}: SplitProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const containerRef = useRef<HTMLDivElement>(null)
  const childRefs = useRef<HTMLElement[]>([]);
  const gutterRefs = useRef<HTMLElement[]>([]);
  // We want to reset refs on each re-render so they don't contain old references.
  childRefs.current = [];
  gutterRefs.current = [];

  // Helper dispatch functions.
  const setIsRenderToCompute = React.useCallback((isReady: boolean) => {
    dispatch({
      type: ActionType.SetIsReadyToCompute,
      payload: { isReady },
    })
  }, [])

  const startDragging = React.useCallback((direction: SplitDirection, gutterIdx: number) => {
    dispatch({
      type: ActionType.StartDragging,
      payload: { gutterIdx },
    });

    const pair = state.pairs[gutterIdx];
    onResizeStarted?.(pair.idx)

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

  const startKeyboardDragging = React.useCallback((gutterIdx: number) => {
    dispatch({
      type: ActionType.StartKeyboardDragging,
      payload: { gutterIdx },
    })
  }, [state.pairs])

  const stopKeyboardDragging = React.useCallback(() => {
    dispatch({
      type: ActionType.StopKeyboardDragging,
    });
  }, [])

  const stopDragging = React.useCallback(() => {
    dispatch({
      type: ActionType.StopDragging,
    });

    // The callback receives an index of the resized pair and new sizes of all child elements.
    const allSizes: number[] = [];
    for (let idx = 0; idx < state.pairs.length; idx++) {
      const pair = state.pairs[idx];
      const parentSize = getInnerSize(direction, pair.parent);
      if (parentSize === undefined) throw new Error(`Cannot call the 'onResizeFinished' callback - parentSize is undefined`);
      if (pair.gutterSize === undefined) throw new Error(`Cannot call 'onResizeFinished' callback - gutterSize is undefined`);

      const isFirst = idx === 0;
      const isLast = idx === state.pairs.length - 1;

      const aSize = pair.a.getBoundingClientRect()[direction === SplitDirection.Horizontal ? 'width' : 'height'];
      const { aGutterSize, bGutterSize } = getGutterSizes(pair.gutterSize, isFirst, isLast);
      const aSizePct = ((aSize + aGutterSize) / parentSize) * 100;
      allSizes.push(aSizePct);

      if (isLast) {
        const bSize = pair.b.getBoundingClientRect()[direction === SplitDirection.Horizontal ? 'width' : 'height'];
        const bSizePct = ((bSize + bGutterSize) / parentSize) * 100;
        allSizes.push(bSizePct);
      }
    }

    if (state.draggingIdx === undefined) throw new Error(`Could not reset cursor and user-select because 'state.draggingIdx' is undefined`);
    const pair = state.pairs[state.draggingIdx];
    onResizeFinished?.(pair.idx, allSizes);

    // Disable selection.
    pair.a.style.userSelect = '';
    pair.b.style.userSelect = '';

    // Set the mouse cursor.
    // Must be done at multiple levels, not just for a gutter.
    // The mouse cursor might move outside of the gutter element.
    pair.gutter.style.cursor = '';
    pair.parent.style.cursor = '';
    document.body.style.cursor = '';
  }, [state.draggingIdx, state.pairs, direction]);

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
  // It iterates through the all children and sets their initial sizes.
  const setInitialSizes = React.useCallback((
    direction: SplitDirection,
    children: HTMLElement[],
    gutters: HTMLElement[],
    initialSizes?: number[],
  ) => {
    // We assume that all children have the same parent.
    const parent = children[0].parentNode;
    if (!parent) throw new Error(`Cannot set initial sizes - parent is undefined`);
    const parentSize = getInnerSize(direction, parent as HTMLElement);
    if (parentSize === undefined) throw new Error(`Cannot set initial sizes - parent has undefined size`);

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
  // Size of 'pair.a' is same as 'offset'.
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
    if (state.draggingIdx === undefined) throw new Error(`Cannot adjust size - 'draggingIdx' is undefined`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.size === undefined) throw new Error(`Cannot adjust size - 'pair.size' is undefined`);
    if (pair.gutterSize === undefined) throw new Error(`Cannot adjust size - 'pair.gutterSize' is undefined`);
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

  const drag = React.useCallback((e: MouseEvent, direction: SplitDirection, minSizes: number[]) => {
    if (!state.isDragging) return
    if (state.draggingIdx === undefined) throw new Error(`Cannot drag - 'draggingIdx' is undefined`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.start === undefined) throw new Error(`Cannot drag - 'pair.start' is undefined`);
    if (pair.size === undefined) throw new Error(`Cannot drag - 'pair.size' is undefined`);
    if (pair.gutterSize === undefined) throw new Error(`Cannot drag - 'pair.gutterSize' is undefined`);

    // 'offset' is the width of the 'a' element in a pair. 
    // It's the mouse cursor's distance from the start of a pair.
    //
    // "*" is a mouse position.
    // ------------------------------------------------
    // |                     |||                      |
    // |---offset---*        |||                      |
    // |                     |||                      |
    // |                     |||                      |
    // ------------------------------------------------
    // | <- start                              end -> |
    let offset = getMousePosition(direction, e) - pair.start;

    // Limit the maximum size and the minimum size of resized children.

    let aMinSize = DefaultMinSize;
    let bMinSize = DefaultMinSize;
    if (minSizes.length > state.draggingIdx) {
      aMinSize = minSizes[state.draggingIdx];
    }
    if (minSizes.length >= state.draggingIdx + 1) {
      bMinSize = minSizes[state.draggingIdx + 1];
    }

    // TODO: We should check whether the parent is big enough to support these min sizes.
    if (offset < pair.gutterSize + aMinSize) {
      offset = pair.gutterSize + aMinSize;
    }

    if (offset >= pair.size - (pair.gutterSize + bMinSize)) {
      offset = pair.size - (pair.gutterSize + bMinSize);
    }

    adjustSize(direction, offset);
  }, [state.isDragging, state.draggingIdx, state.pairs, adjustSize]);

  const moveBy = React.useCallback((dir: SplitDirection, amount: number, minSizes: number[]) => {
    if (!state.isKeyboardDragging) return
    if (state.draggingIdx === undefined) throw new Error(`Cannot drag - 'draggingIdx' is undefined`);

    const pair = state.pairs[state.draggingIdx];
    if (pair.start === undefined) throw new Error(`Cannot drag - 'pair.start' is undefined`);
    if (pair.size === undefined) throw new Error(`Cannot drag - 'pair.size' is undefined`);
    if (pair.gutterSize === undefined) throw new Error(`Cannot drag - 'pair.gutterSize' is undefined`);

    
    // 'offset' is the width of the 'a' element in a pair.
    // It's the current size of the `a` element minus/plus the `amount`
    let offset = dir === SplitDirection.Horizontal 
      ? 
        pair.a.getBoundingClientRect().width + amount
      : pair.a.getBoundingClientRect().height + amount;

    let aMinSize = DefaultMinSize;
    let bMinSize = DefaultMinSize;
    if (minSizes.length > state.draggingIdx) {
      aMinSize = minSizes[state.draggingIdx];
    }
    if (minSizes.length >= state.draggingIdx + 1) {
      bMinSize = minSizes[state.draggingIdx + 1];
    }

    adjustSize(direction, offset)
  },[state.isDragging, state.draggingIdx, state.pairs, adjustSize])

  function handleGutterMouseDown(gutterIdx: number, e: MouseEvent) {
    e.preventDefault();
    calculateSizes(direction, gutterIdx);
    startDragging(direction, gutterIdx);
  }

  // Gutter can get focused when a user presses the TAB key. 
  function handleGutterFocus(gutterIdx: number, e: KeyboardEvent) {
    e.preventDefault();
    calculateSizes(direction, gutterIdx);
    startKeyboardDragging(gutterIdx);
  }

  function handleGutterBlur(e: KeyboardEvent) {
    e.preventDefault();
    stopKeyboardDragging();
  }

  useEventListener('keydown', (e) => {
    if (!state.isKeyboardDragging) return;
    
    // Ignore if it isn't an arrow key.
    if (e.keyCode > 40 || e.keyCode < 37) return;
    
    if (state.draggingIdx === undefined)
      throw new Error(`Cannot calculate sizes after dragging - 'state.draggingIdx' is undefined`);
    
    // Only allow appropriate arrow keys based on the split direction.    
    
    let moveAmount = 0
    if (direction === SplitDirection.Horizontal) {
      // Left
      if (e.keyCode == 37) {
        moveAmount = -10;
      }
      
      // Right
      if (e.keyCode == 39) {
        moveAmount = 10;
      }
    }
    
    if (direction === SplitDirection.Vertical) {
      // Up
      if (e.keyCode == 38) {
        moveAmount = -10;
      }

      // Down
      if (e.keyCode == 40) {
        moveAmount = 10;
      }
    }    
    
    const minSizes = direction === SplitDirection.Horizontal ? minWidths : minHeights;
    moveBy(direction, moveAmount, minSizes);
  }, [state.isKeyboardDragging, stopKeyboardDragging, moveBy, minWidths, minHeights])

  useEventListener('mouseup', () => {
    if (!state.isDragging) return;
    if (state.draggingIdx === undefined)
      throw new Error(`Cannot calculate sizes after dragging - 'state.draggingIdx' is undefined`);
    calculateSizes(direction, state.draggingIdx);
    stopDragging();
  }, [state.isDragging, stopDragging]);

  useEventListener('mousemove', (e: MouseEvent) => {
    if (!state.isDragging) return;
    drag(e, direction, direction === SplitDirection.Horizontal ? minWidths : minHeights);
  }, [direction, state.isDragging, drag, minWidths, minHeights]);

  // This makes sure that Splitter properly re-renders if parent's size changes dynamically.  
  useEffect(function watchParentSize() {    
    if (!containerRef.current) return    
    const el = containerRef.current.parentElement
    
    // Splitter must have a parent element. In the most trivial example it's either <body> or <html>.
    if (!el) return
    
    // TODO: Potential performance issue!
    // When nesting Splitters the `observer` is registered for each nesting "level".
    // Splitter's parent element is another Splitter in the nesting use case.
    const observer = new ResizeObserver(() => {      
      const style = getComputedStyle(el)
      const size = direction === SplitDirection.Horizontal ? el.clientWidth : el.clientHeight
      const isReady = !!style && !!size
      setIsRenderToCompute(isReady)
    })
    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [
    containerRef.current, 
    direction, 
  ])

  // Initial setup, runs every time the child views change.
  useEffect(function initialSetup() {
    if (!state.isReady) return
    
    if (children === undefined) throw new Error(`Cannot initialize split - 'children' is undefined`);
    // Handle gracefully is user specified only one child elment.
    if (!Array.isArray(children) || children.length <= 1) {
      return
    }
      // throw new Error(`Cannot initialize split - the 'children' array has 1 or less elements. Provide at least 2 child views for Splitter`);

    // By the time first useEffect runs refs should be already set, unless something really bad happened.
    if (!childRefs.current || !gutterRefs.current)
      throw new Error(`Cannot create pairs - either variable 'childRefs' or 'gutterRefs' is undefined`);

    setInitialSizes(direction, childRefs.current, gutterRefs.current, initialSizes);
    createPairs(direction, childRefs.current, gutterRefs.current);
  }, [state.isReady, direction, setInitialSizes, createPairs, initialSizes]);

  function addRef(refs: typeof childRefs | typeof gutterRefs, el: any) {
    if (!refs.current) throw new Error(`Can't add element to ref object - ref isn't initialized`);
    if (el && !refs.current.includes(el)) {
      refs.current.push(el);
    }
  }

  return (    
    <div
      className={'__dbk__container ' + `${direction}`}
      ref={containerRef}
    >
      {children && !Array.isArray(children) && (
        <div>
          {children}
        </div>
      )}

      {state.isReady && children && Array.isArray(children) && children.map((c, idx) => (
        <React.Fragment key={idx}>
          <div
            ref={el => addRef(childRefs, el)}
            className={'__dbk__child-wrapper ' + (idx < classes.length ? classes[idx] : '')}
          >{c}
          </div>
          
          {/* Gutter is between each two child views. */}
          {idx < children.length - 1 &&
            <Gutter
              ref={el => addRef(gutterRefs, el)}
              className={gutterClassName}
              theme={gutterTheme}
              draggerClassName={draggerClassName}
              direction={direction}
              onMouseDown={e => handleGutterMouseDown(idx, e)}
              onFocus={e => handleGutterFocus(idx, e)}
              onBlur={e => handleGutterBlur(e)}
            />
          }
        </React.Fragment>
      ))}
    </div>
  );
}

export default Split;
