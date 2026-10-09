import { getBootStatus } from '@/core/boot';

describe('getBootStatus', () => {
  it('is ready when both stores hydrated', () => {
    expect(getBootStatus(true, true, false)).toBe('ready');
    expect(getBootStatus(true, true, true)).toBe('ready');
  });

  it('is loading before the timeout', () => {
    expect(getBootStatus(false, true, false)).toBe('loading');
    expect(getBootStatus(true, false, false)).toBe('loading');
    expect(getBootStatus(false, false, false)).toBe('loading');
  });

  it('fails after the timeout without full hydration', () => {
    expect(getBootStatus(false, true, true)).toBe('failed');
    expect(getBootStatus(false, false, true)).toBe('failed');
  });
});
