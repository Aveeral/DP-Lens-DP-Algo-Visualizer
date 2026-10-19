import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store';
import { mcmModule } from '../../engine/mcm';

interface InputFormProps {
  error: string | null;
}

export const McmInputForm: React.FC<InputFormProps> = ({ error }) => {
  const input = useAppStore((state) => state.inputs.mcm);
  const setInput = useAppStore((state) => state.setInput);

  const [rawText, setRawText] = useState(input.dims.join(', '));

  useEffect(() => {
    setRawText(input.dims.join(', '));
  }, [input.dims]);

  const handleTextChange = (text: string) => {
    setRawText(text);
    const parsed = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => parseInt(s, 10))
      .filter((n) => !Number.isNaN(n));

    if (parsed.length >= 2) {
      setInput('mcm', { dims: parsed });
    }
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = mcmModule.presets[presetIndex];
    if (preset) {
      setInput('mcm', preset.input);
    }
  };

  const handleRandom = () => {
    const count = Math.floor(Math.random() * 3) + 4; // 4 to 6 dimensions (3 to 5 matrices)
    const randomDims = Array.from({ length: count }, () =>
      Math.floor(Math.random() * 8 + 1) * 5 // multiples of 5: 5, 10, 15, ..., 40
    );
    setInput('mcm', { dims: randomDims });
  };

  const numMatrices = Math.max(0, input.dims.length - 1);

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
          {mcmModule.presets.map((p, idx) => (
            <option key={p.name} value={idx}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dimensions comma separated input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted">
          Dimensions ({numMatrices} matrices)
        </label>
        <input
          type="text"
          value={rawText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="e.g. 10, 30, 5, 60"
          className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
        />
        <span className="text-[11px] text-ink-muted">
          Comma-separated list of 3 to 7 dimensions.
        </span>
      </div>

      {/* Matrices preview list */}
      <div className="flex flex-wrap gap-1.5 py-1">
        {input.dims.slice(0, -1).map((d, i) => (
          <span
            key={`matrix-${i}`}
            className="rounded bg-surface-2 border border-border px-1.5 py-0.5 font-mono text-[11px] text-ink"
          >
            A{i + 1}: {d}×{input.dims[i + 1]}
          </span>
        ))}
      </div>

      {/* Randomize button */}
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
