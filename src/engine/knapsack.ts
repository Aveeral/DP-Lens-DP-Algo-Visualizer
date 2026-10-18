import type {
  AlgoModule,
  BreakDef,
  Cell,
  CellId,
  KnapsackInput,
  KnapsackItem,
  KnapsackSolution,
  Preset,
  Step,
  Term,
  Trace,
  Variant,
} from './types';
import { makeCellId } from '../lib/cellId';
import { buildNaiveTree } from './tree';

export const KNAPSACK_BREAKS: BreakDef[] = [
  {
    id: 'knapsack-reuse',
    name: 'Unbounded Reuse (Same Row)',
    description: 'Reads V[i][c - wᵢ] instead of V[i-1][c - wᵢ], allowing items to be taken repeatedly.',
    brokenFormula: 'V[i][c] = max(V[i-1][c], vᵢ + V[i][c - wᵢ])',
  },
];

export const KNAPSACK_PRESETS: Preset<KnapsackInput>[] = [
  {
    name: 'Tie Showcase (3 items, W = 5)',
    input: {
      W: 5,
      items: [
        { id: 'item-1', name: 'Item 1', w: 2, v: 3 },
        { id: 'item-2', name: 'Item 2', w: 3, v: 4 },
        { id: 'item-3', name: 'Item 3', w: 3, v: 4 },
      ],
    },
    description: 'Optimal value 7 with an exact tie at V[3][5]: two different sets of items give 7.',
  },
  {
    name: 'Standard (4 items, W = 7)',
    input: {
      W: 7,
      items: [
        { id: 'item-1', name: 'Item 1', w: 1, v: 1 },
        { id: 'item-2', name: 'Item 2', w: 3, v: 4 },
        { id: 'item-3', name: 'Item 3', w: 4, v: 5 },
        { id: 'item-4', name: 'Item 4', w: 5, v: 7 },
      ],
    },
    description: 'Optimal value 9 taking items 2 & 3 (weights 3 + 4 = 7).',
  },
  {
    name: 'Oversized Item (1 item, W = 4)',
    input: {
      W: 4,
      items: [{ id: 'item-1', name: 'Heavy Item', w: 5, v: 10 }],
    },
    description: 'Item weight (5) exceeds capacity (4); table remains 0.',
  },
];

export function validateKnapsackInput(input: KnapsackInput): string | null {
  if (!Number.isInteger(input.W) || input.W < 1 || input.W > 10) {
    return 'Capacity W must be an integer between 1 and 10';
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 5) {
    return 'Knapsack requires between 1 and 5 items';
  }
  for (const item of input.items) {
    if (!Number.isInteger(item.w) || item.w < 1 || item.w > 10) {
      return `Item '${item.name}' weight must be an integer between 1 and 10`;
    }
    if (!Number.isInteger(item.v) || item.v < 1 || item.v > 99) {
      return `Item '${item.name}' value must be an integer between 1 and 99`;
    }
  }
  return null;
}

export function solveKnapsack(input: KnapsackInput, variant: Variant = 'correct'): Trace {
  const { items, W } = input;
  const n = items.length;
  const isReuseBreak = variant === 'knapsack-reuse';

  const rows = n + 1;
  const cols = W + 1;

  const rowLabels = ['None', ...items.map((it, idx) => `${it.name || `Item ${idx + 1}`} (w:${it.w}, v:${it.v})`)];
  const colLabels = Array.from({ length: cols }, (_, c) => `c = ${c}`);

  const cells: Record<CellId, Cell> = {};
  const deps: Record<CellId, CellId[]> = {};
  const steps: Step[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = makeCellId(r, c);
      cells[id] = {
        id,
        row: r,
        col: c,
        value: null,
        isBase: r === 0,
      };
      deps[id] = [];
    }
  }

  const V: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  let stepCounter = 0;
  let detectedTie = false;

  // Row 0: Base case (0 items)
  for (let c = 0; c <= W; c++) {
    const cellId = makeCellId(0, c);
    V[0]![c] = 0;
    cells[cellId]!.value = 0;

    steps.push({
      index: stepCounter++,
      cell: cellId,
      terms: [],
      chosen: -1,
      result: 0,
      formula: 'V[0][c] = 0',
      substituted: `V[0][${c}] = 0`,
      narration: 'Base case: with 0 items, total value is 0 for any capacity.',
      isDecision: false,
    });
  }

  // Row by row fill
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1]!;
    const { w: wi, v: vi, name } = item;

    for (let c = 0; c <= W; c++) {
      const cellId = makeCellId(i, c);
      const skipId = makeCellId(i - 1, c);
      const skipVal = V[i - 1]![c]!;

      if (wi > c) {
        // Item too heavy: must skip
        V[i]![c] = skipVal;
        cells[cellId]!.value = skipVal;
        deps[cellId] = [skipId];

        steps.push({
          index: stepCounter++,
          cell: cellId,
          terms: [
            {
              label: 'skip',
              sources: [skipId],
              expr: `V[${i - 1}][${c}]`,
              value: skipVal,
            },
          ],
          chosen: 0,
          result: skipVal,
          formula: 'V[i][c] = V[i-1][c] (w_i > c)',
          substituted: `V[${i}][${c}] = V[${i - 1}][${c}] = ${skipVal}`,
          narration: `${name} (weight ${wi}) does not fit in capacity ${c}. Must skip (${skipVal}).`,
          isDecision: false,
        });
      } else {
        // Decision: skip vs take
        const takeSourceRow = isReuseBreak ? i : i - 1;
        const takeSourceId = makeCellId(takeSourceRow, c - wi);
        const subproblemVal = V[takeSourceRow]![c - wi]!;
        const takeVal = vi + subproblemVal;

        deps[cellId] = [skipId, takeSourceId];

        const terms: Term[] = [
          {
            label: 'skip',
            sources: [skipId],
            expr: `V[${i - 1}][${c}]`,
            value: skipVal,
          },
          {
            label: 'take',
            sources: [takeSourceId],
            expr: `${vi} + V[${takeSourceRow}][${c - wi}]`,
            value: takeVal,
          },
        ];

        let chosen = 0;
        let res = skipVal;
        let narration = '';

        if (takeVal > skipVal) {
          chosen = 1;
          res = takeVal;
          narration = `Take ${name} (+${vi} value, fits in ${c}): take (${takeVal}) beats skip (${skipVal}).`;
        } else if (skipVal > takeVal) {
          chosen = 0;
          res = skipVal;
          narration = `Skip ${name}: skip (${skipVal}) beats take (${takeVal}).`;
        } else {
          // Exact tie: spec says "ties choose skip (state this in the narration)"
          chosen = 0;
          res = skipVal;
          detectedTie = true;
          narration = `Tie: skip = ${skipVal}, take = ${takeVal} -> tie kept skip (${res}).`;
        }

        V[i]![c] = res;
        cells[cellId]!.value = res;

        steps.push({
          index: stepCounter++,
          cell: cellId,
          terms,
          chosen,
          result: res,
          formula: isReuseBreak
            ? 'V[i][c] = max(V[i-1][c], v_i + V[i][c - w_i])'
            : 'V[i][c] = max(V[i-1][c], v_i + V[i-1][c - w_i])',
          substituted: `V[${i}][${c}] = max(skip: ${skipVal}, take: ${takeVal}) = ${res}`,
          narration,
          isDecision: true,
        });
      }
    }
  }

  // Traceback
  const tracebackPath: CellId[] = [];
  const chosenItems: KnapsackItem[] = [];
  let curCap = W;

  for (let i = n; i >= 1; i--) {
    const cellId = makeCellId(i, curCap);
    tracebackPath.push(cellId);

    const item = items[i - 1]!;
    const skipVal = V[i - 1]![curCap]!;
    const currentVal = V[i]![curCap]!;

    if (currentVal !== skipVal && item.w <= curCap) {
      // Item was taken
      chosenItems.push(item);
      curCap -= item.w;
    }
  }
  tracebackPath.push(makeCellId(0, curCap));

  const totalWeight = chosenItems.reduce((acc, it) => acc + it.w, 0);
  const totalValue = chosenItems.reduce((acc, it) => acc + it.v, 0);

  const solution: KnapsackSolution = {
    items: chosenItems.reverse(),
    totalWeight,
    totalValue,
    hasTie: detectedTie,
  };

  // Naive tree
  const treeResult = buildNaiveTree<{ i: number; c: number }>({
    rootState: { i: n, c: W },
    getKey: (st) => makeCellId(st.i, st.c),
    getLabel: (st) => `K(${st.i},${st.c})`,
    getChildren: (st) => {
      if (st.i === 0) return [];
      const item = items[st.i - 1]!;
      const children = [{ i: st.i - 1, c: st.c }];
      if (item.w <= st.c) {
        children.push({ i: st.i - 1, c: st.c - item.w });
      }
      return children;
    },
    maxNodes: 250,
  });

  const finalCell = makeCellId(n, W);
  const finalAnswer = V[n]![W]!;

  return {
    algo: 'knapsack',
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
      path: tracebackPath,
      solution,
    },
    stats: {
      naiveCalls: treeResult.naiveCalls,
      uniqueSubproblems: treeResult.uniqueSubproblems,
    },
  };
}

export const knapsackModule: AlgoModule<KnapsackInput> = {
  id: 'knapsack',
  name: '0/1 Knapsack',
  solve: solveKnapsack,
  validate: validateKnapsackInput,
  presets: KNAPSACK_PRESETS,
  breaks: KNAPSACK_BREAKS,
};
