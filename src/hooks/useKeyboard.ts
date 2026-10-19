import { useEffect } from 'react';
import { useAppStore } from '../store';
import { useTrace } from '../store/useTrace';

export function useKeyboard(): void {
  const setAlgo = useAppStore((state) => state.setAlgo);
  const setMode = useAppStore((state) => state.setMode);
  const setStepIndex = useAppStore((state) => state.setStepIndex);
  const setPlaying = useAppStore((state) => state.setPlaying);
  const setSelectedCell = useAppStore((state) => state.setSelectedCell);
  const toggleProjector = useAppStore((state) => state.toggleProjector);
  const toggleFocus = useAppStore((state) => state.toggleFocus);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleHelp = useAppStore((state) => state.toggleHelp);
  const setHelpOpen = useAppStore((state) => state.setHelpOpen);

  const { trace } = useTrace();
  const totalSteps = trace.steps.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when the user is typing in form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Modifier combinations
      if (e.shiftKey) {
        if (e.key === 'P' || e.key === 'p') {
          e.preventDefault();
          toggleProjector();
          return;
        }
        if (e.key === 'F' || e.key === 'f') {
          e.preventDefault();
          toggleFocus();
          return;
        }
        if (e.key === 'D' || e.key === 'd') {
          e.preventDefault();
          toggleTheme();
          return;
        }
      }

      // Help overlay
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        toggleHelp();
        return;
      }

      // Escape: clear selection, close overlays, return to learn mode
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedCell(null);
        setHelpOpen(false);
        setMode('learn');
        return;
      }

      // Stepping and Playback
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setPlaying(false);
        const current = useAppStore.getState().stepIndex;
        if (current < totalSteps - 1) {
          setStepIndex(current + 1);
        }
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setPlaying(false);
        const current = useAppStore.getState().stepIndex;
        if (current > -1) {
          setStepIndex(current - 1);
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        const current = useAppStore.getState().stepIndex;
        const isPlaying = useAppStore.getState().playing;
        if (isPlaying) {
          setPlaying(false);
        } else {
          if (current >= totalSteps - 1) {
            setStepIndex(0);
          }
          setPlaying(true);
        }
        return;
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setPlaying(false);
        setStepIndex(-1);
        return;
      }

      if (e.key === 'End') {
        e.preventDefault();
        setPlaying(false);
        setStepIndex(totalSteps - 1);
        return;
      }

      // Algorithm switching: 1 to 4
      if (e.key === '1') {
        e.preventDefault();
        setAlgo('binomial');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        setAlgo('mcm');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        setAlgo('lcs');
        return;
      }
      if (e.key === '4') {
        e.preventDefault();
        setAlgo('knapsack');
        return;
      }

      // Mode switching
      const keyUpper = e.key.toUpperCase();
      if (keyUpper === 'L') {
        e.preventDefault();
        setMode('learn');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    totalSteps,
    setAlgo,
    setMode,
    setStepIndex,
    setPlaying,
    setSelectedCell,
    toggleProjector,
    toggleFocus,
    toggleTheme,
    toggleHelp,
    setHelpOpen,
  ]);
}
