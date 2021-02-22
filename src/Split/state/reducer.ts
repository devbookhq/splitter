import { Action, ActionType } from './reducer.actions';
import Pair from 'Split/pair';

import getInnerSize from 'utils/getInnerSize';
import getGutterSizes from 'utils/getGutterSize';

export interface State {
  isDragging: boolean;
  draggingIdx?: number; // Index of a gutter that is being dragged.
  gutterSize: number;

  pairs: Pair[];
}

export default function reducer(state: State, action: Action) {
  switch (action.type) {
    // -----------------------------------------------------------------------
    // |     i=0     |         i=1         |        i=2       |      i=3     |
    // |             |                     |                  |              |
    // |           pair 0                pair 1             pair 2           |
    // |             |                     |                  |              |
    // -----------------------------------------------------------------------
    case ActionType.CreatePairs: {
      const { children, gutters } = action.payload;

      // All children must have common parent.
      const parent = children[0].parentNode;
      if (!parent) throw new Error(`Cannot create pairs - parent is undefined.`);
      const parentSize = getInnerSize(parent as HTMLElement);
      if (parentSize === undefined) throw new Error(`Cannot create pairs - parent has undefined or zero size: ${parentSize}.`);

      const pairs: Pair[] = [];
      children.forEach((_, idx) => {
        if (idx > 0) {
          const a = children[idx-1];
          const b = children[idx];
          const gutter = gutters[idx-1];

          const size = a.getBoundingClientRect().width + gutter.getBoundingClientRect().width + b.getBoundingClientRect().width;

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
    case ActionType.CalculateSizes: {
      // We need to calculate sizes only for the pair
      // that has the moved gutter.
      const { gutterIdx } = action.payload;
      const pair = state.pairs[gutterIdx];

      const parentSize = getInnerSize(pair.parent);
      if (!parentSize) throw new Error(`Cannot calculate sizes - parent has undefined or zero size: ${parentSize}.`);

      const isFirst = gutterIdx === 0;
      const isLast = gutterIdx === state.pairs.length - 1;
      const { aGutterSize, bGutterSize } = getGutterSizes(state.gutterSize, isFirst, isLast);

      // TODO: Must be 'height' for a vertical split.
      const aSizePct = ((pair.a.getBoundingClientRect().width + aGutterSize) / parentSize) * 100;
      const bSizePct = ((pair.b.getBoundingClientRect().width + bGutterSize) / parentSize) * 100;

      // TODO: Must be 'height' for a vertical split.
      const size =
        pair.a.getBoundingClientRect().width +
        aGutterSize +
        bGutterSize +
        pair.b.getBoundingClientRect().width;

      state.pairs[gutterIdx] = {
        ...pair,

        start: pair.a.getBoundingClientRect().left,
        // TODO: Must be 'bottom' for a vertical split.
        end: pair.b.getBoundingClientRect().right,
        size,
        aSizePct,
        bSizePct,
      };

      return {
        ...state
      };
    }
    default:
      return state;
  }
}

