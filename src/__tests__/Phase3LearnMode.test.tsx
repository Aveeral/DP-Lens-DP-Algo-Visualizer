import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { useAppStore } from '../store';

describe('Phase 3 Learn Mode Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAppStore.setState({
      algo: 'binomial',
      stepIndex: -1, // Empty grid
      playing: false,
      speed: 1,
      selectedCell: null,
      projector: false,
      focus: false,
      mode: 'learn',
      helpOpen: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with an empty table at step -1 and fills cells step-by-step', () => {
    render(<App />);

    expect(screen.getByText('Empty Grid')).toBeInTheDocument();

    // Click step forward button
    const stepForwardBtn = screen.getByTitle(/Step forward/i);
    fireEvent.click(stepForwardBtn);

    expect(useAppStore.getState().stepIndex).toBe(0);
    expect(screen.getByText(/Step 1 of/i)).toBeInTheDocument();

    // Step to end
    const jumpEndBtn = screen.getByTitle(/Jump to end/i);
    fireEvent.click(jumpEndBtn);

    expect(useAppStore.getState().stepIndex).toBeGreaterThan(5);
    expect(screen.getByText(/Optimal Result: 6/i)).toBeInTheDocument();
  });

  it('runs playback loop when Play is clicked and stops at the end', () => {
    render(<App />);

    const playBtn = screen.getByTitle(/Play \(Space\)/i);
    fireEvent.click(playBtn);
    expect(useAppStore.getState().playing).toBe(true);

    // Fast-forward 10 steps (800ms each)
    act(() => {
      vi.advanceTimersByTime(8000);
    });

    expect(useAppStore.getState().stepIndex).toBeGreaterThan(5);

    // Advance until finish
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(useAppStore.getState().playing).toBe(false);
  });

  it('activates Dependency Lens on cell click and inspects terms', () => {
    useAppStore.setState({ stepIndex: 9999 }); // Full table
    render(<App />);

    // Click on cell containing 6 (C(4, 2))
    const cellButtons = screen.getAllByRole('button');
    const cell6 = cellButtons.find((b) => b.textContent?.includes('6'));
    expect(cell6).toBeDefined();

    if (cell6) {
      fireEvent.click(cell6);
      expect(useAppStore.getState().selectedCell).toBe('4,2');

      // Check inspector details
      expect(screen.getByText(/Inspecting \[4,2\]/i)).toBeInTheDocument();
      expect(screen.getAllByText(/diagonal/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/above/i).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('navigates with keyboard shortcuts', () => {
    render(<App />);

    // ArrowRight steps forward
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(useAppStore.getState().stepIndex).toBe(0);

    // ArrowLeft steps back
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(useAppStore.getState().stepIndex).toBe(-1);

    // Space toggles playback
    fireEvent.keyDown(window, { key: ' ' });
    expect(useAppStore.getState().playing).toBe(true);
    fireEvent.keyDown(window, { key: ' ' });
    expect(useAppStore.getState().playing).toBe(false);

    // Numbers 1-4 switch algorithms
    fireEvent.keyDown(window, { key: '2' });
    expect(useAppStore.getState().algo).toBe('mcm');

    fireEvent.keyDown(window, { key: '3' });
    expect(useAppStore.getState().algo).toBe('lcs');

    fireEvent.keyDown(window, { key: '4' });
    expect(useAppStore.getState().algo).toBe('knapsack');

    fireEvent.keyDown(window, { key: '1' });
    expect(useAppStore.getState().algo).toBe('binomial');

    // ? opens help overlay
    fireEvent.keyDown(window, { key: '?' });
    expect(useAppStore.getState().helpOpen).toBe(true);
    expect(screen.getByText(/Keyboard & Clicker Shortcuts/i)).toBeInTheDocument();

    // Esc closes overlay
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useAppStore.getState().helpOpen).toBe(false);
  });

  it('ignores navigation shortcuts while typing in an input field', () => {
    render(<App />);

    const inputN = screen.getByLabelText(/n \(Total items\)/i);
    expect(inputN).toBeInTheDocument();

    // Focus input and fire ArrowRight on the input
    inputN.focus();
    fireEvent.keyDown(inputN, { key: 'ArrowRight' });

    // Step should NOT have changed from -1
    expect(useAppStore.getState().stepIndex).toBe(-1);
  });
});
