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

  it('renders contact email', () => {
    render(<Footer />);
    expect(screen.getByText('support@reinvestmentcopilot.com')).toBeInTheDocument();
  });

  it('renders Product links', () => {
    render(<Footer />);
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pricing' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'FAQ' })).toBeInTheDocument();
  });

  it('renders Resources links', () => {
    render(<Footer />);
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Blog' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Deal Analysis Guide' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'IRR Calculator' })).toBeInTheDocument();
  });

  it('renders Company links', () => {
    render(<Footer />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders Legal links', () => {
    render(<Footer />);
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Disclaimer' })).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    render(<Footer />);
    expect(screen.getByText(/educational purposes/i)).toBeInTheDocument();
    expect(screen.getByText(/not a licensed investment advisor/i)).toBeInTheDocument();
  });

  it('renders copyright with current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });
});
