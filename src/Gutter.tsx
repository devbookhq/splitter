import React from 'react';
import { SplitDirection, GutterTheme } from './index';

interface GutterProps {
  className?: string;
  theme: GutterTheme;
  draggerClassName?: string;
  direction?: SplitDirection;
  onMouseDown?: (e: any) => void;
}

const Gutter = React.forwardRef<HTMLDivElement, GutterProps>((
  {
    className,
    theme,
    draggerClassName,
    direction = SplitDirection.Vertical,
    onMouseDown,
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
      onMouseDown={onMouseDown}
    >
      <div className={draggerClass}/>
    </div>
  );
});

export default Gutter;

