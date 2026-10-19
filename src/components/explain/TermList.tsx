import React from 'react';
import { Check } from 'lucide-react';
import type { Step } from '../../engine/types';

interface TermListProps {
  step: Step | undefined;
}

export const TermList: React.FC<TermListProps> = ({ step }) => {
  if (!step || step.terms.length === 0) {
    return null;
  }

  const { terms, chosen } = step;

  return (
    <div className="rounded-panel border border-border bg-surface-2 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted mb-2">
        Evaluated Choices ({terms.length})
      </div>
      <div className="flex flex-col gap-1.5">
        {terms.map((term, idx) => {
          const isWinner = chosen === -1 || idx === chosen;

          return (
            <div
              key={`${term.label}-${idx}`}
              className={`flex items-center justify-between rounded px-2.5 py-1.5 font-mono text-xs transition-colors ${
                isWinner
                  ? 'border border-win/40 bg-win-soft/60 text-win font-semibold shadow-sm'
                  : 'border border-dashed border-border/60 bg-surface/80 text-ink-muted'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {isWinner && <Check size={13} className="shrink-0 text-win stroke-[3]" />}
                <span className="font-sans font-medium text-[11px] capitalize text-ink">
                  {term.label}:
                </span>
                <span className="truncate">{term.expr}</span>
              </div>
              <span className="shrink-0 font-bold ml-2">= {term.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
