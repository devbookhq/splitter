import React from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import { SplitDirection, GutterTheme, isTouchDevice } from './index';

interface GutterProps {
  className?: string;
  theme: GutterTheme;
  draggerClassName?: string;
  direction?: SplitDirection;
  onDragging?: (e: MouseEvent | TouchEvent) => void;
}

const Gutter = React.forwardRef<HTMLDivElement, GutterProps>((
  {
    className,
    theme,
    draggerClassName,
    direction = SplitDirection.Vertical,
    onDragging,
  },
  ref,
) => {
  const containerClass = `__dbk__gutter ${direction} ${className || theme}`;
  const draggerClass = `__dbk__dragger ${direction} ${draggerClassName || theme}`;

  return (
    <div
      className={containerClass}
      ref={ref}
      dir={direction}
      onMouseDown={onDragging}
      onTouchStart={isTouchDevice ? onDragging : undefined}
    >
      <div className={draggerClass}/>
    </div>
  );
});

export default Gutter;

