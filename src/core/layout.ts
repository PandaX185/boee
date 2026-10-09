export type Breakpoint = 'compact' | 'regular' | 'wide';

export function getBreakpoint(width: number): Breakpoint {
  if (width < 380) {
    return 'compact';
  }
  if (width < 768) {
    return 'regular';
  }
  return 'wide';
}
