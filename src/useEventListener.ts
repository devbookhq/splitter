import { useEffect } from 'react';

function useEventListener(event: string, handler: (event: any) => void, deps: any[] = []) {
  useEffect(() => {
    window.addEventListener(event, handler);
    return () => window.removeEventListener(event, handler);
  }, [event, handler, ...deps]);
}

export default useEventListener;
