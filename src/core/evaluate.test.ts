import { DEFAULT_CONSTANTS } from '@/core/constants';
import { estimate } from '@/core/estimate';
import { evaluate } from '@/core/evaluate';
import { PRESETS } from '@/core/presets';
import { deriveImplications } from '@/core/rules';

describe('evaluate', () => {
  it('combines the estimate engine with the rules engine', () => {
    const inputs = PRESETS[0].inputs;
    const derived = estimate(inputs, DEFAULT_CONSTANTS);
    expect(evaluate(inputs, DEFAULT_CONSTANTS)).toEqual({
      derived,
      implications: deriveImplications({ inputs, derived, constants: DEFAULT_CONSTANTS }),
    });
  });
});
