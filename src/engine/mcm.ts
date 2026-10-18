import type {
  AlgoModule,
  BracketTreeNode,
  BreakDef,
  Cell,
  CellId,
  McmInput,
  McmSolution,
  Preset,
  Step,
  Term,
  Trace,
  Variant,
} from './types';
import { makeCellId } from '../lib/cellId';
import { buildNaiveTree } from './tree';

export const MCM_BREAKS: BreakDef[] = [
  {
    id: 'mcm-middle',
    name: 'Greedy Middle Split',
    description: 'Always splits at floor((i+j)/2) instead of testing all split points k.',
    brokenFormula: 'm[i][j] = m[i][mid] + m[mid+1][j] + cost (mid = floor((i+j)/2))',
  },
];

export const MCM_PRESETS: Preset<McmInput>[] = [
  {
    name: '3 Matrices (10, 30, 5, 60)',
    input: { dims: [10, 30, 5, 60] },
    description: 'A1(10×30), A2(30×5), A3(5×60) -> 4,500 operations with ((A1A2)A3).',
  },
  {
    name: '4 Matrices (40, 20, 30, 10, 30)',
    input: { dims: [40, 20, 30, 10, 30] },
    description: 'Optimal cost 26,000 ((A1(A2A3))A4) vs greedy middle cost 69,000.',
  },
  {
    name: '6 Matrices (30, 35, 15, 5, 10, 20, 25)',
    input: { dims: [30, 35, 15, 5, 10, 20, 25] },
    description: 'Deep chain: 15,125 operations with ((A1(A2A3))((A4A5)A6)).',
  },
];

export function validateMcmInput(input: McmInput): string | null {
  if (!Array.isArray(input.dims)) {
    return 'Dimensions must be an array';
  }
  if (input.dims.length < 3 || input.dims.length > 7) {
    return 'MCM requires between 2 and 6 matrices (3 to 7 dimensions)';
  }
  for (const d of input.dims) {
    if (!Number.isInteger(d) || d < 1 || d > 99) {
      return 'Each matrix dimension must be an integer between 1 and 99';
    }
  }
  return null;
}

export function solveMcm(input: McmInput, variant: Variant = 'correct'): Trace {
  const { dims } = input;
  const n = dims.length - 1; // Number of matrices
  const isMiddleBreak = variant === 'mcm-middle';

  const rows = n + 1;
  const cols = n + 1;
  const rowLabels = Array.from({ length: rows }, (_, i) => (i === 0 ? '-' : `A${i}`));
  const colLabels = Array.from({ length: cols }, (_, j) => (j === 0 ? '-' : `A${j}`));

  const cells: Record<CellId, Cell> = {};
  const deps: Record<CellId, CellId[]> = {};
  const steps: Step[] = [];

  for (let r = 1; r <= n; r++) {
    for (let c = 1; c <= n; c++) {
      const id = makeCellId(r, c);
      cells[id] = {
        id,
        row: r,
        col: c,
        value: null,
        isBase: r === c,
      };
      deps[id] = [];
    }
  }

  // Cost table m[i][j] and split table s[i][j]
  const m: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const s: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  let stepCounter = 0;

  // 1. Base cases: chain length 1 (m[i][i] = 0)
  for (let i = 1; i <= n; i++) {
    const cellId = makeCellId(i, i);
    m[i]![i] = 0;
    cells[cellId]!.value = 0;

    steps.push({
      index: stepCounter++,
      cell: cellId,
      terms: [],
      chosen: -1,
      result: 0,
      formula: 'm[i][i] = 0',
      substituted: `m[${i}][${i}] = 0`,
      narration: `Base case: A single matrix A${i} requires 0 scalar multiplications.`,
      isDecision: false,
    });
  }

  // 2. Diagonal fill: chain length L = 2 to n
  for (let L = 2; L <= n; L++) {
    for (let i = 1; i <= n - L + 1; i++) {
      const j = i + L - 1;
      const cellId = makeCellId(i, j);

      let bestCost = Infinity;
      let bestK = i;
      const terms: Term[] = [];
      const cellDeps: CellId[] = [];

      // Determine candidate k values
      const kCandidates: number[] = isMiddleBreak
        ? [Math.floor((i + j) / 2)]
        : Array.from({ length: j - i }, (_, idx) => i + idx);

      for (const k of kCandidates) {
        const leftId = makeCellId(i, k);
        const rightId = makeCellId(k + 1, j);

        cellDeps.push(leftId, rightId);

        const leftCost = m[i]![k]!;
        const rightCost = m[k + 1]![j]!;
        const multCost = dims[i - 1]! * dims[k]! * dims[j]!;
        const total = leftCost + rightCost + multCost;

        terms.push({
          label: `k = ${k}`,
          sources: [leftId, rightId],
          expr: `m[${i}][${k}] + m[${k + 1}][${j}] + ${dims[i - 1]}×${dims[k]}×${dims[j]}`,
          value: total,
        });

        if (total < bestCost) {
          bestCost = total;
          bestK = k;
        }
      }

      m[i]![j] = bestCost;
      s[i]![j] = bestK;
      cells[cellId]!.value = bestCost;
      deps[cellId] = Array.from(new Set(cellDeps));

      const chosenTermIndex = terms.findIndex((t) => t.value === bestCost);

      steps.push({
        index: stepCounter++,
        cell: cellId,
        terms,
        chosen: Math.max(0, chosenTermIndex),
        result: bestCost,
        formula: isMiddleBreak
          ? 'm[i][j] = m[i][mid] + m[mid+1][j] + p_{i-1}p_{mid}p_j'
          : 'm[i][j] = min_{i<=k<j} { m[i][k] + m[k+1][j] + p_{i-1}p_k p_j }',
        substituted: `m[${i}][${j}] = min(${terms.map((t) => t.value).join(', ')}) = ${bestCost} (k = ${bestK})`,
        narration: isMiddleBreak
          ? `Greedy middle split at k=${bestK} gives cost ${bestCost}.`
          : `Optimal split between A${i}..A${bestK} and A${bestK + 1}..A${j} (k = ${bestK}) gives ${bestCost} operations.`,
        isDecision: true,
      });
    }
  }

  // Bracket solution & tree
  function buildBracketString(i: number, j: number): string {
    if (i === j) return `A${i}`;
    const k = s[i]![j]!;
    return `(${buildBracketString(i, k)}${buildBracketString(k + 1, j)})`;
  }

  function buildBracketHierarchy(i: number, j: number): BracketTreeNode {
    if (i === j) {
      return { i, j, name: `A${i}` };
    }
    const k = s[i]![j]!;
    return {
      i,
      j,
      k,
      left: buildBracketHierarchy(i, k),
      right: buildBracketHierarchy(k + 1, j),
    };
  }

  const solution: McmSolution = {
    bracketed: buildBracketString(1, n),
    bracketTree: buildBracketHierarchy(1, n),
  };

  // Naive tree
  const treeResult = buildNaiveTree<{ i: number; j: number }>({
    rootState: { i: 1, j: n },
    getKey: (st) => makeCellId(st.i, st.j),
    getLabel: (st) => (st.i === st.j ? `A${st.i}` : `m(${st.i},${st.j})`),
    getChildren: (st) => {
      if (st.i === st.j) return [];
      const children: { i: number; j: number }[] = [];
      for (let k = st.i; k < st.j; k++) {
        children.push({ i: st.i, j: k });
        children.push({ i: k + 1, j: st.j });
      }
      return children;
    },
    maxNodes: 63, // Spec: cap with truncated: true beyond 63 nodes
  });

  const finalCell = makeCellId(1, n);
  const finalAnswer = m[1]![n]!;

  // Traceback path
  const tracebackPath: CellId[] = [];
  function tracePath(i: number, j: number) {
    tracebackPath.push(makeCellId(i, j));
    if (i < j) {
      const k = s[i]![j]!;
      tracePath(i, k);
      tracePath(k + 1, j);
    }
  }
  tracePath(1, n);

  return {
    algo: 'mcm',
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
      path: Array.from(new Set(tracebackPath)),
      solution,
    },
    stats: {
      naiveCalls: treeResult.naiveCalls,
      uniqueSubproblems: treeResult.uniqueSubproblems,
    },
  };
}

export const mcmModule: AlgoModule<McmInput> = {
  id: 'mcm',
  name: 'Matrix Chain Multiplication',
  solve: solveMcm,
  validate: validateMcmInput,
  presets: MCM_PRESETS,
  breaks: MCM_BREAKS,
};
