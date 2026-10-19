import React from 'react';
import type { Cell } from '../../engine/types';
import { useAppStore } from '../../store';

interface DPCellProps {
  cell: Cell | undefined;
  isComputed: boolean;
  isCurrent: boolean;
  isSource: boolean;
  isAnswer: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  onClick?: () => void;
}

export const DPCell: React.FC<DPCellProps> = ({
  cell,
  isComputed,
  isCurrent,
  isSource,
  isAnswer,
  isSelected,
  isDimmed,
  onClick,
}) => {
  const projector = useAppStore((state) => state.projector);

  // Cell sizes from B6: 48x40 normal, 64x52 in projector
  const sizeClasses = projector
    ? 'w-16 h-[52px] text-[22px]'
    : 'w-12 h-10 text-[16px]';

  if (!cell || cell.value === null) {
    return (
      <div
        className={`${sizeClasses} flex items-center justify-center rounded-cell border border-dashed border-border/30 bg-surface-2/20`}
      >
        <span className="text-ink-muted/20 text-xs select-none">·</span>
      </div>
    );
  }

  const { id, value, isBase } = cell;

  // Uncomputed cell placeholder
  if (!isComputed) {
    return (
      <div
        data-cell-id={id}
        className={`${sizeClasses} flex items-center justify-center rounded-cell border border-border/60 bg-surface/40 font-mono`}
      >
        <span className="text-ink-muted/30 text-xs select-none">·</span>
      </div>
    );
  }

  // Visual state styling
  let borderClass = 'border-border';
  let bgClass = isBase ? 'bg-surface-2' : 'bg-surface';
  let textClass = isBase ? 'text-ink-muted' : 'text-ink';
  let ringClass = '';

  if (isSelected) {
    borderClass = 'border-2 border-accent';
    ringClass = 'ring-2 ring-accent-soft shadow-md z-20';
  } else if (isCurrent) {
    borderClass = 'border-2 border-accent';
    bgClass = 'bg-accent-soft/40';
    textClass = 'text-accent font-bold';
    ringClass = 'ring-2 ring-accent/30 animate-pulse z-20';
  } else if (isSource) {
    borderClass = 'border-2 border-source';
    bgClass = 'bg-source-soft';
    textClass = 'text-source font-semibold';
    ringClass = 'ring-1 ring-source/40 z-20';
  } else if (isAnswer) {
    borderClass = 'border-2 border-win';
    bgClass = 'bg-win-soft/30';
  }

  const opacityClass = isDimmed && !isSelected && !isSource && !isCurrent ? 'opacity-40' : 'opacity-100';

  return (
    <button
      type="button"
      data-cell-id={id}
      onClick={onClick}
      className={`relative ${sizeClasses} flex items-center justify-center rounded-cell border ${borderClass} ${bgClass} ${ringClass} ${opacityClass} font-mono font-medium transition-all duration-200 hover:border-accent hover:shadow-sm focus:outline-none`}
    >
      <span className={`${textClass} font-mono tabular-nums leading-none`}>
        {value}
      </span>
      {isBase && (
        <span
          className="absolute bottom-0.5 right-1 text-[8px] font-sans uppercase font-bold text-ink-muted/50 select-none"
          title="Base Case"
        >
          B
        </span>
      )}
    </button>
  );
};
