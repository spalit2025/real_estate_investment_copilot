import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Features } from '../Features';

describe('Features', () => {
  it('renders section headline', () => {
    render(<Features />);
    expect(screen.getByText('Built for Investors Who Do Their Own Math')).toBeInTheDocument();
  });

  it('renders all six features', () => {
    render(<Features />);
    expect(screen.getByText('Multi-Horizon Analysis')).toBeInTheDocument();
    expect(screen.getByText('Full Tax Modeling')).toBeInTheDocument();
    expect(screen.getByText('Sensitivity Analysis')).toBeInTheDocument();
    expect(screen.getByText('REIT Baseline Comparison')).toBeInTheDocument();
    expect(screen.getByText('Risk & Data Gap Flags')).toBeInTheDocument();
    expect(screen.getByText('Exportable Memos')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Features />);
    expect(screen.getByText(/5, 7, and 10-year exits/i)).toBeInTheDocument();
    expect(screen.getByText(/Depreciation, capital gains, depreciation recapture/i)).toBeInTheDocument();
    expect(screen.getByText(/rent is 10% lower/i)).toBeInTheDocument();
    expect(screen.getByText(/benchmarked against a 6% REIT return/i)).toBeInTheDocument();
    expect(screen.getByText(/Rent control\? Insurance uncertainty\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional PDF output/i)).toBeInTheDocument();
  });

  it('has correct section id for navigation', () => {
    render(<Features />);
    const section = document.getElementById('features');
    expect(section).toBeInTheDocument();
  });
});
