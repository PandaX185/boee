import { DEFAULT_CONSTANTS } from '@/core/constants';
import { estimate } from '@/core/estimate';
import { deriveImplications } from '@/core/rules';
import type { Inputs } from '@/domain/types';

const heavy: Inputs = {
  traffic: {
    dailyActiveUsers: 50_000_000,
    actionsPerUserPerDay: 100,
    readWriteRatio: 1,
    peakMultiplier: 4,
  },
  dataShape: {
    objectSizeBytes: 4096,
    objectsWrittenPerAction: 1,
    objectsReadPerAction: 1,
    retentionDays: 1825,
    replicationFactor: 3,
  },
  nonFunctional: {
    availabilityTarget: 0.9999,
    monthlyGrowthRate: 0.05,
  },
};

describe('deriveImplications', () => {
  const derived = estimate(heavy, DEFAULT_CONSTANTS);
  const implications = deriveImplications({
    inputs: heavy,
    derived,
    constants: DEFAULT_CONSTANTS,
  });
  const ids = implications.map((item) => item.id);

  it('flags storage, read scale, write scale, and redundancy at high load', () => {
    expect(ids).toContain('storage-exceeds-memory');
    expect(ids).toContain('read-scale');
    expect(ids).toContain('write-scale');
    expect(ids).toContain('availability-redundancy');
  });

  it('flags storage tiering and growth at long retention', () => {
    expect(ids).toContain('retention-tiering');
    expect(ids).toContain('growth-outlook');
  });

  it('cites a trigger for every implication', () => {
    expect(implications.length).toBeGreaterThan(0);
    expect(implications.every((item) => item.trigger.length > 0)).toBe(true);
  });
});
