import type { CellId } from '../engine/types';

export function makeCellId(row: number, col: number): CellId {
  return `${row},${col}`;
}

export function parseCellId(id: CellId): { row: number; col: number } {
  const [rowStr, colStr] = id.split(',');
  return {
    row: Number(rowStr ?? 0),
    col: Number(colStr ?? 0),
  };
}
