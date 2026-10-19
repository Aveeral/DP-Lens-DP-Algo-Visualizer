import React, { useMemo, useRef } from 'react';
import type { Trace } from '../../engine/types';
import { makeCellId } from '../../lib/cellId';
import { useAppStore } from '../../store';
import { DPCell } from './DPCell';
import { DependencyArrows } from './DependencyArrows';

interface DPTableProps {
  trace: Trace;
}

export const DPTable: React.FC<DPTableProps> = ({ trace }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCell = useAppStore((state) => state.selectedCell);
  const setSelectedCell = useAppStore((state) => state.setSelectedCell);
  const stepIndex = useAppStore((state) => state.stepIndex);
  const projector = useAppStore((state) => state.projector);

  const { rows, cols, rowLabels, colLabels, cells, answer, steps } = trace;

  // Map of cell ID -> step index
  const cellStepMap = useMemo(() => {
    const map = new Map<string, number>();
    steps.forEach((s) => map.set(s.cell, s.index));
    return map;
  }, [steps]);

  // Current step during playback
  const currentStep = stepIndex >= 0 && stepIndex < steps.length ? steps[stepIndex] : undefined;

  // Active step for Dependency Lens (selected cell takes priority)
  const activeStep = useMemo(() => {
    if (selectedCell) {
      return steps.find((s) => s.cell === selectedCell);
    }
    return currentStep;
  }, [selectedCell, currentStep, steps]);

  // Set of source cell IDs for the active step
  const sourceCellSet = useMemo(() => {
    if (!activeStep) return new Set<string>();
    return new Set(activeStep.terms.flatMap((t) => t.sources));
  }, [activeStep]);

  const isLensActive = Boolean(selectedCell || (currentStep && currentStep.terms.length > 0));

  const headerTextSize = projector ? 'text-[14px]' : 'text-[11px]';
  const rowHeaderWidth = projector ? 'w-24' : 'w-16';

  const handleCellClick = (cellId: string, isComputed: boolean) => {
    if (!isComputed) return;
    if (selectedCell === cellId) {
      setSelectedCell(null); // Toggle off
    } else {
      setSelectedCell(cellId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center p-4 overflow-visible max-w-full max-h-full"
    >
      {/* Dependency Lens SVG Arrows */}
      <DependencyArrows containerRef={containerRef} activeStep={activeStep} />

      <div className="inline-block rounded-panel border border-border bg-surface p-4 shadow-sm z-0">
        {/* Top Header Row with Col Labels */}
        <div className="flex items-center gap-1 pb-1">
          <div
            className={`${rowHeaderWidth} shrink-0 text-center font-sans ${headerTextSize} font-semibold uppercase text-ink-muted/60`}
          >
            i \ j
          </div>

          <div className="flex gap-1">
            {Array.from({ length: cols }, (_, c) => (
              <div
                key={`col-${c}`}
                className={`${
                  projector ? 'w-16' : 'w-12'
                } text-center font-sans ${headerTextSize} font-medium text-ink-muted tracking-tight truncate`}
                title={colLabels[c]}
              >
                {colLabels[c] ?? c}
              </div>
            ))}
          </div>
        </div>

        {/* Rows with Row Labels and Cells */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: rows }, (_, r) => (
            <div key={`row-${r}`} className="flex items-center gap-1">
              <div
                className={`${rowHeaderWidth} shrink-0 pr-2 text-right font-sans ${headerTextSize} font-medium text-ink-muted tracking-tight truncate`}
                title={rowLabels[r]}
              >
                {rowLabels[r] ?? r}
              </div>

              <div className="flex gap-1">
                {Array.from({ length: cols }, (_, c) => {
                  const cellId = makeCellId(r, c);
                  const cell = cells[cellId];

                  const cellStepIdx = cellStepMap.get(cellId);
                  const isComputed = cellStepIdx !== undefined ? stepIndex >= cellStepIdx : false;

                  const isCurrent = currentStep?.cell === cellId;
                  const isSource = sourceCellSet.has(cellId);
                  const isAnswer = answer.cell === cellId && isComputed;
                  const isSelected = selectedCell === cellId;

                  return (
                    <DPCell
                      key={cellId}
                      cell={cell}
                      isComputed={isComputed}
                      isCurrent={isCurrent}
                      isSource={isSource}
                      isAnswer={isAnswer}
                      isSelected={isSelected}
                      isDimmed={isLensActive}
                      onClick={() => handleCellClick(cellId, isComputed)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
