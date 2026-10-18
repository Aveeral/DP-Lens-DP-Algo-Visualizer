import type { AlgoId, AlgoModule } from './types';
import { binomialModule } from './binomial';
import { mcmModule } from './mcm';
import { lcsModule } from './lcs';
import { knapsackModule } from './knapsack';

export * from './types';
export * from './tree';
export * from './layout';
export * from './fillOrder';
export * from './predict';
export * from './binomial';
export * from './mcm';
export * from './lcs';
export * from './knapsack';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const algoRegistry: Record<AlgoId, AlgoModule<any>> = {
  binomial: binomialModule,
  mcm: mcmModule,
  lcs: lcsModule,
  knapsack: knapsackModule,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAlgoModule(id: AlgoId): AlgoModule<any> {
  const mod = algoRegistry[id];
  if (!mod) {
    throw new Error(`Unknown algorithm id: ${id}`);
  }
  return mod;
}
