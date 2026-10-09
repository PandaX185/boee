import { estimate } from '@/core/estimate';
import { deriveImplications } from '@/core/rules';
import type { Constants, Evaluation, Inputs } from '@/domain/types';

export function evaluate(inputs: Inputs, constants: Constants): Evaluation {
  const derived = estimate(inputs, constants);
  const implications = deriveImplications({ inputs, derived, constants });
  return { derived, implications };
}
