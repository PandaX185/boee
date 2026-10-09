import { compareVersions, isNewerVersion, parseVersionTag } from '@/core/version';

describe('parseVersionTag', () => {
  it('parses release tags with prefixes', () => {
    expect(parseVersionTag('boee-v1.2.1')).toEqual([1, 2, 1]);
    expect(parseVersionTag('v1.2.1')).toEqual([1, 2, 1]);
    expect(parseVersionTag('1.2.1')).toEqual([1, 2, 1]);
    expect(parseVersionTag('  boee-v10.0.3  ')).toEqual([10, 0, 3]);
  });

  it('rejects non-semver tags', () => {
    expect(parseVersionTag('latest')).toBeNull();
    expect(parseVersionTag('boee-v1.2')).toBeNull();
    expect(parseVersionTag('')).toBeNull();
  });
});

describe('compareVersions', () => {
  it('orders by major, minor, then patch', () => {
    expect(compareVersions([2, 0, 0], [1, 9, 9])).toBeGreaterThan(0);
    expect(compareVersions([1, 3, 0], [1, 2, 9])).toBeGreaterThan(0);
    expect(compareVersions([1, 2, 3], [1, 2, 4])).toBeLessThan(0);
    expect(compareVersions([1, 2, 3], [1, 2, 3])).toBe(0);
  });
});

describe('isNewerVersion', () => {
  it('detects newer releases', () => {
    expect(isNewerVersion('boee-v1.2.1', '1.2.0')).toBe(true);
    expect(isNewerVersion('boee-v1.2.1', '1.2.1')).toBe(false);
    expect(isNewerVersion('boee-v1.2.0', '1.2.1')).toBe(false);
  });

  it('is conservative with unparseable tags', () => {
    expect(isNewerVersion('latest', '1.2.1')).toBe(false);
    expect(isNewerVersion('boee-v1.2.1', 'dev')).toBe(false);
  });
});
