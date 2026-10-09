import { useWindowDimensions } from 'react-native';

import { type Breakpoint, getBreakpoint } from '@/core/layout';

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  return getBreakpoint(width);
}
