import type { Constants, DerivedMetrics, Inputs } from '@/domain/types';

const SECONDS_PER_DAY = 86_400;
const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = 30.4375;

export function estimate(inputs: Inputs, constants: Constants): DerivedMetrics {
  const { traffic, dataShape, nonFunctional } = inputs;

  const opsPerDay = traffic.dailyActiveUsers * traffic.actionsPerUserPerDay;
  const writeFraction = 1 / (1 + traffic.readWriteRatio);
  const readFraction = traffic.readWriteRatio / (1 + traffic.readWriteRatio);

  const writeOpsPerDay = opsPerDay * writeFraction;
  const readOpsPerDay = opsPerDay * readFraction;

  const avgWriteQps = writeOpsPerDay / SECONDS_PER_DAY;
  const avgReadQps = readOpsPerDay / SECONDS_PER_DAY;
  const peakWriteQps = avgWriteQps * traffic.peakMultiplier;
  const peakReadQps = avgReadQps * traffic.peakMultiplier;

  const objectsWrittenPerDay = writeOpsPerDay * dataShape.objectsWrittenPerAction;
  const objectsReadPerDay = readOpsPerDay * dataShape.objectsReadPerAction;

  const storagePerDayBytes =
    objectsWrittenPerDay * dataShape.objectSizeBytes * dataShape.replicationFactor;
  const storagePerYearBytes = storagePerDayBytes * DAYS_PER_YEAR;
  const totalStorageBytes = storagePerDayBytes * dataShape.retentionDays;

  const ingressBytesPerSecond =
    (objectsWrittenPerDay * dataShape.objectSizeBytes * traffic.peakMultiplier) / SECONDS_PER_DAY;
  const egressBytesPerSecond =
    (objectsReadPerDay * dataShape.objectSizeBytes * traffic.peakMultiplier) / SECONDS_PER_DAY;

  const cacheHotSetBytes =
    objectsReadPerDay * dataShape.objectSizeBytes * constants.hotWorkingSetFraction;

  const peakQps = peakReadQps + peakWriteQps;
  const serverCount = Math.max(1, Math.ceil(peakQps / constants.infrastructure.serverQpsCapacity));

  const allowedDowntimeSecondsPerYear =
    (1 - nonFunctional.availabilityTarget) * DAYS_PER_YEAR * SECONDS_PER_DAY;

  const growth = nonFunctional.monthlyGrowthRate;
  const growthFactor6 = (1 + growth) ** 6;
  const growthFactor12 = (1 + growth) ** 12;

  const projectedDailyActiveUsers6mo = traffic.dailyActiveUsers * growthFactor6;
  const projectedDailyActiveUsers12mo = traffic.dailyActiveUsers * growthFactor12;

  const monthlyStorageBytes = storagePerDayBytes * DAYS_PER_MONTH;
  let projectedStorage12moBytes = 0;
  for (let month = 1; month <= 12; month += 1) {
    const monthStartAgeDays = (12 - month) * DAYS_PER_MONTH;
    const retainedFraction = Math.min(
      Math.max((dataShape.retentionDays - monthStartAgeDays) / DAYS_PER_MONTH, 0),
      1,
    );
    projectedStorage12moBytes +=
      monthlyStorageBytes * (1 + growth) ** (month - 1) * retainedFraction;
  }

  return {
    avgWriteQps,
    avgReadQps,
    peakWriteQps,
    peakReadQps,
    storagePerDayBytes,
    storagePerYearBytes,
    totalStorageBytes,
    ingressBytesPerSecond,
    egressBytesPerSecond,
    cacheHotSetBytes,
    serverCount,
    allowedDowntimeSecondsPerYear,
    projectedDailyActiveUsers6mo,
    projectedDailyActiveUsers12mo,
    projectedStorage12moBytes,
  };
}
