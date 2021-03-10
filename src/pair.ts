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
export default interface Pair {
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
  gutterSize?: number;

  // Size relative to the size of the pair.
  aSizePct: number;
  bSizePct: number;
}
