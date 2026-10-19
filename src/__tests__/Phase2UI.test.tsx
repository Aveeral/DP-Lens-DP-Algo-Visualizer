import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { useAppStore } from '../store';

describe('Phase 2 UI Integration', () => {
  beforeEach(() => {
    useAppStore.setState({
      algo: 'binomial',
      stepIndex: 9999,
      selectedCell: null,
      projector: false,
      focus: false,
      mode: 'learn',
    });
  });

  it('renders the 5-zone UI shell without crashing', () => {
    render(<App />);
    expect(screen.getByText('DP Lens')).toBeInTheDocument();
    expect(screen.getByText('Input Parameters')).toBeInTheDocument();
    expect(screen.getByText('Table View')).toBeInTheDocument();
    expect(screen.getByText('Dependency Lens')).toBeInTheDocument();
  });

  it('switches algorithms on tab click and renders corresponding table', () => {
    render(<App />);

    // Initially Binomial C(4, 2) = 6
    expect(screen.getByText('Binomial C(n, k)')).toBeInTheDocument();
    expect(screen.getByText(/Target: Cell \[4,2\] =/i)).toBeInTheDocument();

    // Click MCM tab
    fireEvent.click(screen.getByText('Matrix Chain (MCM)'));
    expect(useAppStore.getState().algo).toBe('mcm');
    expect(screen.getByText(/Target: Cell \[1,3\] =/i)).toBeInTheDocument();

    // Click LCS tab
    fireEvent.click(screen.getByText('Longest Common Subsequence'));
    expect(useAppStore.getState().algo).toBe('lcs');
    expect(screen.getByText(/Target: Cell \[4,4\] =/i)).toBeInTheDocument();

    // Click Knapsack tab
    fireEvent.click(screen.getByText('0/1 Knapsack'));
    expect(useAppStore.getState().algo).toBe('knapsack');
    expect(screen.getByText(/Target: Cell \[3,5\] =/i)).toBeInTheDocument();
  });

  it('allows selecting a cell to inspect its details', () => {
    render(<App />);

    // Find and click cell "4,2" in Binomial
    const cells = screen.getAllByRole('button');
    const cellBtn = cells.find((b) => b.textContent?.includes('6'));
    expect(cellBtn).toBeDefined();

    if (cellBtn) {
      fireEvent.click(cellBtn);
      expect(useAppStore.getState().selectedCell).toBe('4,2');
      expect(screen.getAllByText(/Cell \[4,2\]/i).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows error hint when invalid input is entered', () => {
    render(<App />);

    // Change n in Binomial to invalid value 12
    const nInput = screen.getByLabelText(/n \(Total items\)/i) as HTMLInputElement;
    fireEvent.change(nInput, { target: { value: '12' } });

    expect(screen.getByText(/between 0 and 10/i)).toBeInTheDocument();
  });

  it('toggles projector mode', () => {
    render(<App />);

    const projectorBtn = screen.getByTitle(/Projector Mode/i);
    fireEvent.click(projectorBtn);
    expect(useAppStore.getState().projector).toBe(true);

    fireEvent.click(projectorBtn);
    expect(useAppStore.getState().projector).toBe(false);
  });
});
