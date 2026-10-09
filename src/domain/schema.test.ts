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
});
