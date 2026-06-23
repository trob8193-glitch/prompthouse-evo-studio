import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js', 'src/**/*.test.js', 'server/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './.prompthouse-data/coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        '.prompthouse-data/**',
        '**/*.config.js',
        'generated_apis/**' // Skip generated APIs for coverage as they are dynamic
      ]
    },
    setupFiles: ['./tests/setup.js']
  }
});
