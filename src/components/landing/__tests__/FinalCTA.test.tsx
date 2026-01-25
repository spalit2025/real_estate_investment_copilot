import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinalCTA } from '../FinalCTA';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('FinalCTA', () => {
  it('renders headline', () => {
    render(<FinalCTA />);
    expect(screen.getByText('Your Next Deal Deserves Better Than a Spreadsheet')).toBeInTheDocument();
  });

  it('renders supporting text', () => {
    render(<FinalCTA />);
    expect(screen.getByText(/Run your first analysis free/i)).toBeInTheDocument();
  });

  it('renders primary CTA button', () => {
    render(<FinalCTA />);
    expect(screen.getByText(/Analyze a Deal Now/i)).toBeInTheDocument();
  });

  it('CTA links to signup', () => {
    render(<FinalCTA />);
    const ctaButton = screen.getByText(/Analyze a Deal Now/i).closest('a');
    expect(ctaButton).toHaveAttribute('href', '/signup');
  });

  it('renders risk reversal text', () => {
    render(<FinalCTA />);
    expect(screen.getByText(/First 3 memos free/i)).toBeInTheDocument();
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument();
  });

  it('renders secondary demo link', () => {
    render(<FinalCTA />);
    expect(screen.getByText(/Watch the 2-minute demo/i)).toBeInTheDocument();
  });
});
