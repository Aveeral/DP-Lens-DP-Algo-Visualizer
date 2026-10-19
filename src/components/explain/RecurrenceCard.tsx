import React from 'react';
import type { AlgoId, Step } from '../../engine/types';

interface RecurrenceCardProps {
  algo: AlgoId;
  activeStep: Step | undefined;
}

const ALGO_GENERAL_FORMULAS: Record<AlgoId, string> = {
  binomial: 'C(i, j) = C(i-1, j-1) + C(i-1, j)',
  mcm: 'm[i][j] = min_{i<=k<j} { m[i][k] + m[k+1][j] + p_{i-1}p_k p_j }',
  lcs: 'L[i][j] = (b[i] == a[j]) ? L[i-1][j-1]+1 : max(up, left)',
  knapsack: 'V[i][c] = max(skip, take) = max(V[i-1][c], v_i + V[i-1][c - w_i])',
};

export const RecurrenceCard: React.FC<RecurrenceCardProps> = ({ algo, activeStep }) => {
  return (
    <div className="flex flex-col gap-2.5">
      {/* General recurrence relation */}
      <div className="rounded-panel border border-border bg-surface-2 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          General Recurrence
        </div>
        <div className="mt-1 font-mono text-xs text-accent font-medium leading-relaxed">
          {ALGO_GENERAL_FORMULAS[algo]}
        </div>
      </div>

      {/* Active step evaluation card */}
      {activeStep ? (
        <div className="rounded-panel border border-border bg-surface p-3 shadow-sm">
          <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
            <span className="font-sans text-xs font-semibold text-ink">
              Cell [{activeStep.cell}]
            </span>
            <span className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs font-bold text-accent">
              = {activeStep.result}
            </span>
          </div>

          <div className="mt-2.5 flex flex-col gap-1.5 font-mono text-[11px]">
            <div className="text-ink-muted">
              Formula: <span className="text-ink">{activeStep.formula}</span>
            </div>
            <div className="text-ink-muted leading-relaxed">
              Substituted:{' '}
              <span className="text-win font-semibold">{activeStep.substituted}</span>
            </div>
          </div>

          <div className="mt-2.5 rounded bg-surface-2 p-2.5 font-sans text-xs text-ink leading-relaxed">
            {activeStep.narration}
          </div>
        </div>
      ) : (
        <div className="rounded-panel border border-dashed border-border p-4 text-center text-xs text-ink-muted">
          Press Play or Step Forward to compute the first table cell.
        </div>
      )}
    </div>
  );
};
