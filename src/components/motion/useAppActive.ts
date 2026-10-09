import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useAppActive(): boolean {
  const [active, setActive] = useState(() => AppState.currentState !== 'background');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      setActive(status === 'active');
    });
    return () => subscription.remove();
  }, []);

  return active;
}
