import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { FixturesSidebar } from '../components/FixturesSidebar';

describe('FixturesSidebar', () => {
  it('renders minimal sidebar with fetched data', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ fixtures: [] }) });
    render(<FixturesSidebar />);
    await waitFor(() => {
      expect(screen.getByText(/Fixtures/i)).toBeInTheDocument();
    });
  });
});



