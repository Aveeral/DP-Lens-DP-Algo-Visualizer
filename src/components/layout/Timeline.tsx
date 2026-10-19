import React from 'react';
import { RotateCcw, SkipBack, Play, Pause, SkipForward, FastForward } from 'lucide-react';
import { useAppStore } from '../../store';
import { useTrace } from '../../store/useTrace';

export const Timeline: React.FC = () => {
  const stepIndex = useAppStore((state) => state.stepIndex);
  const setStepIndex = useAppStore((state) => state.setStepIndex);
  const playing = useAppStore((state) => state.playing);
  const setPlaying = useAppStore((state) => state.setPlaying);
  const speed = useAppStore((state) => state.speed);
  const setSpeed = useAppStore((state) => state.setSpeed);

  const { trace } = useTrace();
  const totalSteps = trace.steps.length;

  const handleStepToStart = () => {
    setPlaying(false);
    setStepIndex(-1);
  };

  const handleStepBack = () => {
    setPlaying(false);
    setStepIndex(Math.max(-1, stepIndex - 1));
  };

  const handleStepForward = () => {
    setPlaying(false);
    setStepIndex(Math.min(totalSteps - 1, stepIndex + 1));
  };

  const handleJumpToEnd = () => {
    setPlaying(false);
    setStepIndex(totalSteps - 1);
  };

  const handlePlayPause = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (stepIndex >= totalSteps - 1) {
        setStepIndex(0);
      }
      setPlaying(true);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaying(false);
    setStepIndex(parseInt(e.target.value, 10));
  };

  // Current step number
  const currentStepNum = stepIndex + 1;

  return (
    <footer className="flex h-16 w-full shrink-0 items-center justify-between border-t border-border bg-surface px-6">
      {/* Playback action controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleStepToStart}
          className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          title="Step to start (Home)"
        >
          <RotateCcw size={14} />
        </button>

        <button
          type="button"
          onClick={handleStepBack}
          disabled={stepIndex <= -1}
          className={`flex h-8 w-8 items-center justify-center rounded-control border border-border transition-colors ${
            stepIndex <= -1
              ? 'text-ink-muted/30 cursor-not-allowed'
              : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
          }`}
          title="Step back (← or PageUp)"
        >
          <SkipBack size={14} />
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          className="flex h-9 w-9 items-center justify-center rounded-control bg-accent text-white hover:opacity-90 shadow-sm transition-opacity"
          title={playing ? 'Pause (Space)' : 'Play (Space)'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={handleStepForward}
          disabled={stepIndex >= totalSteps - 1}
          className={`flex h-8 w-8 items-center justify-center rounded-control border border-border transition-colors ${
            stepIndex >= totalSteps - 1
              ? 'text-ink-muted/30 cursor-not-allowed'
              : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
          }`}
          title="Step forward (→ or PageDown)"
        >
          <SkipForward size={14} />
        </button>

        <button
          type="button"
          onClick={handleJumpToEnd}
          className="flex h-8 w-8 items-center justify-center rounded-control border border-border text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors"
          title="Jump to end (End)"
        >
          <FastForward size={14} />
        </button>
      </div>

      {/* Scrubber slider track */}
      <div className="flex flex-1 items-center gap-4 px-8 max-w-2xl">
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min={-1}
            max={totalSteps - 1}
            value={stepIndex}
            onChange={handleScrubberChange}
            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-accent focus:outline-none"
          />
        </div>

        <span className="shrink-0 font-mono text-xs font-medium text-ink-muted w-28 text-right">
          {stepIndex === -1 ? 'Empty Grid' : `Step ${currentStepNum} of ${totalSteps}`}
        </span>
      </div>

      {/* Speed Chips */}
      <div className="flex items-center gap-1 rounded-control bg-surface-2 p-1">
        {([0.5, 1, 2] as const).map((spd) => (
          <button
            key={spd}
            type="button"
            onClick={() => setSpeed(spd)}
            className={`rounded px-2.5 py-1 text-xs font-mono font-medium transition-all ${
              speed === spd
                ? 'bg-surface text-ink font-semibold shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {spd}×
          </button>
        ))}
      </div>
    </footer>
  );
};
