import type { MouseEvent, TouchEvent } from 'react';

export const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
  return 'changedTouches' in e
}
