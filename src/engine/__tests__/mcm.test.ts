import { describe, it, expect } from 'vitest';
import { solveMcm, validateMcmInput } from '../mcm';
import type { McmSolution } from '../types';

describe('Matrix Chain Multiplication Engine', () => {
  it('validates dimension constraints', () => {
    expect(validateMcmInput({ dims: [10, 20, 30] })).toBeNull();
    expect(validateMcmInput({ dims: [10, 20] })).toContain('between 2 and 6 matrices');
    expect(validateMcmInput({ dims: [10, 20, 30, 40, 50, 60, 70, 80] })).toContain(
      'between 2 and 6 matrices'
    );
    expect(validateMcmInput({ dims: [10, 0, 30] })).toContain('between 1 and 99');
  });

  it('computes [10, 30, 5, 60] -> 4,500 and bracketing ((A1A2)A3)', () => {
    const trace = solveMcm({ dims: [10, 30, 5, 60] });
    expect(trace.answer.value).toBe(4500);
    const sol = trace.traceback.solution as McmSolution;
    expect(sol.bracketed).toBe('((A1A2)A3)');
  });

  it('computes [40, 20, 30, 10, 30] -> 26,000 and bracketing ((A1(A2A3))A4)', () => {
    const trace = solveMcm({ dims: [40, 20, 30, 10, 30] });
    expect(trace.answer.value).toBe(26000);
    const sol = trace.traceback.solution as McmSolution;
    expect(sol.bracketed).toBe('((A1(A2A3))A4)');
  });

  it('computes [30, 35, 15, 5, 10, 20, 25] -> 15,125 and bracketing ((A1(A2A3))((A4A5)A6))', () => {
    const trace = solveMcm({ dims: [30, 35, 15, 5, 10, 20, 25] });
    expect(trace.answer.value).toBe(15125);
    const sol = trace.traceback.solution as McmSolution;
    expect(sol.bracketed).toBe('((A1(A2A3))((A4A5)A6))');
  });

  it('break variant mcm-middle jumps cost to 69,000 for [40, 20, 30, 10, 30]', () => {
    const trace = solveMcm({ dims: [40, 20, 30, 10, 30] }, 'mcm-middle');
    expect(trace.answer.value).toBe(69000);
  });
});
