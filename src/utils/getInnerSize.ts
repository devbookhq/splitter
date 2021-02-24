import { SplitDirection } from '../index';

export default function getInnerSize(direction: SplitDirection, element: HTMLElement) {
  // Returns undefined if parent element has no layout yet.
  // Or if the parent has no size.

  const computedStyle = getComputedStyle(element);
  if (!computedStyle) return;

  let size = direction === SplitDirection.Horizontal ? element.clientWidth : element.clientHeight;

  if (size === 0) return;

  if (direction === SplitDirection.Horizontal) {
    size -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
  } else {
    size -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
  }

  return size;
}
