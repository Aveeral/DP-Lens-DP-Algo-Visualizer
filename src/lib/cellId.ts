import type { CellId } from '../engine/types';

export function makeCellId(row: number, col: number): CellId {
  return `${row},${col}`;
}

export function parseCellId(id: CellId): { row: number; col: number } {
  const [rowStr, colStr] = id.split(',');
  const row = Number(rowStr);
  const col = Number(colStr);
  return {
    row: Number.isNaN(row) ? 0 : row,
    col: Number.isNaN(col) ? 0 : col,
  };
}
