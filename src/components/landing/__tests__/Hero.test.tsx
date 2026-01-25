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

  it('renders primary CTA button', () => {
    render(<Hero />);
    expect(screen.getByText(/Analyze Your First Deal/i)).toBeInTheDocument();
  });

  it('CTA links to signup page', () => {
    render(<Hero />);
    const ctaButton = screen.getByText(/Analyze Your First Deal/i).closest('a');
    expect(ctaButton).toHaveAttribute('href', '/signup');
  });

  it('renders social proof text', () => {
    render(<Hero />);
    expect(screen.getByText(/127 deals analyzed this week/i)).toBeInTheDocument();
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
