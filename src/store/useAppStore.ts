import { create } from 'zustand';
import type {
  AlgoId,
  BinomialInput,
  CellId,
  KnapsackInput,
  LcsInput,
  McmInput,
} from '../engine/types';
import { safeGetItem, safeSetItem } from '../lib/storage';

export type AppMode = 'learn' | 'fold' | 'predict' | 'order' | 'break' | 'vote';

export interface AppInputs {
  binomial: BinomialInput;
  mcm: McmInput;
  lcs: LcsInput;
  knapsack: KnapsackInput;
}

export interface PredictState {
  stops: number[];
  current: number;
  revealed: boolean;
  correct: number;
  asked: number;
}

export interface OrderState {
  filled: CellId[];
  blocked: CellId | null;
  blockedClicks: number;
}

export interface LessonStep {
  algo: AlgoId;
  input: unknown;
  mode: AppMode;
  options?: Record<string, unknown>;
}

export interface AppState {
  algo: AlgoId;
  inputs: AppInputs;
  mode: AppMode;
  stepIndex: number;
  playing: boolean;
  speed: 0.5 | 1 | 2;
  selectedCell: CellId | null;
  predict: PredictState;
  order: OrderState;
  breakId: string | null;
  foldPhase: 0 | 1 | 2 | 3;
  projector: boolean;
  focus: boolean;
  theme: 'light' | 'dark';
  helpOpen: boolean;
  lesson: { steps: LessonStep[]; current: number } | null;

  // Actions
  setAlgo: (algo: AlgoId) => void;
  setInput: <K extends AlgoId>(algo: K, input: AppInputs[K]) => void;
  setMode: (mode: AppMode) => void;
  setStepIndex: (idx: number) => void;
  setPlaying: (playing: boolean) => void;
  setSpeed: (speed: 0.5 | 1 | 2) => void;
  setSelectedCell: (cell: CellId | null) => void;
  setBreakId: (breakId: string | null) => void;
  setFoldPhase: (phase: 0 | 1 | 2 | 3) => void;
  toggleProjector: () => void;
  toggleFocus: () => void;
  toggleTheme: () => void;
  setHelpOpen: (open: boolean) => void;
  toggleHelp: () => void;
  resetOrder: () => void;
  setOrderFilled: (cells: CellId[]) => void;
  setOrderBlocked: (cell: CellId | null) => void;
}

const initialInputs: AppInputs = {
  binomial: { n: 4, k: 2 },
  mcm: { dims: [10, 30, 5, 60] },
  lcs: { a: 'ABCB', b: 'BDCB' },
  knapsack: {
    W: 5,
    items: [
      { id: 'item-1', name: 'Item 1', w: 2, v: 3 },
      { id: 'item-2', name: 'Item 2', w: 3, v: 4 },
      { id: 'item-3', name: 'Item 3', w: 3, v: 4 },
    ],
  },
};

const initialPredict: PredictState = {
  stops: [],
  current: 0,
  revealed: false,
  correct: 0,
  asked: 0,
};

const initialOrder: OrderState = {
  filled: [],
  blocked: null,
  blockedClicks: 0,
};

const initialTheme = safeGetItem<'light' | 'dark'>('dp-lens-theme', 'light');

export const useAppStore = create<AppState>((set) => ({
  algo: 'binomial',
  inputs: initialInputs,
  mode: 'learn',
  stepIndex: 9999, // default to full table on initial render
  playing: false,
  speed: 1,
  selectedCell: null,
  predict: initialPredict,
  order: initialOrder,
  breakId: null,
  foldPhase: 0,
  projector: false,
  focus: false,
  theme: initialTheme,
  helpOpen: false,
  lesson: null,

  setAlgo: (algo) =>
    set({
      algo,
      selectedCell: null,
      breakId: null,
      stepIndex: 9999, // Show full table for the new algorithm
      order: initialOrder,
    }),

  setInput: (algo, input) =>
    set((state) => ({
      inputs: {
        ...state.inputs,
        [algo]: input,
      },
    })),

  setMode: (mode) =>
    set({
      mode,
    }),

  setStepIndex: (stepIndex) => set({ stepIndex }),

  setPlaying: (playing) => set({ playing }),

  setSpeed: (speed) => set({ speed }),

  setSelectedCell: (selectedCell) => set({ selectedCell }),

  setBreakId: (breakId) => set({ breakId }),

  setFoldPhase: (foldPhase) => set({ foldPhase }),

  toggleProjector: () => set((state) => ({ projector: !state.projector })),

  toggleFocus: () => set((state) => ({ focus: !state.focus })),

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      safeSetItem('dp-lens-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),

  setHelpOpen: (helpOpen) => set({ helpOpen }),

  toggleHelp: () => set((state) => ({ helpOpen: !state.helpOpen })),

  resetOrder: () => set({ order: initialOrder }),

  setOrderFilled: (filled) =>
    set((state) => ({ order: { ...state.order, filled } })),

  setOrderBlocked: (blocked) =>
    set((state) => ({
      order: {
        ...state.order,
        blocked,
        blockedClicks: blocked ? state.order.blockedClicks + 1 : state.order.blockedClicks,
      },
    })),
}));
