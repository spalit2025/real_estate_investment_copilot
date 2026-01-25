import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProblemSection } from '../ProblemSection';

describe('ProblemSection', () => {
  it('renders section headline', () => {
    render(<ProblemSection />);
    expect(screen.getByText(/Your Spreadsheet Is Lying to You/i)).toBeInTheDocument();
  });

  it('renders all four pain points', () => {
    render(<ProblemSection />);
    expect(screen.getByText("You're flying blind on taxes")).toBeInTheDocument();
    expect(screen.getByText('Sensitivity analysis takes forever')).toBeInTheDocument();
    expect(screen.getByText('Every deal feels like starting over')).toBeInTheDocument();
    expect(screen.getByText('Pro forma fantasies')).toBeInTheDocument();
  });

  it('renders comparison cards', () => {
    render(<ProblemSection />);
    expect(screen.getByText('Your Current Spreadsheet')).toBeInTheDocument();
    expect(screen.getByText('Investment Memo')).toBeInTheDocument();
  });

  it('renders spreadsheet negatives', () => {
    render(<ProblemSection />);
    expect(screen.getByText('Missing tax effects')).toBeInTheDocument();
    expect(screen.getByText('No sensitivity analysis')).toBeInTheDocument();
    expect(screen.getByText('Different format every time')).toBeInTheDocument();
    expect(screen.getByText('Hours to build properly')).toBeInTheDocument();
  });

  it('renders memo positives', () => {
    render(<ProblemSection />);
    expect(screen.getByText('Full tax modeling included')).toBeInTheDocument();
    expect(screen.getByText('Instant sensitivity runs')).toBeInTheDocument();
    expect(screen.getByText('Consistent, comparable format')).toBeInTheDocument();
    expect(screen.getByText('Ready in under 5 minutes')).toBeInTheDocument();
  });
});
