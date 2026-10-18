export type AlgoId = 'binomial' | 'mcm' | 'lcs' | 'knapsack';
export type CellId = string; // "r,c" e.g. "3,5"

export interface Cell {
  id: CellId;
  row: number;
  col: number;
  value: number | null; // null = not computed in this trace
  isBase: boolean; // base case (row 0, col 0, diagonal ...)
}

export interface Term { // one candidate inside a max/min/sum
  label: string; // "skip", "take", "k = 2", "diagonal"
  sources: CellId[]; // cells this term reads
  expr: string; // "4 + V[2][2]"
  value: number; // 7
}

export interface Step {
  index: number;
  cell: CellId; // cell being decided
  terms: Term[]; // all candidates considered
  chosen: number; // index into terms (winner)
  result: number; // value written
  formula: string; // general recurrence, LaTeX-free plain text
  substituted: string; // with real numbers
  narration: string; // plain-English sentence for the panel
  isDecision: boolean; // good Predict-Mode candidate
}

export interface TreeNode { // naive recursion tree (for Fold)
  id: string; // unique per occurrence
  key: CellId; // subproblem identity (duplicates share key)
  label: string; // "C(3,1)"
  children: string[];
  depth: number;
}

export interface Trace {
  algo: AlgoId;
  rows: number;
  cols: number;
  rowLabels: string[];
  colLabels: string[];
  cells: Record<CellId, Cell>;
  steps: Step[]; // in correct fill order
  deps: Record<CellId, CellId[]>; // full dependency map (Fill-Order, Lens)
  tree: { nodes: Record<string, TreeNode>; root: string; truncated: boolean };
  answer: { value: number; cell: CellId };
  traceback: { path: CellId[]; solution: unknown }; // items, subsequence, bracketing
  stats: { naiveCalls: number; uniqueSubproblems: number };
}

export type Variant = 'correct' | string; // break ids from B5, e.g. 'knapsack-reuse'

export interface BreakDef {
  id: string;
  label: string;
  description: string;
}

export interface Preset<T = unknown> {
  name: string;
  input: T;
  description: string;
}
