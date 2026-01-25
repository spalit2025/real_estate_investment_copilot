import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OutputPreview } from '../OutputPreview';

describe('OutputPreview', () => {
  it('renders section headline', () => {
    render(<OutputPreview />);
    expect(screen.getByText("See What You'll Get")).toBeInTheDocument();
  });

  it('renders sample memo header', () => {
    render(<OutputPreview />);
    expect(screen.getByText('INVESTMENT MEMO')).toBeInTheDocument();
    expect(screen.getByText('123 Oak Street, Austin, TX')).toBeInTheDocument();
  });

  it('renders BUY verdict', () => {
    render(<OutputPreview />);
    expect(screen.getByText('BUY')).toBeInTheDocument();
  });

  it('renders returns by horizon', () => {
    render(<OutputPreview />);
    expect(screen.getByText('RETURNS BY HORIZON')).toBeInTheDocument();
    expect(screen.getByText('5-Year')).toBeInTheDocument();
    expect(screen.getByText('7-Year')).toBeInTheDocument();
    expect(screen.getByText('10-Year')).toBeInTheDocument();
    expect(screen.getByText('11.2%')).toBeInTheDocument();
    expect(screen.getByText('14.2%')).toBeInTheDocument();
    expect(screen.getByText('15.8%')).toBeInTheDocument();
  });

  it('renders equity multiples', () => {
    render(<OutputPreview />);
    expect(screen.getByText('1.7x')).toBeInTheDocument();
    expect(screen.getByText('2.1x')).toBeInTheDocument();
    expect(screen.getByText('2.8x')).toBeInTheDocument();
  });

  it('renders REIT comparison', () => {
    render(<OutputPreview />);
    expect(screen.getByText(/vs. REIT Baseline: \+6.3%/i)).toBeInTheDocument();
  });

  it('renders sensitivity analysis section', () => {
    render(<OutputPreview />);
    expect(screen.getByText('SENSITIVITY ANALYSIS')).toBeInTheDocument();
    expect(screen.getByText('Rent -10%')).toBeInTheDocument();
    expect(screen.getByText('Appreciation -2%')).toBeInTheDocument();
    expect(screen.getByText('Vacancy +5%')).toBeInTheDocument();
  });

  it('renders risk notes section', () => {
    render(<OutputPreview />);
    expect(screen.getByText('RISK NOTES')).toBeInTheDocument();
    expect(screen.getByText(/35 years old.*budget for roof/i)).toBeInTheDocument();
    expect(screen.getByText(/HOA has rental restrictions/i)).toBeInTheDocument();
  });

  it('renders next steps section', () => {
    render(<OutputPreview />);
    expect(screen.getByText('NEXT STEPS')).toBeInTheDocument();
    expect(screen.getByText(/Verify actual rent comps/i)).toBeInTheDocument();
    expect(screen.getByText(/Get insurance quote/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspect roof and HVAC/i)).toBeInTheDocument();
  });
});
