import { describe, it, expect } from 'vitest';
import { solveBinomial, validateBinomialInput } from '../binomial';

describe('Binomial Coefficient Engine', () => {
  it('validates input boundaries', () => {
    expect(validateBinomialInput({ n: 4, k: 2 })).toBeNull();
    expect(validateBinomialInput({ n: 11, k: 2 })).toContain('between 0 and 10');
    expect(validateBinomialInput({ n: 4, k: 5 })).toContain('between 0 and n');
    expect(validateBinomialInput({ n: -1, k: 0 })).toContain('between 0 and 10');
  });

  it('computes C(4, 2) = 6 with 11 naive calls', () => {
    const trace = solveBinomial({ n: 4, k: 2 });
    expect(trace.answer.value).toBe(6);
    expect(trace.stats.naiveCalls).toBe(11);
  });

  it('computes C(5, 2) = 10 with 19 naive calls', () => {
    const trace = solveBinomial({ n: 5, k: 2 });
    expect(trace.answer.value).toBe(10);
    expect(trace.stats.naiveCalls).toBe(19);
  });

  it('computes C(10, 5) = 252 with 503 naive calls and 36 unique subproblems', () => {
    const trace = solveBinomial({ n: 10, k: 5 });
    expect(trace.answer.value).toBe(252);
    expect(trace.stats.naiveCalls).toBe(503);
    expect(trace.stats.uniqueSubproblems).toBe(36);
  });

  it('computes C(6, 0) = 1 with a single base step', () => {
    const trace = solveBinomial({ n: 6, k: 0 });
    expect(trace.answer.value).toBe(1);
    expect(trace.steps.length).toBe(7); // cells (0,0) to (6,0)
    expect(trace.stats.naiveCalls).toBe(1);
  });

  it('break variant binomial-drop collapses values to 1s', () => {
    const trace = solveBinomial({ n: 4, k: 2 }, 'binomial-drop');
    // In binomial-drop, every cell value becomes 1
    for (const step of trace.steps) {
      expect(step.result).toBe(1);
    }
    expect(trace.answer.value).toBe(1);
  });
});
