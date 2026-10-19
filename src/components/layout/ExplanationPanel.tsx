import React, { useMemo } from 'react';
import { GitMerge, Trophy } from 'lucide-react';
import { useAppStore } from '../../store';
import { useTrace } from '../../store/useTrace';
import { RecurrenceCard } from '../explain/RecurrenceCard';
import { TermList } from '../explain/TermList';
import { Counters } from '../explain/Counters';
import { ComplexityStrip } from '../explain/ComplexityStrip';

export const ExplanationPanel: React.FC = () => {
  const algo = useAppStore((state) => state.algo);
  const selectedCell = useAppStore((state) => state.selectedCell);
  const stepIndex = useAppStore((state) => state.stepIndex);
  const { trace } = useTrace();

  const totalSteps = trace.steps.length;
  const isComplete = stepIndex >= totalSteps - 1;

  // Active step: inspected cell if selected, otherwise current playback step
  const activeStep = useMemo(() => {
    if (selectedCell) {
      return trace.steps.find((s) => s.cell === selectedCell);
    }
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      return trace.steps[stepIndex];
    }
    return undefined;
  }, [selectedCell, stepIndex, trace.steps, totalSteps]);

  return (
    <aside className="flex w-[340px] shrink-0 flex-col border-l border-border bg-surface p-4 overflow-y-auto">
      {/* Panel header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <GitMerge size={16} className="text-accent" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Dependency Lens
          </h2>
        </div>
        {selectedCell && (
          <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-mono text-accent">
            Inspecting [{selectedCell}]
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4 text-xs">
        {/* Recurrence & Substituted Formula */}
        <RecurrenceCard algo={algo} activeStep={activeStep} />

        {/* Evaluated Choices (Term List) */}
        <TermList step={activeStep} />

        {/* Final Answer Banner when table computation finishes */}
        {isComplete && (
          <div className="rounded-panel border border-win/40 bg-win-soft/50 p-3 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-win">
              <Trophy size={16} />
              <span>Optimal Result: {trace.answer.value}</span>
            </div>
            <p className="mt-1 text-[11px] text-ink-muted leading-relaxed font-mono">
              Computed at cell [{trace.answer.cell}] in {totalSteps} topological steps.
            </p>
          </div>
        )}

        {/* Live Counters */}
        <Counters trace={trace} stepIndex={stepIndex} />

        {/* Complexity Strip */}
        <div className="mt-auto">
          <ComplexityStrip algo={algo} />
        </div>
      </div>
    </aside>
  );
};
