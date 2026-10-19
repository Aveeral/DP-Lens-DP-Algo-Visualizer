import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { useTrace } from '../../store/useTrace';
import { DPTable } from '../table/DPTable';

export const Stage: React.FC = () => {
  const { trace } = useTrace();
  const [viewMode, setViewMode] = useState<'table' | 'split'>('table');

  const { answer } = trace;

  return (
    <main className="flex min-w-[560px] flex-1 flex-col bg-bg p-4 overflow-hidden">
      {/* Stage Header */}
      <div className="flex items-center justify-between pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-accent" />
          <span className="font-sans text-sm font-semibold text-ink">
            DP Table: {trace.rows} rows × {trace.cols} cols
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-2 py-0.5 text-[11px] font-mono text-ink-muted">
            Target: Cell [{answer.cell}] = <strong className="text-win">{answer.value}</strong>
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex rounded-control bg-surface border border-border p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded px-2.5 py-1 font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-accent-soft text-accent font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Table View
          </button>
          <button
            type="button"
            disabled
            title="Problem Picture view arrives in Phase 4"
            className="rounded px-2.5 py-1 font-medium text-ink-muted/40 cursor-not-allowed"
          >
            Picture (Phase 4)
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex flex-1 items-center justify-center rounded-panel border border-border bg-surface p-4 shadow-sm overflow-auto">
        <DPTable trace={trace} />
      </div>
    </main>
  );
};
