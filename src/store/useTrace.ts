import { useMemo, useRef } from 'react';
import { useAppStore } from './useAppStore';
import { getAlgoModule } from '../engine';
import type { Trace } from '../engine/types';

export interface UseTraceResult {
  trace: Trace;
  validationError: string | null;
}

export function useTrace(): UseTraceResult {
  const algo = useAppStore((state) => state.algo);
  const inputs = useAppStore((state) => state.inputs);
  const breakId = useAppStore((state) => state.breakId);

  const mod = useMemo(() => getAlgoModule(algo), [algo]);
  const currentInput = inputs[algo];

  const lastValidTraceRef = useRef<Trace | null>(null);

  const result = useMemo<UseTraceResult>(() => {
    // Validate current input
    const validationError = mod.validate(currentInput);

    if (validationError) {
      // If we have a previous valid trace for this algo, preserve it
      if (lastValidTraceRef.current && lastValidTraceRef.current.algo === algo) {
        return {
          trace: lastValidTraceRef.current,
          validationError,
        };
      }
    }

    try {
      const trace = mod.solve(currentInput, breakId ?? 'correct');
      lastValidTraceRef.current = trace;
      return {
        trace,
        validationError: null,
      };
    } catch {
      if (lastValidTraceRef.current && lastValidTraceRef.current.algo === algo) {
        return {
          trace: lastValidTraceRef.current,
          validationError: 'Invalid input combination',
        };
      }
      // Fallback: solve first preset
      const fallbackPreset = mod.presets[0]?.input ?? currentInput;
      const fallbackTrace = mod.solve(fallbackPreset, 'correct');
      lastValidTraceRef.current = fallbackTrace;
      return {
        trace: fallbackTrace,
        validationError: 'Input invalid; showing default preset',
      };
    }
  }, [mod, currentInput, breakId, algo]);

  return result;
}
