import type { Inputs } from '@/domain/types';

export interface Preset {
  id: string;
  name: string;
  inputs: Inputs;
}

export const PRESETS: Preset[] = [
  {
    id: 'blank',
    name: 'Blank',
    inputs: {
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
        availabilityTarget: 0.999,
        monthlyGrowthRate: 0.05,
      },
    },
  },
  {
    id: 'twitter-like',
    name: 'Twitter-like feed',
    inputs: {
      traffic: {
        dailyActiveUsers: 200_000_000,
        actionsPerUserPerDay: 20,
        readWriteRatio: 100,
        peakMultiplier: 3,
      },
      dataShape: {
        objectSizeBytes: 512,
        objectsWrittenPerAction: 1,
        objectsReadPerAction: 10,
        retentionDays: 3650,
        replicationFactor: 3,
      },
      nonFunctional: {
        availabilityTarget: 0.999,
        monthlyGrowthRate: 0.03,
      },
    },
  },
  {
    id: 'chat',
    name: 'Chat / messaging',
    inputs: {
      traffic: {
        dailyActiveUsers: 50_000_000,
        actionsPerUserPerDay: 100,
        readWriteRatio: 20,
        peakMultiplier: 4,
      },
      dataShape: {
        objectSizeBytes: 256,
        objectsWrittenPerAction: 1,
        objectsReadPerAction: 5,
        retentionDays: 3650,
        replicationFactor: 3,
      },
      nonFunctional: {
        availabilityTarget: 0.9999,
        monthlyGrowthRate: 0.02,
      },
    },
  },
  {
    id: 'url-shortener',
    name: 'URL shortener',
    inputs: {
      traffic: {
        dailyActiveUsers: 10_000_000,
        actionsPerUserPerDay: 5,
        readWriteRatio: 1000,
        peakMultiplier: 5,
      },
      dataShape: {
        objectSizeBytes: 128,
        objectsWrittenPerAction: 1,
        objectsReadPerAction: 1,
        retentionDays: 1825,
        replicationFactor: 2,
      },
      nonFunctional: {
        availabilityTarget: 0.999,
        monthlyGrowthRate: 0.02,
      },
    },
  },
  {
    id: 'video-streaming',
    name: 'Video streaming',
    inputs: {
      traffic: {
        dailyActiveUsers: 100_000_000,
        actionsPerUserPerDay: 5,
        readWriteRatio: 500,
        peakMultiplier: 2,
      },
      dataShape: {
        objectSizeBytes: 524_288_000,
        objectsWrittenPerAction: 1,
        objectsReadPerAction: 1,
        retentionDays: 365,
        replicationFactor: 2,
      },
      nonFunctional: {
        availabilityTarget: 0.999,
        monthlyGrowthRate: 0.04,
      },
    },
  },
];
