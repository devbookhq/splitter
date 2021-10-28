import React from 'react';
import { SplitDirection, GutterTheme } from './index';

interface GutterProps {
  className?: string;
  theme?: GutterTheme;
  draggerClassName?: string;
  direction?: SplitDirection;
  onMouseDown?: (e: any) => void;
  onFocus?: (e: any) => void;
}

const Gutter = React.forwardRef<HTMLDivElement, GutterProps>((
  {
    className,
    theme = GutterTheme.Dark,
    draggerClassName,
    direction = SplitDirection.Vertical,
    onMouseDown,
    onFocus,
  },
  ref,
) => {
  const containerClass = `__dbk__gutter ${direction} ${theme} ${className || ''}`;
  const draggerClass = `__dbk__dragger ${direction} ${theme} ${draggerClassName || ''}`;

  return (    
    <div      
      className={containerClass}
      ref={ref}
      dir={direction}
      onMouseDown={onMouseDown}
    >
      <div 
        tabIndex={0}
        onFocus={onFocus}
        onBlur={() => console.log('BLUR')}
        className={draggerClass}
      />
    </div>
  );
});

export default Gutter;

