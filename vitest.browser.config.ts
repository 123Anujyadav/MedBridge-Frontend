import { defineConfig } from 'vitest/config';
import path from 'path';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    include: ['**/*.browser.test.{ts,tsx}'],
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [
        { browser: 'chromium' },
      ],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
