import type { CellId } from './types';

export interface CanFillResult {
  ok: boolean;
  missing: CellId[];
}

/**
 * Checks whether a cell can be filled given currently filled cells and the dependency graph.
 */
export function canFill(
  cell: CellId,
  filled: Set<CellId> | CellId[],
  deps: Record<CellId, CellId[]>
): CanFillResult {
  const filledSet = filled instanceof Set ? filled : new Set(filled);
  const cellDeps = deps[cell] ?? [];

  const missing: CellId[] = [];
  for (const dep of cellDeps) {
    if (!filledSet.has(dep)) {
      missing.push(dep);
    }
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}

/**
 * Finds all cells that are not yet filled but whose dependencies are completely satisfied.
 */
export function getAvailableCells(
  allCells: CellId[],
  filled: Set<CellId> | CellId[],
  deps: Record<CellId, CellId[]>
): CellId[] {
  const filledSet = filled instanceof Set ? filled : new Set(filled);
  return allCells.filter((cell) => !filledSet.has(cell) && canFill(cell, filledSet, deps).ok);
}
