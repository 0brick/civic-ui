import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Same as in vite.config.js, so playground tests don't need dist/.
      'civic-ui': fileURLToPath(new URL('./src/index.js', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.spec.js'],
    setupFiles: ['./test/setup.js']
  }
})
