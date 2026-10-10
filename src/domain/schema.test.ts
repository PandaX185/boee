import { PRESETS } from '@/core/presets';
import { inputsSchema } from '@/domain/schema';

describe('inputsSchema', () => {
  it('accepts every built-in preset', () => {
    for (const preset of PRESETS) {
      expect(inputsSchema.safeParse(preset.inputs).success).toBe(true);
    }
  });

  it('rejects a non-positive daily active user count', () => {
    const preset = PRESETS[0];
    const invalid = {
      ...preset.inputs,
      traffic: { ...preset.inputs.traffic, dailyActiveUsers: 0 },
    };
    expect(inputsSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects negative ratios, availability outside (0, 1], and negative growth', () => {
    const base = PRESETS[0].inputs;
    expect(
      inputsSchema.safeParse({
        ...base,
        traffic: { ...base.traffic, readWriteRatio: -1 },
      }).success,
    ).toBe(false);
    expect(
      inputsSchema.safeParse({
        ...base,
        nonFunctional: { ...base.nonFunctional, availabilityTarget: 1.5 },
      }).success,
    ).toBe(false);
    expect(
      inputsSchema.safeParse({
        ...base,
        nonFunctional: { ...base.nonFunctional, availabilityTarget: 0 },
      }).success,
    ).toBe(false);
    expect(
      inputsSchema.safeParse({
        ...base,
        nonFunctional: { ...base.nonFunctional, monthlyGrowthRate: -0.01 },
      }).success,
    ).toBe(false);
  });

  it('accepts boundary values', () => {
    const base = PRESETS[0].inputs;
    expect(
      inputsSchema.safeParse({
        ...base,
        traffic: { ...base.traffic, readWriteRatio: 0 },
        nonFunctional: { ...base.nonFunctional, availabilityTarget: 1, monthlyGrowthRate: 0 },
      }).success,
    ).toBe(true);
  });
});
