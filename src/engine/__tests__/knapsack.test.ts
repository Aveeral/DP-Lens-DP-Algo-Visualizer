import { describe, it, expect } from 'vitest';
import { solveKnapsack, validateKnapsackInput } from '../knapsack';
import type { KnapsackSolution } from '../types';

describe('0/1 Knapsack Engine', () => {
  it('validates input boundaries', () => {
    expect(
      validateKnapsackInput({
        W: 5,
        items: [{ id: '1', name: 'Item', w: 2, v: 3 }],
      })
    ).toBeNull();
    expect(
      validateKnapsackInput({
        W: 0,
        items: [{ id: '1', name: 'Item', w: 2, v: 3 }],
      })
    ).toContain('Capacity W must be an integer between 1 and 10');
    expect(
      validateKnapsackInput({
        W: 5,
        items: [],
      })
    ).toContain('between 1 and 5 items');
  });

  it('computes (2,3) (3,4) (3,4), W 5 -> 7 with tie flagged at final cell', () => {
    const trace = solveKnapsack({
      W: 5,
      items: [
        { id: '1', name: 'A', w: 2, v: 3 },
        { id: '2', name: 'B', w: 3, v: 4 },
        { id: '3', name: 'C', w: 3, v: 4 },
      ],
    });
    expect(trace.answer.value).toBe(7);
    const sol = trace.traceback.solution as KnapsackSolution;
    expect(sol.totalValue).toBe(7);
    expect(sol.hasTie).toBe(true);
  });

  it('computes (1,1) (3,4) (4,5) (5,7), W 7 -> 9 with items 2 and 3', () => {
    const trace = solveKnapsack({
      W: 7,
      items: [
        { id: '1', name: 'Item 1', w: 1, v: 1 },
        { id: '2', name: 'Item 2', w: 3, v: 4 },
        { id: '3', name: 'Item 3', w: 4, v: 5 },
        { id: '4', name: 'Item 4', w: 5, v: 7 },
      ],
    });
    expect(trace.answer.value).toBe(9);
    const sol = trace.traceback.solution as KnapsackSolution;
    expect(sol.totalValue).toBe(9);
    expect(sol.items.map((i) => i.name)).toEqual(['Item 2', 'Item 3']);
  });

  it('computes (5,10), W 4 -> 0 when item never fits', () => {
    const trace = solveKnapsack({
      W: 4,
      items: [{ id: '1', name: 'Heavy', w: 5, v: 10 }],
    });
    expect(trace.answer.value).toBe(0);
    const sol = trace.traceback.solution as KnapsackSolution;
    expect(sol.items.length).toBe(0);
  });

  it('break variant knapsack-reuse produces 0 0 3 3 6 6 for item (w 2, v 3), W 5', () => {
    const trace = solveKnapsack(
      {
        W: 5,
        items: [{ id: '1', name: 'Reusable', w: 2, v: 3 }],
      },
      'knapsack-reuse'
    );

    // Row 1 values for c = 0..5
    const row1Values = [0, 1, 2, 3, 4, 5].map((c) => trace.cells[`1,${c}`]?.value);
    expect(row1Values).toEqual([0, 0, 3, 3, 6, 6]);
    expect(trace.answer.value).toBe(6);
  });
});
