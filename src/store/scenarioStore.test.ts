import { PRESETS } from '@/core/presets';
import { createScenario } from '@/core/scenarios';
import type { Scenario } from '@/domain/types';
import { useScenarioStore } from '@/store/scenarioStore';

function seed(name = 'Seed'): Scenario {
  const scenario = createScenario(name, PRESETS[0].inputs);
  useScenarioStore.getState().addScenario(scenario);
  return scenario;
}

beforeEach(() => {
  useScenarioStore.setState({ scenarios: [] });
});

describe('scenarioStore', () => {
  it('adds scenarios', () => {
    const scenario = createScenario('First', PRESETS[0].inputs);
    useScenarioStore.getState().addScenario(scenario);
    expect(useScenarioStore.getState().scenarios).toEqual([scenario]);
  });

  it('updates name and inputs', () => {
    const scenario = seed();
    useScenarioStore.getState().updateScenario(scenario.id, { name: 'Renamed' });
    const updated = useScenarioStore.getState().getScenario(scenario.id);
    expect(updated?.name).toBe('Renamed');
    expect(typeof updated?.updatedAt).toBe('string');
  });

  it('ignores updates for unknown ids', () => {
    seed();
    useScenarioStore.getState().updateScenario('missing', { name: 'Nope' });
    expect(useScenarioStore.getState().scenarios).toHaveLength(1);
  });

  it('duplicates a scenario with a new id and suffixed name', () => {
    const scenario = seed('Original');
    const copy = useScenarioStore.getState().duplicateScenario(scenario.id);
    expect(copy).toBeDefined();
    expect(copy?.id).not.toBe(scenario.id);
    expect(copy?.name).toBe('Original copy');
    expect(copy?.inputs).toEqual(scenario.inputs);
    expect(copy?.inputs).not.toBe(scenario.inputs);
    expect(useScenarioStore.getState().scenarios).toHaveLength(2);
  });

  it('returns undefined when duplicating a missing id', () => {
    expect(useScenarioStore.getState().duplicateScenario('missing')).toBeUndefined();
  });

  it('removes scenarios', () => {
    const scenario = seed();
    useScenarioStore.getState().removeScenario(scenario.id);
    expect(useScenarioStore.getState().scenarios).toHaveLength(0);
  });

  it('gets a scenario by id', () => {
    const scenario = seed();
    expect(useScenarioStore.getState().getScenario(scenario.id)?.name).toBe('Seed');
    expect(useScenarioStore.getState().getScenario('missing')).toBeUndefined();
  });
});
