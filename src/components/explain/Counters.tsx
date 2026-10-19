import React from 'react';
import type { Trace } from '../../engine/types';
import { formatNumber } from '../../lib/format';

interface CountersProps {
  trace: Trace;
  stepIndex: number;
}

export const Counters: React.FC<CountersProps> = ({ trace, stepIndex }) => {
  const { naiveCalls, uniqueSubproblems } = trace.stats;
  const totalSteps = trace.steps.length;
  const currentStep = Math.max(0, Math.min(totalSteps, stepIndex + 1));

  return (
    <div className="rounded-panel border border-border bg-surface-2 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
        Execution & Calls
      </div>

      <div className="flex flex-col gap-1.5 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Progress:</span>
          <span className="font-semibold text-ink">
            {currentStep} / {totalSteps} cells
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Naive Calls:</span>
          <span className="font-semibold text-error">
            {formatNumber(naiveCalls)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Unique Cells:</span>
          <span className="font-semibold text-win">
            {formatNumber(uniqueSubproblems)}
          </span>
        </div>
      </div>
    </div>
  );
};
