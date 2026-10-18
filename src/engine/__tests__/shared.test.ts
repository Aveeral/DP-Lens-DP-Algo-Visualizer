import { describe, it, expect } from 'vitest';
import { solveBinomial } from '../binomial';
import { solveMcm } from '../mcm';
import { solveLcs } from '../lcs';
import { solveKnapsack } from '../knapsack';
import { canFill, getAvailableCells } from '../fillOrder';
import { pickStops, distractors, buildPredictQuestion } from '../predict';
import { layoutTree, layoutDag } from '../layout';
import type { Trace } from '../types';

describe('Shared Engine Invariants & Helpers', () => {
  const traces: { name: string; trace: Trace }[] = [
    { name: 'Binomial C(4, 2)', trace: solveBinomial({ n: 4, k: 2 }) },
    { name: 'MCM [10, 30, 5, 60]', trace: solveMcm({ dims: [10, 30, 5, 60] }) },
    { name: 'LCS ABCB / BDCB', trace: solveLcs({ a: 'ABCB', b: 'BDCB' }) },
    {
      name: 'Knapsack W=5',
      trace: solveKnapsack({
        W: 5,
        items: [
          { id: '1', name: 'A', w: 2, v: 3 },
          { id: '2', name: 'B', w: 3, v: 4 },
        ],
      }),
    },
  ];

  describe('Trace Invariants for all 4 algorithms', () => {
    for (const { name, trace } of traces) {
      it(`enforces that every step sources exist and are filled earlier for ${name}`, () => {
        const filledCells = new Set<string>();

        for (const step of trace.steps) {
          // Check all term sources
          for (const term of step.terms) {
            for (const sourceId of term.sources) {
              expect(
                filledCells.has(sourceId),
                `Step ${step.index} (cell ${step.cell}) depends on source ${sourceId} which was not filled prior`
              ).toBe(true);
            }
          }

          // Register this cell as filled
          filledCells.add(step.cell);
        }
      });

      it(`enforces that deps matches term sources for ${name}`, () => {
        for (const step of trace.steps) {
          const termSources = new Set(step.terms.flatMap((t) => t.sources));
          const declaredDeps = new Set(trace.deps[step.cell] ?? []);
          expect(termSources).toEqual(declaredDeps);
        }
      });

      it(`stepping 0 to end faithfully reproduces the final table for ${name}`, () => {
        const replayTable: Record<string, number> = {};

        for (const step of trace.steps) {
          replayTable[step.cell] = step.result;
        }

        for (const [cellId, cell] of Object.entries(trace.cells)) {
          if (cell.value !== null) {
            expect(replayTable[cellId]).toBe(cell.value);
          }
        }
      });
    }
  });

  describe('Fill-Order Challenge Helpers', () => {
    it('blocks unready cell and allows ready cell', () => {
      const trace = solveBinomial({ n: 4, k: 2 });
      const filled = new Set<string>(['0,0', '1,0', '1,1']);

      // Cell (2, 0) is a base cell with no dependencies
      expect(canFill('2,0', filled, trace.deps).ok).toBe(true);

      // Cell (2, 1) depends on (1, 0) and (1, 1), which are filled
      expect(canFill('2,1', filled, trace.deps).ok).toBe(true);

      // Cell (3, 2) depends on (2, 1) and (2, 2), which are not yet filled
      const blocked = canFill('3,2', filled, trace.deps);
      expect(blocked.ok).toBe(false);
      expect(blocked.missing).toContain('2,1');
    });

    it('identifies all available cells to fill', () => {
      const trace = solveBinomial({ n: 2, k: 2 });
      const allCells = ['0,0', '1,0', '1,1', '2,0', '2,1', '2,2'];
      const filled = new Set<string>(['0,0', '1,0', '1,1']);

      const available = getAvailableCells(allCells, filled, trace.deps);
      expect(available).toContain('2,0');
      expect(available).toContain('2,1');
    });
  });

  describe('Predict Mode Stops and Distractor Generation', () => {
    it('picks decision stops spread across execution', () => {
      const trace = solveKnapsack({
        W: 7,
        items: [
          { id: '1', name: 'Item 1', w: 1, v: 1 },
          { id: '2', name: 'Item 2', w: 3, v: 4 },
          { id: '3', name: 'Item 3', w: 4, v: 5 },
          { id: '4', name: 'Item 4', w: 5, v: 7 },
        ],
      });

      const stops = pickStops(trace, 5);
      expect(stops.length).toBe(5);
      for (const stopIndex of stops) {
        expect(trace.steps[stopIndex]?.isDecision).toBe(true);
      }
    });

    it('generates 3 distinct, non-negative wrong answers with explanations', () => {
      const trace = solveKnapsack({
        W: 5,
        items: [
          { id: '1', name: 'A', w: 2, v: 3 },
          { id: '2', name: 'B', w: 3, v: 4 },
        ],
      });

      const decisionStep = trace.steps.find((s) => s.isDecision && s.terms.length > 1)!;
      expect(decisionStep).toBeDefined();

      const wrongs = distractors(decisionStep);
      expect(wrongs.length).toBe(3);

      const allValues = [decisionStep.result, ...wrongs.map((w) => w.option)];
      const uniqueValues = new Set(allValues);
      expect(uniqueValues.size).toBe(4);

      for (const w of wrongs) {
        expect(w.option).toBeGreaterThanOrEqual(0);
        expect(w.mistake.length).toBeGreaterThan(5);
      }

      const q = buildPredictQuestion(decisionStep);
      expect(q.options.length).toBe(4);
      expect(q.options.some((o) => o.value === decisionStep.result)).toBe(true);

      // Edge case: step with result 0 or 1
      const zeroStep = trace.steps[0]!;
      const zeroWrongs = distractors(zeroStep);
      expect(zeroWrongs.length).toBe(3);
      for (const w of zeroWrongs) {
        expect(w.option).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Tree & DAG Layout', () => {
    it('computes valid coordinates for recursion tree and DAG', () => {
      const trace = solveBinomial({ n: 4, k: 2 });
      const treeLayout = layoutTree(trace.tree.nodes, trace.tree.root);

      expect(treeLayout.width).toBeGreaterThan(0);
      expect(treeLayout.height).toBeGreaterThan(0);
      expect(Object.keys(treeLayout.nodes).length).toBe(Object.keys(trace.tree.nodes).length);

      const dagLayout = layoutDag(trace.tree.nodes, treeLayout);
      expect(dagLayout.width).toBeGreaterThan(0);
      expect(dagLayout.height).toBeGreaterThan(0);
      const treeUniqueKeys = new Set(Object.values(trace.tree.nodes).map((n) => n.key));
      expect(Object.keys(dagLayout.nodes).length).toBe(treeUniqueKeys.size);
    });
  });

  describe('Engine Registry & Lib Helpers', () => {
    it('resolves all algo modules through registry', async () => {
      const { getAlgoModule, algoRegistry } = await import('../index');
      expect(getAlgoModule('binomial')).toBe(algoRegistry.binomial);
      expect(getAlgoModule('mcm')).toBe(algoRegistry.mcm);
      expect(getAlgoModule('lcs')).toBe(algoRegistry.lcs);
      expect(getAlgoModule('knapsack')).toBe(algoRegistry.knapsack);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => getAlgoModule('unknown' as any)).toThrow();
    });

    it('parses and formats cell IDs', async () => {
      const { parseCellId, makeCellId } = await import('../../lib/cellId');
      expect(makeCellId(4, 2)).toBe('4,2');
      expect(parseCellId('4,2')).toEqual({ row: 4, col: 2 });
      expect(parseCellId('invalid')).toEqual({ row: 0, col: 0 });
    });

    it('formats numbers', async () => {
      const { formatNumber } = await import('../../lib/format');
      expect(formatNumber(12345)).toBe((12345).toLocaleString());
      expect(formatNumber(null)).toBe('');
      expect(formatNumber(undefined)).toBe('');
    });

    it('handles localStorage gracefully', async () => {
      const { safeGetItem, safeSetItem } = await import('../../lib/storage');
      safeSetItem('test-key', { a: 1 });
      expect(safeGetItem('test-key', { a: 0 })).toEqual({ a: 1 });
      expect(safeGetItem('non-existent', 'default')).toBe('default');
    });
  });
});
