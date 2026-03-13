import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Footer } from '../Footer';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Footer', () => {
  it('renders brand name', () => {
    render(<Footer />);
    expect(screen.getByText('RE Investment Copilot')).toBeInTheDocument();
  });

  it('renders GitHub link', () => {
    render(<Footer />);
    expect(screen.getByText('View on GitHub')).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    render(<Footer />);
    expect(screen.getByText(/educational purposes/i)).toBeInTheDocument();
    expect(screen.getByText(/not a licensed investment advisor/i)).toBeInTheDocument();
  });

  it('renders MIT license and copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(`MIT License.*${currentYear}`))).toBeInTheDocument();
  });
});
