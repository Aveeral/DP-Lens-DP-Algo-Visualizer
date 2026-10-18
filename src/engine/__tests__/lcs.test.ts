import { describe, it, expect } from 'vitest';
import { solveLcs, validateLcsInput } from '../lcs';
import type { LcsSolution } from '../types';

describe('Longest Common Subsequence Engine', () => {
  it('validates string boundaries', () => {
    expect(validateLcsInput({ a: 'ABC', b: 'DEF' })).toBeNull();
    expect(validateLcsInput({ a: '', b: 'ABC' })).toContain('between 1 and 8 characters');
    expect(validateLcsInput({ a: 'ABCDEFGHI', b: 'ABC' })).toContain(
      'between 1 and 8 characters'
    );
    expect(validateLcsInput({ a: 'AB12', b: 'ABC' })).toContain('letters A-Z');
  });

  it('computes ABCB / BDCB -> 3 with subsequence BCB', () => {
    const trace = solveLcs({ a: 'ABCB', b: 'BDCB' });
    expect(trace.answer.value).toBe(3);
    const sol = trace.traceback.solution as LcsSolution;
    expect(sol.subsequence).toBe('BCB');
  });

  it('computes ABCBDAB / BDCABA -> 4 with alternative solutions', () => {
    const trace = solveLcs({ a: 'ABCBDAB', b: 'BDCABA' });
    expect(trace.answer.value).toBe(4);
    const sol = trace.traceback.solution as LcsSolution;
    expect(sol.subsequence).toBe('BCBA');
    expect(sol.allLcs.length).toBeGreaterThan(1);
    expect(sol.allLcs).toContain('BCBA');
  });

  it('computes AGGTAB / GXTXAYB -> 4 with subsequence GTAB', () => {
    const trace = solveLcs({ a: 'AGGTAB', b: 'GXTXAYB' });
    expect(trace.answer.value).toBe(4);
    const sol = trace.traceback.solution as LcsSolution;
    expect(sol.subsequence).toBe('GTAB');
  });

  it('break variant lcs-substring produces 2 instead of 4 for ABCBDAB / BDCABA', () => {
    const trace = solveLcs({ a: 'ABCBDAB', b: 'BDCABA' }, 'lcs-substring');
    expect(trace.answer.value).toBe(2);
  });
});
