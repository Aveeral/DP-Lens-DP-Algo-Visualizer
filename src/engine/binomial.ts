import type {
  AlgoModule,
  BinomialInput,
  BreakDef,
  Cell,
  CellId,
  Preset,
  Step,
  Term,
  Trace,
  Variant,
} from './types';
import { makeCellId } from '../lib/cellId';
import { buildNaiveTree } from './tree';

export const BINOMIAL_BREAKS: BreakDef[] = [
  {
    id: 'binomial-drop',
    name: 'Drop C(n-1, k) term',
    description: 'Calculates C(i, j) = C(i-1, j-1) only, dropping the addition from above.',
    brokenFormula: 'C(i, j) = C(i-1, j-1)',
  },
];

export const BINOMIAL_PRESETS: Preset<BinomialInput>[] = [
  {
    name: 'Classic C(4, 2)',
    input: { n: 4, k: 2 },
    description: 'Standard textbook example: 4 choose 2 = 6, 11 naive calls.',
  },
  {
    name: 'Classroom C(5, 2)',
    input: { n: 5, k: 2 },
    description: '5 choose 2 = 10, 19 naive calls.',
  },
  {
    name: 'Overlapping C(10, 5)',
    input: { n: 10, k: 5 },
    description: '10 choose 5 = 252: 503 naive calls folding into 36 cells.',
  },
];

export function validateBinomialInput(input: BinomialInput): string | null {
  if (!Number.isInteger(input.n) || !Number.isInteger(input.k)) {
    return 'n and k must be integers';
  }
  if (input.n < 0 || input.n > 10) {
    return 'n must be between 0 and 10';
  }
  if (input.k < 0 || input.k > input.n) {
    return 'k must be between 0 and n';
  }
  return null;
}

export function solveBinomial(input: BinomialInput, variant: Variant = 'correct'): Trace {
  const { n, k } = input;
  const isDropBreak = variant === 'binomial-drop';

  const rows = n + 1;
  const cols = k + 1;
  const rowLabels = Array.from({ length: rows }, (_, i) => `n = ${i}`);
  const colLabels = Array.from({ length: cols }, (_, j) => `k = ${j}`);

  const cells: Record<CellId, Cell> = {};
  const deps: Record<CellId, CellId[]> = {};
  const steps: Step[] = [];

  // Initialize cells grid
  for (let r = 0; r <= n; r++) {
    for (let c = 0; c <= k; c++) {
      const id = makeCellId(r, c);
      const isBase = c === 0 || c === r;
      cells[id] = {
        id,
        row: r,
        col: c,
        value: null,
        isBase,
      };
      deps[id] = [];
    }
  }

  // DP computation table
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  let stepCounter = 0;

  for (let i = 0; i <= n; i++) {
    const maxCol = Math.min(i, k);
    for (let j = 0; j <= maxCol; j++) {
      const cellId = makeCellId(i, j);

      if (j === 0 || j === i) {
        // Base case
        dp[i]![j] = 1;
        cells[cellId]!.value = 1;

        steps.push({
          index: stepCounter++,
          cell: cellId,
          terms: [],
          chosen: -1,
          result: 1,
          formula: j === 0 ? 'C(i, 0) = 1' : 'C(i, i) = 1',
          substituted: `C(${i}, ${j}) = 1`,
          narration: `Base case: choosing ${j} elements from ${i} has exactly 1 way.`,
          isDecision: false,
        });
      } else {
        // Recurrence: C(i, j) = C(i-1, j-1) + C(i-1, j)
        const diagId = makeCellId(i - 1, j - 1);
        const aboveId = makeCellId(i - 1, j);

        const diagVal = dp[i - 1]![j - 1]!;
        const aboveVal = dp[i - 1]![j]!;

        deps[cellId] = isDropBreak ? [diagId] : [diagId, aboveId];

        const terms: Term[] = [
          {
            label: 'diagonal',
            sources: [diagId],
            expr: `C(${i - 1}, ${j - 1})`,
            value: diagVal,
          },
        ];

        if (!isDropBreak) {
          terms.push({
            label: 'above',
            sources: [aboveId],
            expr: `C(${i - 1}, ${j})`,
            value: aboveVal,
          });
        }

        const resultVal = isDropBreak ? diagVal : diagVal + aboveVal;
        dp[i]![j] = resultVal;
        cells[cellId]!.value = resultVal;

        steps.push({
          index: stepCounter++,
          cell: cellId,
          terms,
          chosen: -1, // Sum: all active terms contribute equally
          result: resultVal,
          formula: isDropBreak
            ? 'C(i, j) = C(i-1, j-1)'
            : 'C(i, j) = C(i-1, j-1) + C(i-1, j)',
          substituted: isDropBreak
            ? `C(${i}, ${j}) = ${diagVal} = ${resultVal}`
            : `C(${i}, ${j}) = ${diagVal} + ${aboveVal} = ${resultVal}`,
          narration: isDropBreak
            ? `Broken rule: only reading diagonal C(${i - 1}, ${j - 1}) = ${diagVal}.`
            : `Add paths from diagonal C(${i - 1}, ${j - 1}) [${diagVal}] and above C(${i - 1}, ${j}) [${aboveVal}] = ${resultVal}.`,
          isDecision: true,
        });
      }
    }
  }

  // Naive recursion tree
  const treeResult = buildNaiveTree<{ i: number; j: number }>({
    rootState: { i: n, j: k },
    getKey: (s) => makeCellId(s.i, s.j),
    getLabel: (s) => `C(${s.i},${s.j})`,
    getChildren: (s) => {
      if (s.j === 0 || s.j === s.i) return [];
      return [
        { i: s.i - 1, j: s.j - 1 },
        { i: s.i - 1, j: s.j },
      ];
    },
    maxNodes: 600,
  });

  const finalCell = makeCellId(n, k);
  const finalAnswer = dp[n]![k]!;

  const uniqueSubproblemCount =
    treeResult.uniqueSubproblems + (n > 0 && k > 0 ? 1 : 0);

  return {
    algo: 'binomial',
    rows,
    cols,
    rowLabels,
    colLabels,
    cells,
    steps,
    deps,
    tree: {
      nodes: treeResult.nodes,
      root: treeResult.root,
      truncated: treeResult.truncated,
    },
    answer: {
      value: finalAnswer,
      cell: finalCell,
    },
    traceback: {
      path: [finalCell],
      solution: {
        pathsCount: finalAnswer,
      },
    },
    stats: {
      naiveCalls: treeResult.naiveCalls,
      uniqueSubproblems: uniqueSubproblemCount,
    },
  };
}

export const binomialModule: AlgoModule<BinomialInput> = {
  id: 'binomial',
  name: 'Binomial Coefficient',
  solve: solveBinomial,
  validate: validateBinomialInput,
  presets: BINOMIAL_PRESETS,
  breaks: BINOMIAL_BREAKS,
};
