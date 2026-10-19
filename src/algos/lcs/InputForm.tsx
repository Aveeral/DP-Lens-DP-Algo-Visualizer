import React from 'react';
import { useAppStore } from '../../store';
import { lcsModule } from '../../engine/lcs';

interface InputFormProps {
  error: string | null;
}

export const LcsInputForm: React.FC<InputFormProps> = ({ error }) => {
  const input = useAppStore((state) => state.inputs.lcs);
  const setInput = useAppStore((state) => state.setInput);

  const handleAChange = (val: string) => {
    setInput('lcs', { ...input, a: val.toUpperCase().slice(0, 8) });
  };

  const handleBChange = (val: string) => {
    setInput('lcs', { ...input, b: val.toUpperCase().slice(0, 8) });
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = lcsModule.presets[presetIndex];
    if (preset) {
      setInput('lcs', preset.input);
    }
  };

  const handleRandom = () => {
    const chars = ['A', 'B', 'C', 'D'];
    const lenA = Math.floor(Math.random() * 3) + 4; // 4 to 6
    const lenB = Math.floor(Math.random() * 3) + 4;
    const a = Array.from({ length: lenA }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const b = Array.from({ length: lenB }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setInput('lcs', { a, b });
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
          {lcsModule.presets.map((p, idx) => (
            <option key={p.name} value={idx}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Strings A and B */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted">
            String A (Columns, 1-8 chars)
          </label>
          <input
            type="text"
            maxLength={8}
            value={input.a}
            onChange={(e) => handleAChange(e.target.value)}
            placeholder="e.g. ABCBDAB"
            className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-sm tracking-wider uppercase text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-ink-muted">
            String B (Rows, 1-8 chars)
          </label>
          <input
            type="text"
            maxLength={8}
            value={input.b}
            onChange={(e) => handleBChange(e.target.value)}
            placeholder="e.g. BDCABA"
            className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-sm tracking-wider uppercase text-ink focus:border-accent focus:outline-none"
          />
        </div>
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
