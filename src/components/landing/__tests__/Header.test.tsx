import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from '../Header';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Header', () => {
  it('renders logo and brand name', () => {
    render(<Header />);
    expect(screen.getByText('RE Investment Copilot')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders auth buttons', () => {
    render(<Header />);
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('toggles mobile menu on click', () => {
    render(<Header />);

    // Find mobile menu button (the one with type="button" that's not a shadcn Button)
    const menuButtons = screen.getAllByRole('button');
    // The mobile menu button is the one with md:hidden class
    const menuButton = menuButtons.find(btn => btn.classList.contains('md:hidden'));
    expect(menuButton).toBeDefined();

    // Click to open mobile menu
    fireEvent.click(menuButton!);

    // Mobile menu should now show duplicate links
    const featuresLinks = screen.getAllByText('Features');
    expect(featuresLinks.length).toBeGreaterThan(1);
  });

  it('has correct link hrefs', () => {
    render(<Header />);

    const loginLink = screen.getByText('Log In').closest('a');
    const getStartedLink = screen.getByText('Get Started').closest('a');

    expect(loginLink).toHaveAttribute('href', '/login');
    expect(getStartedLink).toHaveAttribute('href', '/signup');
  });
});
