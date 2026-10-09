import { formatBytes, formatCount, formatDuration, formatPercent, formatQps } from '@/core/format';

describe('formatBytes', () => {
  it('formats zero and invalid values as 0 B', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(-5)).toBe('0 B');
    expect(formatBytes(NaN)).toBe('0 B');
    expect(formatBytes(Infinity)).toBe('0 B');
  });

  it('formats plain bytes without decimals', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes with one decimal', () => {
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('drops decimals for values of 100 or more', () => {
    expect(formatBytes(500 * 1024 ** 3)).toBe('500 GB');
  });
});

describe('formatCount', () => {
  it('formats invalid values as 0', () => {
    expect(formatCount(NaN)).toBe('0');
  });

  it('uses K, M, and B suffixes', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(1500)).toBe('1.5K');
    expect(formatCount(2_500_000)).toBe('2.5M');
    expect(formatCount(3_000_000_000)).toBe('3.0B');
  });
});

describe('formatQps', () => {
  it('formats invalid values as 0 QPS', () => {
    expect(formatQps(NaN)).toBe('0 QPS');
  });

  it('uses one decimal below 10 QPS', () => {
    expect(formatQps(5)).toBe('5.0 QPS');
  });

  it('formats whole values below 1000 QPS', () => {
    expect(formatQps(500)).toBe('500 QPS');
  });

  it('uses K above 1000 QPS', () => {
    expect(formatQps(1500)).toBe('1.5K QPS');
  });
});

describe('formatPercent', () => {
  it('keeps one decimal below 10%', () => {
    expect(formatPercent(0.05)).toBe('5.0%');
  });

  it('drops decimals at 10% and above', () => {
    expect(formatPercent(0.5)).toBe('50%');
  });
});

describe('formatDuration', () => {
  it('formats zero and invalid values as 0s', () => {
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(-1)).toBe('0s');
    expect(formatDuration(NaN)).toBe('0s');
  });

  it('picks seconds, minutes, hours, and days', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(90)).toBe('1.5 minutes');
    expect(formatDuration(7200)).toBe('2.0 hours');
    expect(formatDuration(172_800)).toBe('2.0 days');
  });
});
