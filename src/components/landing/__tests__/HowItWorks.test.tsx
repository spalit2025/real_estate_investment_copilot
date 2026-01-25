import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HowItWorks } from '../HowItWorks';

describe('HowItWorks', () => {
  it('renders section headline', () => {
    render(<HowItWorks />);
    expect(screen.getByText('From Listing to Verdict in Three Steps')).toBeInTheDocument();
  });

  it('renders all three steps', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Enter the Deal')).toBeInTheDocument();
    expect(screen.getByText('Run the Model')).toBeInTheDocument();
    expect(screen.getByText('Get Your Memo')).toBeInTheDocument();
  });

  it('renders step numbers', () => {
    render(<HowItWorks />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders time indicators', () => {
    render(<HowItWorks />);
    expect(screen.getByText('3 minutes')).toBeInTheDocument();
    expect(screen.getAllByText('instant')).toHaveLength(2);
  });

  it('renders step descriptions', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/property details, purchase price/i)).toBeInTheDocument();
    expect(screen.getByText(/year-by-year cash flows/i)).toBeInTheDocument();
    expect(screen.getByText(/Export to PDF/i)).toBeInTheDocument();
  });

  it('renders screenshot placeholders', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Screenshot: Deal Input Form')).toBeInTheDocument();
    expect(screen.getByText('Screenshot: Running Analysis')).toBeInTheDocument();
    expect(screen.getByText('Screenshot: Final Memo')).toBeInTheDocument();
  });
});
