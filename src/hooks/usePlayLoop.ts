import { useEffect } from 'react';
import { useAppStore } from '../store';
import { useTrace } from '../store/useTrace';

export function usePlayLoop(): void {
  const playing = useAppStore((state) => state.playing);
  const speed = useAppStore((state) => state.speed);
  const stepIndex = useAppStore((state) => state.stepIndex);
  const setStepIndex = useAppStore((state) => state.setStepIndex);
  const setPlaying = useAppStore((state) => state.setPlaying);

  const { trace } = useTrace();
  const totalSteps = trace.steps.length;

  useEffect(() => {
    if (!playing) return;

    // Stop if we have reached the end
    if (stepIndex >= totalSteps - 1) {
      setPlaying(false);
      return;
    }

    const intervalMs = Math.round(800 / speed);

    const timer = setInterval(() => {
      const current = useAppStore.getState().stepIndex;
      const next = current + 1;

      if (next >= totalSteps - 1) {
        setStepIndex(totalSteps - 1);
        setPlaying(false);
      } else {
        setStepIndex(next);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [playing, speed, stepIndex, totalSteps, setStepIndex, setPlaying]);
}
