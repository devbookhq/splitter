export default function getInnerSize(element: HTMLElement) {
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
