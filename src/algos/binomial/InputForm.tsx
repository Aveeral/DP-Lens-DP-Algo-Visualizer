import React from 'react';
import { useAppStore } from '../../store';
import { binomialModule } from '../../engine/binomial';

interface InputFormProps {
  error: string | null;
}

export const BinomialInputForm: React.FC<InputFormProps> = ({ error }) => {
  const input = useAppStore((state) => state.inputs.binomial);
  const setInput = useAppStore((state) => state.setInput);

  const handleNChange = (val: number) => {
    setInput('binomial', { ...input, n: val });
  };

  const handleKChange = (val: number) => {
    setInput('binomial', { ...input, k: val });
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = binomialModule.presets[presetIndex];
    if (preset) {
      setInput('binomial', preset.input);
    }
  };

  const handleRandom = () => {
    const n = Math.floor(Math.random() * 5) + 3; // 3 to 7
    const k = Math.floor(Math.random() * (n - 1)) + 1; // 1 to n-1
    setInput('binomial', { n, k });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Preset dropdown */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Presets
        </label>
        <select
          onChange={(e) => handlePresetSelect(Number(e.target.value))}
          className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-ink focus:border-accent focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a preset...
          </option>
          {binomialModule.presets.map((p, idx) => (
            <option key={p.name} value={idx}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Inputs for n and k */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="binomial-n" className="text-xs font-medium text-ink-muted">
            n (Total items)
          </label>
          <input
            id="binomial-n"
            type="number"
            min={0}
            max={10}
            value={input.n}
            onChange={(e) => handleNChange(parseInt(e.target.value, 10) || 0)}
            className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="binomial-k" className="text-xs font-medium text-ink-muted">
            k (Items to choose)
          </label>
          <input
            id="binomial-k"
            type="number"
            min={0}
            max={input.n}
            value={input.k}
            onChange={(e) => handleKChange(parseInt(e.target.value, 10) || 0)}
            className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Random button */}
      <button
        type="button"
        onClick={handleRandom}
        className="rounded-control border border-border bg-surface px-3 py-1 text-xs font-medium text-ink hover:bg-surface-2 transition-colors self-start"
      >
        Randomize
      </button>

      {/* Validation hint */}
      {error && (
        <div className="rounded border border-error/30 bg-error-soft px-2.5 py-1.5 text-xs text-error">
          {error}
        </div>
      )}
    </div>
  );
};
