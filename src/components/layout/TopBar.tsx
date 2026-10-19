import React from 'react';
import { HelpCircle, Monitor, Moon, Sun, Minimize2, Maximize2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { ModeBar } from './ModeBar';
import type { AlgoId } from '../../engine/types';

interface AlgoTab {
  id: AlgoId;
  label: string;
}

const ALGOS: AlgoTab[] = [
  { id: 'binomial', label: 'Binomial C(n, k)' },
  { id: 'mcm', label: 'Matrix Chain (MCM)' },
  { id: 'lcs', label: 'Longest Common Subsequence' },
  { id: 'knapsack', label: '0/1 Knapsack' },
];

export const TopBar: React.FC = () => {
  const currentAlgo = useAppStore((state) => state.algo);
  const setAlgo = useAppStore((state) => state.setAlgo);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const projector = useAppStore((state) => state.projector);
  const toggleProjector = useAppStore((state) => state.toggleProjector);
  const focus = useAppStore((state) => state.focus);
  const toggleFocus = useAppStore((state) => state.toggleFocus);
  const toggleHelp = useAppStore((state) => state.toggleHelp);

  return (
    <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      {/* Brand & Algorithm Navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-white font-mono font-bold text-sm shadow-sm">
            DP
          </div>
          <span className="font-sans font-semibold text-base tracking-tight text-ink">
            DP Lens
          </span>
        </div>

        {/* Algorithm Tabs */}
        <nav className="flex items-center gap-1">
          {ALGOS.map((algo) => (
            <button
              key={algo.id}
              type="button"
              onClick={() => setAlgo(algo.id)}
              className={`rounded-control px-3 py-1.5 text-xs font-medium transition-colors ${
                currentAlgo === algo.id
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mode Bar */}
      <ModeBar />

      {/* Quick Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme (Shift+D)`}
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
        </button>

        <button
          type="button"
          onClick={toggleProjector}
          className={`flex h-8 w-8 items-center justify-center rounded-control border transition-colors ${
            projector
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-border text-ink-muted hover:bg-surface-2 hover:text-ink'
          }`}
          title="Projector Mode (Shift+P)"
        >
          <Monitor size={15} />
        </button>

        <button
          type="button"
          onClick={toggleFocus}
          className={`flex h-8 w-8 items-center justify-center rounded-control border transition-colors ${
            focus
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-border text-ink-muted hover:bg-surface-2 hover:text-ink'
          }`}
          title="Focus Mode (Shift+F - toggles inputs panel)"
        >
          {focus ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
        </button>

        <button
          type="button"
          onClick={toggleHelp}
          className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={15} />
        </button>
      </div>
    </header>
  );
};
