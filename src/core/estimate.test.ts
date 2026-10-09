import { DEFAULT_CONSTANTS } from '@/core/constants';
import { estimate } from '@/core/estimate';
import type { Inputs } from '@/domain/types';

const inputs: Inputs = {
  traffic: {
    dailyActiveUsers: 1000,
    actionsPerUserPerDay: 10,
    readWriteRatio: 9,
    peakMultiplier: 2,
  },
  dataShape: {
    objectSizeBytes: 1024,
    objectsWrittenPerAction: 1,
    objectsReadPerAction: 1,
    retentionDays: 365,
    replicationFactor: 3,
  },
  nonFunctional: {
    availabilityTarget: 0.999,
    monthlyGrowthRate: 0,
  },
};

describe('estimate', () => {
  const derived = estimate(inputs, DEFAULT_CONSTANTS);

  it('splits traffic by the read:write ratio', () => {
    expect(derived.avgWriteQps).toBeCloseTo(1000 / 86_400, 6);
    expect(derived.avgReadQps).toBeCloseTo(9000 / 86_400, 6);
  });

  it('applies the peak multiplier to both paths', () => {
    expect(derived.peakWriteQps).toBeCloseTo((1000 / 86_400) * 2, 6);
    expect(derived.peakReadQps).toBeCloseTo((9000 / 86_400) * 2, 6);
  });

  it('scales storage by object size, replication, and retention', () => {
    expect(derived.storagePerDayBytes).toBeCloseTo(3_072_000, 0);
    expect(derived.totalStorageBytes).toBeCloseTo(3_072_000 * 365, 0);
  });

  it('derives allowed downtime from the availability target', () => {
    expect(derived.allowedDowntimeSecondsPerYear).toBeCloseTo(0.001 * 365 * 86_400, 3);
  });

  it('never reports zero servers', () => {
    expect(derived.serverCount).toBeGreaterThanOrEqual(1);
  });
});
