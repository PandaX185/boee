import { createId } from '@/core/id';
import { PRESETS } from '@/core/presets';
import { cloneInputs, createScenario } from '@/core/scenarios';

describe('createId', () => {
  it('returns unique non-empty strings', () => {
    const first = createId();
    const second = createId();
    expect(typeof first).toBe('string');
    expect(first.length).toBeGreaterThan(0);
    expect(first).not.toBe(second);
  });
});

describe('cloneInputs', () => {
  it('deep-copies inputs', () => {
    const original = PRESETS[0].inputs;
    const copy = cloneInputs(original);
    expect(copy).toEqual(original);
    expect(copy).not.toBe(original);
    expect(copy.traffic).not.toBe(original.traffic);
    copy.traffic.dailyActiveUsers = 1;
    expect(original.traffic.dailyActiveUsers).not.toBe(1);
  });
});

describe('createScenario', () => {
  it('builds a scenario with cloned inputs and timestamps', () => {
    const inputs = PRESETS[0].inputs;
    const scenario = createScenario('Test', inputs);
    expect(scenario.name).toBe('Test');
    expect(typeof scenario.id).toBe('string');
    expect(scenario.createdAt).toBe(scenario.updatedAt);
    expect(scenario.inputs).toEqual(inputs);
    expect(scenario.inputs).not.toBe(inputs);
  });
});
