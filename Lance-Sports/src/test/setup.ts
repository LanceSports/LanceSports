import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Ensure JSDOM is cleaned between tests
afterEach(() => {
  cleanup();
});

expect.extend(matchers);


