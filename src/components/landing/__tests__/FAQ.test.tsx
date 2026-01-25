import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FAQ } from '../FAQ';

describe('FAQ', () => {
  it('renders section headline', () => {
    render(<FAQ />);
    expect(screen.getByText('Questions? Answers.')).toBeInTheDocument();
  });

  it('renders all seven questions', () => {
    render(<FAQ />);
    expect(screen.getByText('How accurate are the calculations?')).toBeInTheDocument();
    expect(screen.getByText("What if I don't know all the inputs?")).toBeInTheDocument();
    expect(screen.getByText('Is this financial advice?')).toBeInTheDocument();
    expect(screen.getByText('Can I compare multiple properties?')).toBeInTheDocument();
    expect(screen.getByText('What markets/property types are supported?')).toBeInTheDocument();
    expect(screen.getByText('How is the AI used?')).toBeInTheDocument();
    expect(screen.getByText('Can I export the memo?')).toBeInTheDocument();
  });

  it('shows first answer by default', () => {
    render(<FAQ />);
    expect(screen.getByText(/IRR calculations match Excel XIRR within 0.01%/i)).toBeInTheDocument();
  });

  it('toggles answer visibility on click', () => {
    render(<FAQ />);

    // Click on second question
    const secondQuestion = screen.getByText("What if I don't know all the inputs?");
    fireEvent.click(secondQuestion);

    // Second answer should now be visible
    expect(screen.getByText(/smart defaults based on property type/i)).toBeInTheDocument();
  });

  it('closes previous answer when opening new one', () => {
    render(<FAQ />);

    // First answer is visible by default
    expect(screen.getByText(/IRR calculations match Excel XIRR/i)).toBeInTheDocument();

    // Click on second question
    const secondQuestion = screen.getByText("What if I don't know all the inputs?");
    fireEvent.click(secondQuestion);

    // First answer should be hidden now
    expect(screen.queryByText(/IRR calculations match Excel XIRR/i)).not.toBeInTheDocument();
  });

  it('closes answer when clicking same question again', () => {
    render(<FAQ />);

    // Click first question to close it
    const firstQuestion = screen.getByText('How accurate are the calculations?');
    fireEvent.click(firstQuestion);

    // Answer should be hidden
    expect(screen.queryByText(/IRR calculations match Excel XIRR/i)).not.toBeInTheDocument();
  });

  it('has correct section id for navigation', () => {
    render(<FAQ />);
    const section = document.getElementById('faq');
    expect(section).toBeInTheDocument();
  });
});
