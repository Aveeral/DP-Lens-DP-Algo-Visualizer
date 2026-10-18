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
  chosen: number; // index into terms (winner), or -1 for sum/base
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
  pictureData?: unknown;
}

export type Variant = 'correct' | string; // break ids from B5, e.g. 'knapsack-reuse'

export interface BreakDef {
  id: string;
  name: string;
  description: string;
  brokenFormula: string;
}

export interface Preset<T = unknown> {
  name: string;
  input: T;
  description: string;
}

export interface AlgoModule<T = unknown> {
  id: AlgoId;
  name: string;
  solve: (input: T, variant?: Variant) => Trace;
  validate: (input: T) => string | null;
  presets: Preset<T>[];
  breaks: BreakDef[];
}

// Algorithm-specific input and solution types
export interface BinomialInput {
  n: number;
  k: number;
}

export interface McmInput {
  dims: number[];
}

export interface BracketTreeNode {
  i: number;
  j: number;
  k?: number;
  name?: string;
  left?: BracketTreeNode;
  right?: BracketTreeNode;
}

export interface McmSolution {
  bracketed: string;
  bracketTree: BracketTreeNode;
}

export interface LcsInput {
  a: string;
  b: string;
}

export interface LcsSolution {
  subsequence: string;
  matchedPairs: [number, number][]; // [indexInA, indexInB] (0-indexed)
  allLcs: string[];
}

export interface KnapsackItem {
  id: string;
  name: string;
  w: number;
  v: number;
}

export interface KnapsackInput {
  items: KnapsackItem[];
  W: number;
}

export interface KnapsackSolution {
  items: KnapsackItem[];
  totalWeight: number;
  totalValue: number;
  hasTie: boolean;
}
