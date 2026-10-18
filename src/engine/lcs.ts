import type {
  AlgoModule,
  BreakDef,
  Cell,
  CellId,
  LcsInput,
  LcsSolution,
  Preset,
  Step,
  Term,
  Trace,
  Variant,
} from './types';
import { makeCellId } from '../lib/cellId';
import { buildNaiveTree } from './tree';

export const LCS_BREAKS: BreakDef[] = [
  {
    id: 'lcs-substring',
    name: 'Longest Common Substring',
    description: 'Resets to 0 on mismatch instead of carrying forward the max. Finds contiguous common substring.',
    brokenFormula: 'L[i][j] = (b[i] == a[j]) ? L[i-1][j-1] + 1 : 0',
  },
];

export const LCS_PRESETS: Preset<LcsInput>[] = [
  {
    name: 'Short (ABCB / BDCB)',
    input: { a: 'ABCB', b: 'BDCB' },
    description: 'LCS is BCB of length 3.',
  },
  {
    name: 'Textbook (ABCBDAB / BDCABA)',
    input: { a: 'ABCBDAB', b: 'BDCABA' },
    description: 'LCS of length 4 (BCBA, BDAB, BCAB); demonstrates alternative solutions.',
  },
  {
    name: 'Classic (AGGTAB / GXTXAYB)',
    input: { a: 'AGGTAB', b: 'GXTXAYB' },
    description: 'Length 4 with unique subsequence GTAB.',
  },
];

export function validateLcsInput(input: LcsInput): string | null {
  if (typeof input.a !== 'string' || typeof input.b !== 'string') {
    return 'Both inputs must be strings';
  }
  const a = input.a.toUpperCase().trim();
  const b = input.b.toUpperCase().trim();
  if (a.length < 1 || a.length > 8 || b.length < 1 || b.length > 8) {
    return 'Strings must be between 1 and 8 characters';
  }
  if (!/^[A-Z]+$/.test(a) || !/^[A-Z]+$/.test(b)) {
    return 'Strings must contain only letters A-Z';
  }
  return null;
}

export function solveLcs(input: LcsInput, variant: Variant = 'correct'): Trace {
  const a = input.a.toUpperCase().trim();
  const b = input.b.toUpperCase().trim();
  const isSubstringBreak = variant === 'lcs-substring';

  const rows = b.length + 1;
  const cols = a.length + 1;

  const rowLabels = ['ε', ...b.split('')];
  const colLabels = ['ε', ...a.split('')];

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
        isBase: r === 0 || c === 0,
      };
      deps[id] = [];
    }
  }

  const L: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  let stepCounter = 0;

  // Row by row fill order
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cellId = makeCellId(i, j);

      if (i === 0 || j === 0) {
        // Base case: empty prefix
        L[i]![j] = 0;
        cells[cellId]!.value = 0;

        steps.push({
          index: stepCounter++,
          cell: cellId,
          terms: [],
          chosen: -1,
          result: 0,
          formula: 'L[0][j] = L[i][0] = 0',
          substituted: `L[${i}][${j}] = 0`,
          narration: `Base case: comparing with an empty string yields LCS length 0.`,
          isDecision: false,
        });
      } else {
        const charA = a[j - 1]!;
        const charB = b[i - 1]!;

        if (charA === charB) {
          // Character match
          const diagId = makeCellId(i - 1, j - 1);
          const diagVal = L[i - 1]![j - 1]!;
          const res = diagVal + 1;

          L[i]![j] = res;
          cells[cellId]!.value = res;
          deps[cellId] = [diagId];

          steps.push({
            index: stepCounter++,
            cell: cellId,
            terms: [
              {
                label: 'match',
                sources: [diagId],
                expr: `L[${i - 1}][${j - 1}] + 1`,
                value: res,
              },
            ],
            chosen: 0,
            result: res,
            formula: 'L[i][j] = L[i-1][j-1] + 1',
            substituted: `L[${i}][${j}] = L[${i - 1}][${j - 1}] + 1 = ${diagVal} + 1 = ${res}`,
            narration: `Match '${charA}': extend diagonal LCS length by 1 (${diagVal} -> ${res}).`,
            isDecision: true,
          });
        } else if (isSubstringBreak) {
          // Break: Longest Common Substring (reset to 0 on mismatch)
          L[i]![j] = 0;
          cells[cellId]!.value = 0;
          deps[cellId] = [];

          steps.push({
            index: stepCounter++,
            cell: cellId,
            terms: [],
            chosen: -1,
            result: 0,
            formula: 'L[i][j] = 0 (mismatch reset)',
            substituted: `Mismatch '${charB}' != '${charA}' => 0`,
            narration: `Broken rule: substring requires contiguous match, so reset to 0.`,
            isDecision: true,
          });
        } else {
          // Mismatch: max(up, left)
          const upId = makeCellId(i - 1, j);
          const leftId = makeCellId(i, j - 1);

          const upVal = L[i - 1]![j]!;
          const leftVal = L[i]![j - 1]!;

          const terms: Term[] = [
            {
              label: 'up',
              sources: [upId],
              expr: `L[${i - 1}][${j}]`,
              value: upVal,
            },
            {
              label: 'left',
              sources: [leftId],
              expr: `L[${i}][${j - 1}]`,
              value: leftVal,
            },
          ];

          deps[cellId] = [upId, leftId];

          // Spec: ties choose up (state in narration)
          const chosenIdx = upVal >= leftVal ? 0 : 1;
          const res = Math.max(upVal, leftVal);

          L[i]![j] = res;
          cells[cellId]!.value = res;

          const tieNote = upVal === leftVal ? ' (tie -> up chosen)' : '';

          steps.push({
            index: stepCounter++,
            cell: cellId,
            terms,
            chosen: chosenIdx,
            result: res,
            formula: 'L[i][j] = max(L[i-1][j], L[i][j-1])',
            substituted: `L[${i}][${j}] = max(up: ${upVal}, left: ${leftVal}) = ${res}${tieNote}`,
            narration: `Mismatch '${charB}' != '${charA}': take max of up (${upVal}) and left (${leftVal}) = ${res}${tieNote}.`,
            isDecision: true,
          });
        }
      }
    }
  }

  // Answer determination
  let answerValue = L[b.length]![a.length]!;
  let answerCell = makeCellId(b.length, a.length);

  if (isSubstringBreak) {
    let maxVal = 0;
    let maxCell = answerCell;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (L[r]![c]! > maxVal) {
          maxVal = L[r]![c]!;
          maxCell = makeCellId(r, c);
        }
      }
    }
    answerValue = maxVal;
    answerCell = maxCell;
  }

  // Traceback
  const tracebackPath: CellId[] = [];
  const matchedPairs: [number, number][] = [];
  const chars: string[] = [];

  let curI = isSubstringBreak ? Number(answerCell.split(',')[0]) : b.length;
  let curJ = isSubstringBreak ? Number(answerCell.split(',')[1]) : a.length;

  while (curI > 0 && curJ > 0) {
    const currentId = makeCellId(curI, curJ);
    tracebackPath.push(currentId);

    if (b[curI - 1] === a[curJ - 1]) {
      chars.push(b[curI - 1]!);
      matchedPairs.push([curJ - 1, curI - 1]);
      curI--;
      curJ--;
    } else if (isSubstringBreak) {
      break;
    } else {
      const upVal = L[curI - 1]![curJ]!;
      const leftVal = L[curI]![curJ - 1]!;
      if (leftVal >= upVal) {
        curJ--;
      } else {
        curI--;
      }
    }
  }
  tracebackPath.push(makeCellId(curI, curJ));

  chars.reverse();
  matchedPairs.reverse();

  // Find all distinct LCS strings (capped at 10)
  const allLcsSet = new Set<string>();

  function collectAllLcs(i: number, j: number, currentStr: string) {
    if (allLcsSet.size >= 10) return;
    if (i === 0 || j === 0) {
      allLcsSet.add(currentStr);
      return;
    }
    if (b[i - 1] === a[j - 1]) {
      collectAllLcs(i - 1, j - 1, b[i - 1] + currentStr);
    } else {
      const upVal = L[i - 1]![j]!;
      const leftVal = L[i]![j - 1]!;
      if (upVal >= leftVal) {
        collectAllLcs(i - 1, j, currentStr);
      }
      if (leftVal >= upVal) {
        collectAllLcs(i, j - 1, currentStr);
      }
    }
  }

  if (!isSubstringBreak) {
    collectAllLcs(b.length, a.length, '');
  }

  const solution: LcsSolution = {
    subsequence: chars.join(''),
    matchedPairs,
    allLcs: Array.from(allLcsSet),
  };

  // Naive tree
  const treeResult = buildNaiveTree<{ i: number; j: number }>({
    rootState: { i: b.length, j: a.length },
    getKey: (st) => makeCellId(st.i, st.j),
    getLabel: (st) => `L(${st.i},${st.j})`,
    getChildren: (st) => {
      if (st.i === 0 || st.j === 0) return [];
      if (b[st.i - 1] === a[st.j - 1]) {
        return [{ i: st.i - 1, j: st.j - 1 }];
      }
      return [
        { i: st.i - 1, j: st.j },
        { i: st.i, j: st.j - 1 },
      ];
    },
    maxNodes: 200,
  });

  return {
    algo: 'lcs',
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
      value: answerValue,
      cell: answerCell,
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

export const lcsModule: AlgoModule<LcsInput> = {
  id: 'lcs',
  name: 'Longest Common Subsequence',
  solve: solveLcs,
  validate: validateLcsInput,
  presets: LCS_PRESETS,
  breaks: LCS_BREAKS,
};
