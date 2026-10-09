import { z } from 'zod';

export const trafficInputsSchema = z.object({
  dailyActiveUsers: z.number().positive(),
  actionsPerUserPerDay: z.number().positive(),
  readWriteRatio: z.number().nonnegative(),
  peakMultiplier: z.number().min(1),
});

export const dataShapeInputsSchema = z.object({
  objectSizeBytes: z.number().positive(),
  objectsWrittenPerAction: z.number().nonnegative(),
  objectsReadPerAction: z.number().nonnegative(),
  retentionDays: z.number().positive(),
  replicationFactor: z.number().min(1),
});

export const nonFunctionalInputsSchema = z.object({
  availabilityTarget: z.number().gt(0).max(1),
  monthlyGrowthRate: z.number().min(0),
});

export const inputsSchema = z.object({
  traffic: trafficInputsSchema,
  dataShape: dataShapeInputsSchema,
  nonFunctional: nonFunctionalInputsSchema,
});

export const scenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  inputs: inputsSchema,
});
