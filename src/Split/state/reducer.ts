import { SplitDirection } from 'Split';
import { Action, ActionType } from './reducer.actions';
import Pair from 'Split/pair';

import getInnerSize from 'utils/getInnerSize';
import getGutterSizes from 'utils/getGutterSize';

export interface State {
  direction: SplitDirection;
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
      const parentSize = getInnerSize(state.direction, parent as HTMLElement);
      if (parentSize === undefined) throw new Error(`Cannot create pairs - parent has undefined or zero size: ${parentSize}.`);

      const pairs: Pair[] = [];
      children.forEach((_, idx) => {
        if (idx > 0) {
          const a = children[idx-1];
          const b = children[idx];
          const gutter = gutters[idx-1];

          const start = state.direction === SplitDirection.Horizontal
            ? a.getBoundingClientRect().left
            : a.getBoundingClientRect().top;

          const end = state.direction === SplitDirection.Horizontal
            ? b.getBoundingClientRect().right
            : b.getBoundingClientRect().bottom;

          const size = state.direction === SplitDirection.Horizontal
            ? a.getBoundingClientRect().width + gutter.getBoundingClientRect().width + b.getBoundingClientRect().width
            : a.getBoundingClientRect().height + gutter.getBoundingClientRect().height + b.getBoundingClientRect().height

          const pair: Pair = {
            idx: idx-1,
            // TODO: Do we need to have a reference to the whole elements? Aren't indexes enough?
            a,
            b,
            gutter,
            parent: parent as HTMLElement,
            start,
            end,
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

      const parentSize = getInnerSize(state.direction, pair.parent);
      if (!parentSize) throw new Error(`Cannot calculate sizes - parent has undefined or zero size: ${parentSize}.`);

      const isFirst = gutterIdx === 0;
      const isLast = gutterIdx === state.pairs.length - 1;
      const { aGutterSize, bGutterSize } = getGutterSizes(state.gutterSize, isFirst, isLast);

      let start: number;
      let end;
      let size: number;
      let aSizePct: number;
      let bSizePct: number;

      if (state.direction === SplitDirection.Horizontal) {
        start = pair.a.getBoundingClientRect().left;

        end = pair.b.getBoundingClientRect().right;

        aSizePct = ((pair.a.getBoundingClientRect().width + aGutterSize) / parentSize) * 100;
        bSizePct = ((pair.b.getBoundingClientRect().width + bGutterSize) / parentSize) * 100;

        size =
          pair.a.getBoundingClientRect().width +
          aGutterSize +
          bGutterSize +
          pair.b.getBoundingClientRect().width;
      } else {
        start = pair.a.getBoundingClientRect().top;

        end = pair.b.getBoundingClientRect().bottom;

        aSizePct = ((pair.a.getBoundingClientRect().height + aGutterSize) / parentSize) * 100;
        bSizePct = ((pair.b.getBoundingClientRect().height + bGutterSize) / parentSize) * 100;

        size =
          pair.a.getBoundingClientRect().height +
          aGutterSize +
          bGutterSize +
          pair.b.getBoundingClientRect().height;
      }

      state.pairs[gutterIdx] = {
        ...pair,
        start,
        end,
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

