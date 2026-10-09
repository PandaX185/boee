import { PRESETS } from '@/core/presets';
import { inputsSchema } from '@/domain/schema';

describe('PRESETS', () => {
  it('has unique ids', () => {
    const ids = PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique names', () => {
    const names = PRESETS.map((preset) => preset.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every preset satisfies the inputs schema', () => {
    for (const preset of PRESETS) {
      expect(inputsSchema.safeParse(preset.inputs).success).toBe(true);
    }
  });
});
