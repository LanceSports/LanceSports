import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      clean: false,
      cleanOnRerun: false,
      all: true,
      include: [
        'src/**/*.{ts,tsx}',
        'tests/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.test.{ts,tsx}',
        '!src/**/*.spec.{ts,tsx}',
        '!src/test/**',
        '!src/**/__tests__/**'
      ],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**',
        '**/*.config.{js,ts}',
        '**/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    globals: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
