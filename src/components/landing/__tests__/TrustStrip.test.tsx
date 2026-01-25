import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TrustStrip } from '../TrustStrip';

describe('TrustStrip', () => {
  it('renders deal volume stat', () => {
    render(<TrustStrip />);
    expect(screen.getByText('$2.4B')).toBeInTheDocument();
    expect(screen.getByText('in deals analyzed')).toBeInTheDocument();
  });

  it('renders time to memo stat', () => {
    render(<TrustStrip />);
    expect(screen.getByText('4.7 min')).toBeInTheDocument();
    expect(screen.getByText('average time to memo')).toBeInTheDocument();
  });

  it('renders accuracy stat', () => {
    render(<TrustStrip />);
    expect(screen.getByText('±0.01%')).toBeInTheDocument();
    expect(screen.getByText('IRR accuracy vs. Excel')).toBeInTheDocument();
  });

  it('renders credibility markers', () => {
    render(<TrustStrip />);
    expect(screen.getByText('Calculations verified against Excel XIRR')).toBeInTheDocument();
    expect(screen.getByText('Used by investors in 23 states')).toBeInTheDocument();
  });
});
