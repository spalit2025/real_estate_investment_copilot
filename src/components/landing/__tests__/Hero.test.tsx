import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Hero } from '../Hero';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Hero', () => {
  it('renders main headline', () => {
    render(<Hero />);
    expect(screen.getByText('Stop Guessing.')).toBeInTheDocument();
    expect(screen.getByText('Start Underwriting.')).toBeInTheDocument();
  });

  it('renders subheadline with value proposition', () => {
    render(<Hero />);
    expect(screen.getByText(/professional investment memo/i)).toBeInTheDocument();
    expect(screen.getByText(/under 5 minutes/i)).toBeInTheDocument();
  });

  it('renders primary CTA button linking to sample analysis', () => {
    render(<Hero />);
    expect(screen.getByText(/View Sample Analysis/i)).toBeInTheDocument();
    const ctaButton = screen.getByText(/View Sample Analysis/i).closest('a');
    expect(ctaButton).toHaveAttribute('href', '/deals/sample/analyze');
  });

  it('renders open source tagline', () => {
    render(<Hero />);
    expect(screen.getByText(/Open source/i)).toBeInTheDocument();
  });

  it('renders floating metric badges', () => {
    render(<Hero />);
    expect(screen.getByText('BUY')).toBeInTheDocument();
    expect(screen.getByText('14.2%')).toBeInTheDocument();
    expect(screen.getByText('+6.3%')).toBeInTheDocument();
  });

  it('renders product screenshot placeholder', () => {
    render(<Hero />);
    expect(screen.getByText('Product Screenshot Placeholder')).toBeInTheDocument();
  });
});
