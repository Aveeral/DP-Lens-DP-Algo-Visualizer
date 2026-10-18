export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '';
  return n.toLocaleString();
}
