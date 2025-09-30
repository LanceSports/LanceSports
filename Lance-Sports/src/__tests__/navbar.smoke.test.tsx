import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

function renderWithRouter(ui: React.ReactNode) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Navbar smoke', () => {
  it('shows logout when signed in and triggers handler', () => {
    const onLogout = vi.fn();
    renderWithRouter(<Navbar isSignedIn={true} onLogout={onLogout} userData={{ name: 'Test' }} />);
    const btn = screen.getByRole('button', { name: /logout/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onLogout).toHaveBeenCalled();
  });
});



