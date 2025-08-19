import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',   // <-- critical for Vue component testing
    globals: true           // optional, lets you use describe/it/expect without imports
  }
})
