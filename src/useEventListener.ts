import { useEffect } from 'react';

function useEventListener(event: string, handler: (event: any) => void, deps: any[] = [], condition = true) {
  useEffect(() => {
    if (condition) {
      window.addEventListener(event, handler);
    }
    return () => {
      if (condition) {
        window.removeEventListener(event, handler)
      }
    };

// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, handler, condition, ...deps]);
}

export default useEventListener;
