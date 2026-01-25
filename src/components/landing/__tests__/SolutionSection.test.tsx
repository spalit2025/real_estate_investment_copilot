import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SolutionSection } from '../SolutionSection';

describe('SolutionSection', () => {
  it('renders section headline', () => {
    render(<SolutionSection />);
    expect(screen.getByText('Underwriting That Actually Tells You the Truth')).toBeInTheDocument();
  });

  it('renders value proposition', () => {
    render(<SolutionSection />);
    expect(screen.getByText(/complete financial model/i)).toBeInTheDocument();
    expect(screen.getByText(/financing, taxes, depreciation/i)).toBeInTheDocument();
  });

  it('renders all four benefits', () => {
    render(<SolutionSection />);
    expect(screen.getByText('Real after-tax returns')).toBeInTheDocument();
    expect(screen.getByText('Instant sensitivity analysis')).toBeInTheDocument();
    expect(screen.getByText('Consistent, comparable memos')).toBeInTheDocument();
    expect(screen.getByText('REIT reality check')).toBeInTheDocument();
  });

  it('renders benefit descriptions', () => {
    render(<SolutionSection />);
    expect(screen.getByText(/depreciation, capital gains/i)).toBeInTheDocument();
    expect(screen.getByText(/rent drops 10%/i)).toBeInTheDocument();
  });

  it('renders demo video placeholder', () => {
    render(<SolutionSection />);
    expect(screen.getByText('Demo Video Placeholder')).toBeInTheDocument();
    expect(screen.getByText(/listing to verdict in 90 seconds/i)).toBeInTheDocument();
  });
});
