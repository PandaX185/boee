import { getBreakpoint } from '@/core/layout';

describe('getBreakpoint', () => {
  it('classifies compact phones', () => {
    expect(getBreakpoint(320)).toBe('compact');
    expect(getBreakpoint(379)).toBe('compact');
  });

  it('classifies regular phones', () => {
    expect(getBreakpoint(380)).toBe('regular');
    expect(getBreakpoint(767)).toBe('regular');
  });

  it('classifies tablets and desktop as wide', () => {
    expect(getBreakpoint(768)).toBe('wide');
    expect(getBreakpoint(1280)).toBe('wide');
  });
});
