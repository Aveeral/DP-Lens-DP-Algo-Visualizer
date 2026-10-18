import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  GitMerge,
  HelpCircle,
  Shuffle,
  Play,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeAlgo, setActiveAlgo] = useState('binomial');
  const [activeMode, setActiveMode] = useState('learn');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const algos = [
    { id: 'binomial', label: 'Binomial C(n, k)' },
    { id: 'mcm', label: 'Matrix Chain (MCM)' },
    { id: 'lcs', label: 'Longest Common Subsequence' },
    { id: 'knapsack', label: '0/1 Knapsack' },
  ];

  const modes = [
    { id: 'learn', label: 'Learn', shortcut: 'L' },
    { id: 'fold', label: 'Fold', shortcut: 'F' },
    { id: 'predict', label: 'Predict', shortcut: 'P' },
    { id: 'order', label: 'Fill-Order', shortcut: 'O' },
    { id: 'break', label: 'Break', shortcut: 'B' },
    { id: 'vote', label: 'Vote', shortcut: 'V' },
  ];

  return (
    <div className="flex h-screen w-screen flex-col bg-bg text-ink overflow-hidden select-none">
      {/* 1. TOP BAR (56px) */}
      <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-control bg-accent text-white font-mono font-bold text-sm">
              DP
            </div>
            <span className="font-sans font-semibold text-base tracking-tight text-ink">
              DP Lens
            </span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
              Phase 0 Scaffold
            </span>
          </div>

          {/* Algorithm Tabs */}
          <nav className="flex items-center gap-1">
            {algos.map((algo) => (
              <button
                key={algo.id}
                onClick={() => setActiveAlgo(algo.id)}
                className={`rounded-control px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeAlgo === algo.id
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {algo.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 rounded-control bg-surface-2 p-1">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-xs font-medium transition-colors ${
                activeMode === mode.id
                  ? 'bg-surface text-accent shadow-sm font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>{mode.label}</span>
              <kbd className="rounded border border-border bg-surface-2 px-1 text-[10px] text-ink-muted font-mono">
                {mode.shortcut}
              </kbd>
            </button>
          ))}
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Theme (Shift+D)`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
            title="Projector Mode (Shift+P)"
          >
            <Monitor size={16} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        {/* 2. LEFT: INPUT PANEL (280px) */}
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-surface p-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Input Parameters
            </h2>
            <div className="flex gap-1">
              <button
                className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
                title="Random input"
              >
                <Shuffle size={14} />
              </button>
              <button
                className="rounded p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
                title="Reset preset"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 text-sm text-ink-muted">
            <div className="rounded-panel border border-border bg-surface-2 p-3">
              <span className="text-xs font-medium text-ink">Selected Algorithm:</span>
              <div className="mt-1 font-mono text-ink text-sm font-semibold capitalize">
                {activeAlgo}
              </div>
            </div>

            <div className="rounded-panel border border-dashed border-border p-4 text-center text-xs">
              Input forms for Binomial, MCM, LCS, and Knapsack will be wired in Phase 2.
            </div>

            {/* Live Counters Placeholder */}
            <div className="mt-auto rounded-panel border border-border bg-surface-2 p-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Subproblem Counter
              </div>
              <div className="mt-2 flex justify-between font-mono text-xs">
                <span>Naive Calls:</span>
                <span className="font-semibold text-error">—</span>
              </div>
              <div className="mt-1 flex justify-between font-mono text-xs">
                <span>Unique Subproblems:</span>
                <span className="font-semibold text-win">—</span>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. CENTER: STAGE (Flexible, min-w-[560px]) */}
        <main className="flex min-w-[560px] flex-1 flex-col bg-bg p-4 overflow-auto">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-accent" />
              <span className="font-sans text-sm font-semibold text-ink">
                Stage: Table / Picture View
              </span>
            </div>
            <div className="flex rounded-control bg-surface border border-border p-0.5 text-xs">
              <button className="rounded px-2.5 py-1 font-medium bg-accent-soft text-accent">
                Split View
              </button>
              <button className="rounded px-2.5 py-1 font-medium text-ink-muted hover:text-ink">
                Table Only
              </button>
              <button className="rounded px-2.5 py-1 font-medium text-ink-muted hover:text-ink">
                Picture Only
              </button>
            </div>
          </div>

          {/* Stage Canvas Area */}
          <div className="flex flex-1 items-center justify-center rounded-panel border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="font-sans text-base font-semibold text-ink">
                  Stage Ready (Phase 0)
                </h3>
                <p className="mt-1 max-w-sm text-xs text-ink-muted">
                  The DP Table, The Fold recursion tree layout, and algorithm-specific pictures
                  will render here in Phases 2, 4, and 5.
                </p>
              </div>
              <div className="mt-2 flex gap-2 text-xs font-mono">
                <span className="rounded bg-win-soft px-2 py-1 text-win font-semibold">
                  tokens.css active
                </span>
                <span className="rounded bg-source-soft px-2 py-1 text-source font-semibold">
                  chalkboard palette
                </span>
              </div>
            </div>
          </div>
        </main>

        {/* 4. RIGHT: EXPLANATION PANEL (340px) */}
        <aside className="flex w-[340px] shrink-0 flex-col border-l border-border bg-surface p-4 overflow-y-auto">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <GitMerge size={16} className="text-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Dependency Lens & Recurrence
            </h2>
          </div>

          <div className="mt-4 flex flex-col gap-4 text-xs">
            <div className="rounded-panel border border-border bg-surface-2 p-3">
              <div className="font-semibold text-ink">Recurrence Relation</div>
              <div className="mt-1 font-mono text-[13px] text-accent">
                {activeAlgo === 'binomial' && 'C(n, k) = C(n-1, k-1) + C(n-1, k)'}
                {activeAlgo === 'mcm' && 'm[i][j] = min { m[i][k] + m[k+1][j] + cost }'}
                {activeAlgo === 'lcs' && 'L[i][j] = match ? L[i-1][j-1]+1 : max(up, left)'}
                {activeAlgo === 'knapsack' && 'V[i][w] = max(skip, take)'}
              </div>
            </div>

            <div className="rounded-panel border border-dashed border-border p-4 text-center text-ink-muted">
              Substituted numbers, winning/losing term branches, and step narration will appear here in Phase 3.
            </div>

            <div className="mt-auto rounded-panel border border-border bg-surface-2 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Complexity Strip
              </div>
              <div className="mt-2 flex justify-between font-mono text-[11px]">
                <span>Naive Time:</span>
                <span className="text-error font-medium">O(2ⁿ)</span>
              </div>
              <div className="mt-1 flex justify-between font-mono text-[11px]">
                <span>DP Time:</span>
                <span className="text-win font-medium">O(n · k)</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 5. BOTTOM: TIMELINE (64px) */}
      <footer className="flex h-16 w-full shrink-0 items-center justify-between border-t border-border bg-surface px-6">
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
            title="Step to start"
          >
            <RotateCcw size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
            title="Step back (←)"
          >
            <SkipBack size={14} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-control bg-accent text-white hover:opacity-90"
            title="Play / Pause (Space)"
          >
            <Play size={16} className="ml-0.5" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink"
            title="Step forward (→)"
          >
            <SkipForward size={14} />
          </button>
        </div>

        {/* Scrubber track */}
        <div className="flex flex-1 items-center gap-4 px-8">
          <div className="relative flex-1 h-2 rounded-full bg-surface-2 border border-border overflow-hidden">
            <div className="h-full w-1/4 bg-accent rounded-full" />
          </div>
          <span className="font-mono text-xs font-medium text-ink-muted">
            Step 0 of 0
          </span>
        </div>

        {/* Speed toggle chips */}
        <div className="flex items-center gap-1 rounded-control bg-surface-2 p-1">
          {['0.5×', '1×', '2×'].map((spd, idx) => (
            <button
              key={spd}
              className={`rounded px-2 py-0.5 text-xs font-mono font-medium transition-colors ${
                idx === 1
                  ? 'bg-surface text-ink font-semibold shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {spd}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default App;
