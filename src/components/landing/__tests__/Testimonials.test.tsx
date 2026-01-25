import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Testimonials } from '../Testimonials';

describe('Testimonials', () => {
  it('renders section headline', () => {
    render(<Testimonials />);
    expect(screen.getByText('What Investors Are Saying')).toBeInTheDocument();
  });

  it('renders all three testimonials', () => {
    render(<Testimonials />);
    expect(screen.getByText(/I used to spend 2 hours building a model/i)).toBeInTheDocument();
    expect(screen.getByText(/sensitivity analysis changed how I think/i)).toBeInTheDocument();
    expect(screen.getByText(/tool that speaks my language/i)).toBeInTheDocument();
  });

  it('renders testimonial authors', () => {
    render(<Testimonials />);
    expect(screen.getByText('Marcus T.')).toBeInTheDocument();
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();
    expect(screen.getByText('James L.')).toBeInTheDocument();
  });

  it('renders author titles/locations', () => {
    render(<Testimonials />);
    expect(screen.getByText('12-property portfolio, Texas')).toBeInTheDocument();
    expect(screen.getByText('4 properties, Colorado')).toBeInTheDocument();
    expect(screen.getByText('Former PE analyst, California')).toBeInTheDocument();
  });

  it('renders case study link', () => {
    render(<Testimonials />);
    expect(screen.getByText(/analyzed 47 deals in a weekend/i)).toBeInTheDocument();
  });
});
