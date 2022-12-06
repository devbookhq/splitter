import { useEffect } from 'react';

interface UseAddEventListenerOptions extends AddEventListenerOptions {
  condition: boolean;
}

function useEventListener(event: string, handler: (event: any) => void, deps: any[] = [], useAddEventListenerOptions: UseAddEventListenerOptions = { condition: true }) {
  const { condition, ...addEventListenerOptions } = useAddEventListenerOptions
  useEffect(() => {
    if (condition) {
      window.addEventListener(event, handler, addEventListenerOptions);
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
