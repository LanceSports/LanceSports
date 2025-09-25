import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { HeaderBar } from '../components/HeaderBar';
import { MatchProvider } from '../hooks/useMatchStore';

describe('HeaderBar', () => {
  it('renders the LanceSports logo or title', () => {
    render(
    <MatchProvider>
            <HeaderBar />
    </MatchProvider>
);
    // Adjust the text below to match your actual header text or logo alt text
    expect(screen.getByText(/lancesports/i)).toBeInTheDocument();
  });
});
