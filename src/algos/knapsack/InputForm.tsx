import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { knapsackModule } from '../../engine/knapsack';
import type { KnapsackItem } from '../../engine/types';

interface InputFormProps {
  error: string | null;
}

export const KnapsackInputForm: React.FC<InputFormProps> = ({ error }) => {
  const input = useAppStore((state) => state.inputs.knapsack);
  const setInput = useAppStore((state) => state.setInput);

  const handleWChange = (val: number) => {
    setInput('knapsack', { ...input, W: Math.max(1, Math.min(10, val)) });
  };

  const handleItemChange = (index: number, field: 'name' | 'w' | 'v', val: string | number) => {
    const updated = input.items.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        [field]: val,
      };
    });
    setInput('knapsack', { ...input, items: updated });
  };

  const handleAddItem = () => {
    if (input.items.length >= 5) return;
    const nextIdx = input.items.length + 1;
    const newItem: KnapsackItem = {
      id: `item-${Date.now()}`,
      name: `Item ${nextIdx}`,
      w: Math.min(nextIdx + 1, input.W),
      v: nextIdx * 2,
    };
    setInput('knapsack', { ...input, items: [...input.items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    if (input.items.length <= 1) return;
    const updated = input.items.filter((_, idx) => idx !== index);
    setInput('knapsack', { ...input, items: updated });
  };

  const handlePresetSelect = (presetIndex: number) => {
    const preset = knapsackModule.presets[presetIndex];
    if (preset) {
      setInput('knapsack', preset.input);
    }
  };

  const handleRandom = () => {
    const W = Math.floor(Math.random() * 4) + 5; // 5 to 8
    const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 items
    const names = ['A', 'B', 'C', 'D'];
    const items: KnapsackItem[] = Array.from({ length: count }, (_, idx) => ({
      id: `rand-${idx}`,
      name: `Item ${names[idx] ?? idx + 1}`,
      w: Math.floor(Math.random() * (W - 1)) + 1,
      v: (Math.floor(Math.random() * 8) + 1) * 2,
    }));
    setInput('knapsack', { W, items });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Presets dropdown */}
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
          {knapsackModule.presets.map((p, idx) => (
            <option key={p.name} value={idx}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Capacity W input */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-ink-muted">
          Bag Capacity W (1-10)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={input.W}
          onChange={(e) => handleWChange(parseInt(e.target.value, 10) || 1)}
          className="rounded-control border border-border bg-surface-2 px-2.5 py-1.5 font-mono text-sm text-ink focus:border-accent focus:outline-none"
        />
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-ink-muted">
            Items ({input.items.length}/5)
          </label>
          {input.items.length < 5 && (
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-accent hover:bg-accent-soft"
            >
              <Plus size={12} />
              <span>Add Item</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {input.items.map((it, idx) => (
            <div
              key={it.id || idx}
              className="flex items-center gap-1.5 rounded-control border border-border bg-surface-2 p-1.5 text-xs"
            >
              <input
                type="text"
                value={it.name}
                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                placeholder="Name"
                className="w-16 rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-ink focus:outline-none"
              />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-ink-muted">w:</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={it.w}
                  onChange={(e) =>
                    handleItemChange(idx, 'w', parseInt(e.target.value, 10) || 1)
                  }
                  className="w-10 rounded border border-border bg-surface px-1 py-0.5 font-mono text-xs text-ink focus:outline-none text-center"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-ink-muted">v:</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={it.v}
                  onChange={(e) =>
                    handleItemChange(idx, 'v', parseInt(e.target.value, 10) || 1)
                  }
                  className="w-10 rounded border border-border bg-surface px-1 py-0.5 font-mono text-xs text-ink focus:outline-none text-center"
                />
              </div>
              {input.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="ml-auto rounded p-1 text-ink-muted hover:text-error"
                  title="Remove item"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
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
