import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useAppStore } from '../../store';

export const ShortcutHelp: React.FC = () => {
  const helpOpen = useAppStore((state) => state.helpOpen);
  const setHelpOpen = useAppStore((state) => state.setHelpOpen);

  if (!helpOpen) return null;

  const shortcuts = [
    { key: '→ / PageDown', desc: 'Step forward (Presentation clicker "next")' },
    { key: '← / PageUp', desc: 'Step back (Presentation clicker "back")' },
    { key: 'Space', desc: 'Play / Pause stepping' },
    { key: 'Home / End', desc: 'Jump to first / last step' },
    { key: '1, 2, 3, 4', desc: 'Switch algorithm (Binomial, MCM, LCS, Knapsack)' },
    { key: 'L', desc: 'Switch to Learn Mode' },
    { key: 'F, P, O, B, V', desc: 'Fold, Predict, Order, Break, Vote modes' },
    { key: 'Esc', desc: 'Clear cell selection / close overlays / back to Learn' },
    { key: 'Shift + P', desc: 'Toggle Projector Mode (large type, high contrast)' },
    { key: 'Shift + F', desc: 'Toggle Focus Mode (hide input sidebar)' },
    { key: 'Shift + D', desc: 'Toggle Dark / Light theme' },
    { key: '?', desc: 'Open / close this shortcut helper' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-panel border border-border bg-surface p-6 shadow-float">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-accent" />
            <h3 className="font-sans text-base font-semibold text-ink">
              Keyboard & Clicker Shortcuts
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-control bg-surface-2/60 px-3 py-2 text-xs"
            >
              <span className="text-ink font-medium">{item.desc}</span>
              <kbd className="rounded border border-border bg-surface px-2 py-0.5 font-mono text-xs font-semibold text-accent shadow-xs shrink-0 ml-3">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={() => setHelpOpen(false)}
            className="rounded-control bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
