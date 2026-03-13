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
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });

  it('renders GitHub and View Demo buttons', () => {
    render(<Header />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('View Demo')).toBeInTheDocument();
  });

  it('toggles mobile menu on click', () => {
    render(<Header />);

    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons.find(btn => btn.classList.contains('md:hidden'));
    expect(menuButton).toBeDefined();

    fireEvent.click(menuButton!);

    const featuresLinks = screen.getAllByText('Features');
    expect(featuresLinks.length).toBeGreaterThan(1);
  });

  it('View Demo links to sample analysis', () => {
    render(<Header />);
    const demoLink = screen.getByText('View Demo').closest('a');
    expect(demoLink).toHaveAttribute('href', '/deals/sample/analyze');
  });
});
