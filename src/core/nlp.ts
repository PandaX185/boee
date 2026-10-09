import type { Evaluation, Inputs } from '@/domain/types';

export interface NlpProvider {
  parse(naturalLanguage: string): Promise<Inputs>;
  narrate(evaluation: Evaluation): Promise<string>;
}
