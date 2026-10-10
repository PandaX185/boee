import { DEFAULT_CONSTANTS } from '@/core/constants';
import { estimate } from '@/core/estimate';
import { deriveImplications } from '@/core/rules';
import type { Inputs } from '@/domain/types';

const REPRO: Inputs = {
  traffic: {
    dailyActiveUsers: 100_000,
    actionsPerUserPerDay: 10,
    readWriteRatio: 9,
    peakMultiplier: 3,
  },
  dataShape: {
    objectSizeBytes: 1024,
    objectsWrittenPerAction: 1,
    objectsReadPerAction: 1,
    retentionDays: 365,
    replicationFactor: 3,
  },
  nonFunctional: {
    availabilityTarget: 0.99999,
    monthlyGrowthRate: 0.05,
  },
};

describe('repro fixture: 100K DAU, 9:1 reads, 3x peak, 1KB objects', () => {
  const derived = estimate(REPRO, DEFAULT_CONSTANTS);

  it('splits 1M daily ops 90/10 into QPS', () => {
    expect(derived.avgReadQps).toBeCloseTo(900_000 / 86_400, 6);
    expect(derived.avgWriteQps).toBeCloseTo(100_000 / 86_400, 6);
    expect(derived.peakReadQps).toBeCloseTo((900_000 / 86_400) * 3, 6);
    expect(derived.peakWriteQps).toBeCloseTo((100_000 / 86_400) * 3, 6);
  });

  it('accounts replicated storage exactly once', () => {
    expect(derived.storagePerDayBytes).toBe(307_200_000);
    expect(derived.storagePerYearBytes).toBe(307_200_000 * 365);
    expect(derived.totalStorageBytes).toBe(307_200_000 * 365);
  });

  it('derives peak network traffic from objects per action', () => {
    expect(derived.ingressBytesPerSecond).toBeCloseTo((100_000 * 1024 * 3) / 86_400, 6);
    expect(derived.egressBytesPerSecond).toBe((900_000 * 1024 * 3) / 86_400);
  });

  it('estimates the hot set from daily read volume', () => {
    expect(derived.cacheHotSetBytes).toBe(900_000 * 1024 * 0.2);
  });

  it('allows 315.36 seconds of yearly downtime at 99.999%', () => {
    expect(derived.allowedDowntimeSecondsPerYear).toBeCloseTo(315.36, 2);
  });

  it('compounds DAU growth monthly', () => {
    expect(derived.projectedDailyActiveUsers6mo).toBeCloseTo(100_000 * 1.05 ** 6, 3);
    expect(derived.projectedDailyActiveUsers12mo).toBeCloseTo(100_000 * 1.05 ** 12, 3);
  });

  it('accumulates twelve growing months of retained storage', () => {
    expect(derived.projectedStorage12moBytes).toBeCloseTo(148_754_699_816.75, 0);
  });

  it('sizes one server and flags memory, redundancy, and growth', () => {
    expect(derived.serverCount).toBe(1);
    const ids = deriveImplications({
      inputs: REPRO,
      derived,
      constants: DEFAULT_CONSTANTS,
    }).map((item) => item.id);
    expect(ids).toContain('storage-exceeds-memory');
    expect(ids).toContain('availability-redundancy');
    expect(ids).toContain('growth-outlook');
    expect(ids).not.toContain('read-scale');
    expect(ids).not.toContain('write-scale');
    expect(ids).not.toContain('network-ingress');
    expect(ids).not.toContain('network-egress');
    expect(ids).not.toContain('cache-hot-set');
    expect(ids).not.toContain('retention-tiering');
  });
});

describe('ratio edges', () => {
  it('treats a 1:1 ratio as an even split', () => {
    const derived = estimate(
      { ...REPRO, traffic: { ...REPRO.traffic, readWriteRatio: 1 } },
      DEFAULT_CONSTANTS,
    );
    expect(derived.avgReadQps).toBeCloseTo(derived.avgWriteQps, 9);
  });

  it('treats a zero ratio as all writes', () => {
    const derived = estimate(
      { ...REPRO, traffic: { ...REPRO.traffic, readWriteRatio: 0 } },
      DEFAULT_CONSTANTS,
    );
    expect(derived.avgWriteQps).toBeCloseTo(1_000_000 / 86_400, 6);
    expect(derived.avgReadQps).toBe(0);
  });
});

describe('replication and retention edges', () => {
  it('reports logical storage with a replication factor of 1', () => {
    const derived = estimate(
      { ...REPRO, dataShape: { ...REPRO.dataShape, replicationFactor: 1 } },
      DEFAULT_CONSTANTS,
    );
    expect(derived.storagePerDayBytes).toBe(102_400_000);
  });

  it('caps accumulation at a short retention window', () => {
    const derived = estimate(
      { ...REPRO, dataShape: { ...REPRO.dataShape, retentionDays: 30 } },
      DEFAULT_CONSTANTS,
    );
    expect(derived.totalStorageBytes).toBe(307_200_000 * 30);
    expect(derived.projectedStorage12moBytes).toBeCloseTo(15_762_487_524.4, 1);
    expect(derived.projectedStorage12moBytes).toBeLessThan(derived.storagePerYearBytes);
  });

  it('matches annual storage with zero growth and full retention', () => {
    const derived = estimate(
      { ...REPRO, nonFunctional: { ...REPRO.nonFunctional, monthlyGrowthRate: 0 } },
      DEFAULT_CONSTANTS,
    );
    expect(derived.projectedDailyActiveUsers12mo).toBe(100_000);
    expect(derived.projectedStorage12moBytes).toBe(derived.storagePerYearBytes);
  });
});
