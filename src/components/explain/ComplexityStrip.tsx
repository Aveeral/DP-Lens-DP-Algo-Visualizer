import React from 'react';
import type { AlgoId } from '../../engine/types';

interface ComplexityStripProps {
  algo: AlgoId;
}

interface ComplexitySpec {
  naiveTime: string;
  dpTime: string;
  naiveSpace: string;
  dpSpace: string;
}

const COMPLEXITIES: Record<AlgoId, ComplexitySpec> = {
  binomial: {
    naiveTime: 'O(2ⁿ)',
    dpTime: 'O(n · k)',
    naiveSpace: 'O(n)',
    dpSpace: 'O(n · k)',
  },
  mcm: {
    naiveTime: 'O(2ⁿ)',
    dpTime: 'O(n³)',
    naiveSpace: 'O(n)',
    dpSpace: 'O(n²)',
  },
  lcs: {
    naiveTime: 'O(2ⁿ⁺ᵐ)',
    dpTime: 'O(n · m)',
    naiveSpace: 'O(n + m)',
    dpSpace: 'O(n · m)',
  },
  knapsack: {
    naiveTime: 'O(2ⁿ)',
    dpTime: 'O(n · W)',
    naiveSpace: 'O(n)',
    dpSpace: 'O(n · W)',
  },
};

export const ComplexityStrip: React.FC<ComplexityStripProps> = ({ algo }) => {
  const spec = COMPLEXITIES[algo] ?? {
    naiveTime: 'O(2ⁿ)',
    dpTime: 'O(table)',
    naiveSpace: 'O(n)',
    dpSpace: 'O(table)',
  };

  return (
    <div className="rounded-panel border border-border bg-surface-2 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
        Complexity Strip
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-ink-muted uppercase">Time</span>
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-muted">Naive:</span>
            <span className="text-error font-medium">{spec.naiveTime}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-muted">DP:</span>
            <span className="text-win font-semibold">{spec.dpTime}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-l border-border/60 pl-2">
          <span className="text-[10px] text-ink-muted uppercase">Space</span>
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-muted">Naive:</span>
            <span className="text-ink-muted font-medium">{spec.naiveSpace}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-ink-muted">DP:</span>
            <span className="text-win font-semibold">{spec.dpSpace}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
