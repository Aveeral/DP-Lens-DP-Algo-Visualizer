import React from 'react';
import { useAppStore, type AppMode } from '../../store';

interface ModeOption {
  id: AppMode;
  label: string;
  shortcut: string;
  enabled: boolean;
  comingIn: string;
}

const MODES: ModeOption[] = [
  { id: 'learn', label: 'Learn', shortcut: 'L', enabled: true, comingIn: 'Phase 3' },
  { id: 'fold', label: 'Fold', shortcut: 'F', enabled: false, comingIn: 'Phase 5' },
  { id: 'predict', label: 'Predict', shortcut: 'P', enabled: false, comingIn: 'Phase 6' },
  { id: 'order', label: 'Fill-Order', shortcut: 'O', enabled: false, comingIn: 'Phase 7' },
  { id: 'break', label: 'Break', shortcut: 'B', enabled: false, comingIn: 'Phase 8' },
  { id: 'vote', label: 'Vote', shortcut: 'V', enabled: false, comingIn: 'Phase 9' },
];

export const ModeBar: React.FC = () => {
  const currentMode = useAppStore((state) => state.mode);
  const setMode = useAppStore((state) => state.setMode);

  return (
    <div className="flex items-center gap-1 rounded-control bg-surface-2 p-1">
      {MODES.map((mode) => {
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            disabled={!mode.enabled}
            onClick={() => {
              if (mode.enabled) {
                setMode(mode.id);
              }
            }}
            title={mode.enabled ? `${mode.label} Mode (${mode.shortcut})` : `${mode.label} (${mode.comingIn})`}
            className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-medium transition-all ${
              isActive
                ? 'bg-surface text-accent shadow-sm font-semibold'
                : mode.enabled
                ? 'text-ink-muted hover:text-ink'
                : 'text-ink-muted/40 cursor-not-allowed'
            }`}
          >
            <span>{mode.label}</span>
            <kbd className="rounded border border-border bg-surface-2 px-1 text-[10px] text-ink-muted/70 font-mono">
              {mode.shortcut}
            </kbd>
          </button>
        );
      })}
    </div>
  );
};
