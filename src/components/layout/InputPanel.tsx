import React from 'react';
import { useAppStore } from '../../store';
import { useTrace } from '../../store/useTrace';
import { BinomialInputForm } from '../../algos/binomial/InputForm';
import { McmInputForm } from '../../algos/mcm/InputForm';
import { LcsInputForm } from '../../algos/lcs/InputForm';
import { KnapsackInputForm } from '../../algos/knapsack/InputForm';
import { formatNumber } from '../../lib/format';

export const InputPanel: React.FC = () => {
  const algo = useAppStore((state) => state.algo);
  const focus = useAppStore((state) => state.focus);
  const { trace, validationError } = useTrace();

  if (focus) {
    return null;
  }

  const { naiveCalls, uniqueSubproblems } = trace.stats;

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-surface p-4 overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Input Parameters
        </h2>
      </div>

      <div className="mt-4 flex flex-1 flex-col justify-between gap-4">
        {/* Dynamic Input Form */}
        <div className="flex flex-col gap-4">
          {algo === 'binomial' && <BinomialInputForm error={validationError} />}
          {algo === 'mcm' && <McmInputForm error={validationError} />}
          {algo === 'lcs' && <LcsInputForm error={validationError} />}
          {algo === 'knapsack' && <KnapsackInputForm error={validationError} />}
        </div>

        {/* Live Counters */}
        <div className="rounded-panel border border-border bg-surface-2 p-3 mt-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
            Subproblem Analysis
          </div>
          <div className="flex flex-col gap-1.5 font-mono text-xs">
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
            {naiveCalls > uniqueSubproblems && (
              <div className="mt-1 pt-1 border-t border-border/60 text-[11px] text-ink-muted font-sans">
                Recursion repeated subproblems{' '}
                <strong className="text-ink">
                  {Math.round(naiveCalls / Math.max(1, uniqueSubproblems))}×
                </strong>{' '}
                times.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
