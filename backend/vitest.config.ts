import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: [path.resolve(__dirname, './tests/setupEnv.ts')],
    environment: 'node'
  }
});
