import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LiveUpcomingPastMatches from '../LiveUpcomingPastMatches';

describe('LiveUpcomingPastMatches', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading then renders lists', async () => {
    const fixtures = { fixtures: [] };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'application/json' }), json: async () => fixtures });
    render(<LiveUpcomingPastMatches />);
    expect(screen.getByText(/Loading matches/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/No live matches currently/i)).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('net fail'));
    render(<LiveUpcomingPastMatches />);
    await waitFor(() => {
      // component just logs and stops loading
      expect(screen.queryByText(/Loading matches/i)).not.toBeInTheDocument();
    });
  });
});



