import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pricing } from '../Pricing';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Pricing', () => {
  it('renders section headline', () => {
    render(<Pricing />);
    expect(screen.getByText('Pricing That Makes Sense')).toBeInTheDocument();
  });

  it('renders Pay Per Memo tier', () => {
    render(<Pricing />);
    expect(screen.getByText('Pay Per Memo')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('per memo')).toBeInTheDocument();
  });

  it('renders Unlimited tier', () => {
    render(<Pricing />);
    expect(screen.getByText('Unlimited')).toBeInTheDocument();
    expect(screen.getByText('$79')).toBeInTheDocument();
    expect(screen.getByText('/month')).toBeInTheDocument();
  });

  it('renders annual pricing option', () => {
    render(<Pricing />);
    expect(screen.getByText(/\$599\/year.*save 37%/i)).toBeInTheDocument();
  });

  it('renders best value badge on Unlimited', () => {
    render(<Pricing />);
    expect(screen.getByText('BEST VALUE')).toBeInTheDocument();
  });

  it('renders Pay Per Memo features', () => {
    render(<Pricing />);
    expect(screen.getByText('Full analysis (5/7/10 year)')).toBeInTheDocument();
    expect(screen.getByText('PDF export')).toBeInTheDocument();
    expect(screen.getByText('Saved to your account')).toBeInTheDocument();
  });

  it('renders Unlimited features', () => {
    render(<Pricing />);
    expect(screen.getByText('Unlimited memos')).toBeInTheDocument();
    expect(screen.getByText('Deal comparison view')).toBeInTheDocument();
    expect(screen.getByText('Saved assumption profiles')).toBeInTheDocument();
    expect(screen.getByText('Priority support')).toBeInTheDocument();
  });

  it('renders CTA buttons', () => {
    render(<Pricing />);
    expect(screen.getByText('Buy a Single Memo')).toBeInTheDocument();
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('renders free trial note', () => {
    render(<Pricing />);
    expect(screen.getByText(/14-day free trial/i)).toBeInTheDocument();
    expect(screen.getByText(/first 3 memos are free forever/i)).toBeInTheDocument();
  });

  it('renders price anchoring text', () => {
    render(<Pricing />);
    expect(screen.getByText(/One bad deal costs \$50,000\+/i)).toBeInTheDocument();
  });

  it('has correct section id for navigation', () => {
    render(<Pricing />);
    const section = document.getElementById('pricing');
    expect(section).toBeInTheDocument();
  });

  it('CTA buttons link to signup', () => {
    render(<Pricing />);
    const buttons = screen.getAllByRole('link');
    const signupLinks = buttons.filter(btn => btn.getAttribute('href') === '/signup');
    expect(signupLinks.length).toBeGreaterThan(0);
  });
});
