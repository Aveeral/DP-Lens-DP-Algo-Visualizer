import React, { useEffect, useState } from 'react';
import type { Step } from '../../engine/types';

interface DependencyArrowsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  activeStep: Step | undefined;
}

interface ArrowLine {
  id: string;
  sourceId: string;
  targetId: string;
  pathD: string;
  isWinner: boolean;
  label: string;
}

export const DependencyArrows: React.FC<DependencyArrowsProps> = ({
  containerRef,
  activeStep,
}) => {
  const [arrows, setArrows] = useState<ArrowLine[]>([]);

  useEffect(() => {
    if (!activeStep || !containerRef.current || activeStep.terms.length === 0) {
      setArrows([]);
      return;
    }

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const targetEl = container.querySelector(`[data-cell-id="${activeStep.cell}"]`);
    if (!targetEl) {
      setArrows([]);
      return;
    }

    const targetRect = targetEl.getBoundingClientRect();
    const targetX = targetRect.left - containerRect.left + targetRect.width / 2;
    const targetY = targetRect.top - containerRect.top + targetRect.height / 2;

    const newArrows: ArrowLine[] = [];

    activeStep.terms.forEach((term, termIdx) => {
      const isWinner = activeStep.chosen === -1 || termIdx === activeStep.chosen;

      term.sources.forEach((sourceId) => {
        const sourceEl = container.querySelector(`[data-cell-id="${sourceId}"]`);
        if (!sourceEl) return;

        const sourceRect = sourceEl.getBoundingClientRect();
        const sourceX = sourceRect.left - containerRect.left + sourceRect.width / 2;
        const sourceY = sourceRect.top - containerRect.top + sourceRect.height / 2;

        // Calculate offset vector so arrow stops at edge of target cell
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist === 0) return;

        // Stop 18px before target center (roughly at cell border)
        const stopDist = Math.max(0, dist - 18);
        const endX = sourceX + (dx / dist) * stopDist;
        const endY = sourceY + (dy / dist) * stopDist;

        // Slight quadratic curve so arrows do not overlap text
        let ctrlX = (sourceX + endX) / 2;
        let ctrlY = (sourceY + endY) / 2;

        if (Math.abs(dx) < 5) {
          // Mostly vertical: curve slightly sideways
          ctrlX += 16;
        } else if (Math.abs(dy) < 5) {
          // Mostly horizontal: curve slightly upward
          ctrlY -= 16;
        } else {
          // Diagonal: slight perpendicular curve
          const normX = -dy / dist;
          const normY = dx / dist;
          ctrlX += normX * 12;
          ctrlY += normY * 12;
        }

        const pathD = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

        newArrows.push({
          id: `${sourceId}->${activeStep.cell}-${termIdx}`,
          sourceId,
          targetId: activeStep.cell,
          pathD,
          isWinner,
          label: term.label,
        });
      });
    });

    setArrows(newArrows);
  }, [activeStep, containerRef]);

  if (arrows.length === 0) {
    return null;
  }

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible z-10"
      style={{ minHeight: '100%', minWidth: '100%' }}
    >
      <defs>
        {/* Amber arrowhead for winning branch */}
        <marker
          id="arrow-win"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--source)" />
        </marker>

        {/* Faint gray arrowhead for losing branch */}
        <marker
          id="arrow-lose"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--lose)" />
        </marker>
      </defs>

      {arrows.map((arr) => (
        <g key={arr.id}>
          <path
            d={arr.pathD}
            fill="none"
            stroke={arr.isWinner ? 'var(--source)' : 'var(--lose)'}
            strokeWidth={arr.isWinner ? 2.5 : 1.5}
            strokeDasharray={arr.isWinner ? 'none' : '4 4'}
            markerEnd={arr.isWinner ? 'url(#arrow-win)' : 'url(#arrow-lose)'}
            opacity={arr.isWinner ? 1 : 0.65}
            className="transition-all duration-200"
          />
        </g>
      ))}
    </svg>
  );
};
