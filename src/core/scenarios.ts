import { createId } from '@/core/id';
import type { Inputs, Scenario } from '@/domain/types';

export function cloneInputs(inputs: Inputs): Inputs {
  return JSON.parse(JSON.stringify(inputs)) as Inputs;
}

export function createScenario(name: string, inputs: Inputs): Scenario {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name,
    createdAt: now,
    updatedAt: now,
    inputs: cloneInputs(inputs),
  };
}
