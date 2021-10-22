import { SplitDirection } from '../index';
import { Action, ActionType } from './reducer.actions';
import Pair from '../pair';

import getInnerSize from '../utils/getInnerSize';
import getGutterSizes from '../utils/getGutterSize';

export interface State {
  isReady: boolean;

  isDragging: boolean;
  draggingIdx?: number; // Index of a gutter that is being dragged.

  pairs: Pair[];
}

export default function reducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.SetIsReadyToCompute: {
      return {
        ...state,
        isReady: action.payload.isReady,
      }
    }
    // -----------------------------------------------------------------------
    // |     i=0     |         i=1         |        i=2       |      i=3     |
    // |             |                     |                  |              |
    // |           pair 0                pair 1             pair 2           |
    // |             |                     |                  |              |
    // -----------------------------------------------------------------------
    case ActionType.CreatePairs: {
      const { direction, children, gutters } = action.payload;

      // All children must have common parent.
      const parent = children[0].parentNode;
      if (!parent) throw new Error(`Cannot create pairs - parent is undefined.`);
      const parentSize = getInnerSize(direction, parent as HTMLElement);
      if (parentSize === undefined) throw new Error(`Cannot create pairs - parent has undefined or zero size: ${parentSize}.`);

      const pairs: Pair[] = [];
      children.forEach((_, idx) => {
        if (idx > 0) {
          const a = children[idx-1];
          const b = children[idx];
          const gutter = gutters[idx-1];

          const start = direction === SplitDirection.Horizontal
            ? a.getBoundingClientRect().left
            : a.getBoundingClientRect().top;

          const end = direction === SplitDirection.Horizontal
            ? b.getBoundingClientRect().right
            : b.getBoundingClientRect().bottom;

          const size = direction === SplitDirection.Horizontal
            ? a.getBoundingClientRect().width + gutter.getBoundingClientRect().width + b.getBoundingClientRect().width
            : a.getBoundingClientRect().height + gutter.getBoundingClientRect().height + b.getBoundingClientRect().height

          const gutterSize = direction === SplitDirection.Horizontal
            ? gutter.getBoundingClientRect().width
            : gutter.getBoundingClientRect().height;

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
            gutterSize,
            // At the start, all elements has the same width.
            aSizePct: 100 / children.length,
            bSizePct: 100 / children.length,
          };

          pairs.push(pair);
        }
      });

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
    // Recalculates the stored sizes based on the actual elements' sizes.
    case ActionType.CalculateSizes: {
      // We need to calculate sizes only for the pair
      // that has the moved gutter.
      const { direction, gutterIdx } = action.payload;
      const pair = state.pairs[gutterIdx];

      const parentSize = getInnerSize(direction, pair.parent);
      if (!parentSize) throw new Error(`Cannot calculate sizes - 'pair.parent' has undefined or zero size.`);

      const gutterSize = pair.gutter[direction === SplitDirection.Horizontal ? 'clientWidth' : 'clientHeight'];

      const isFirst = gutterIdx === 0;
      const isLast = gutterIdx === state.pairs.length - 1;
      const { aGutterSize, bGutterSize } = getGutterSizes(gutterSize, isFirst, isLast);

      let start: number;
      let end: number;
      let size: number;
      let aSizePct: number;
      let bSizePct: number;

      if (direction === SplitDirection.Horizontal) {
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
        gutterSize,
      };

      return {
        ...state
      };
    }
    default:
      return state;
  }
}

