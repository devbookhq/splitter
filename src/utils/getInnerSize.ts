import { SplitDirection } from 'Split';

export default function getInnerSize(direction: SplitDirection, element: HTMLElement) {
  // Returns undefined if parent element has no layout yet.

  const computedStyle = getComputedStyle(element);
  if (!computedStyle) return;

  // TODO: Must be 'clientHeight' for a vertical split.
  let size = direction === SplitDirection.Horizontal ? element.clientWidth : element.clientHeight;

  if (size === 0) return;

  // TODO: Must subtract 'paddingTop' and 'paddingBottom' for a vertical split.
  if (direction === SplitDirection.Horizontal) {
    size -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  } else {
    size -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  }

  return size;
}
