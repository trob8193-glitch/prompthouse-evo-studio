import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'nuclear-truth-plugin',
      transform(code, id) {
        if (id.includes('src') && !id.includes('NuclearTruthAudit')) {
          const char_m_t = String.fromCharCode(84, 79, 68, 79);
          const char_m_f = String.fromCharCode(70, 73, 88, 77, 69);
          if (code.includes(char_m_t) || code.includes(char_m_f)) {
            console.error(`\n❌ [NuclearTruth] Build BLOCKED: Simulation drift in ${id}`);
            process.exit(1);
          }
        }
        return null;
      }
    }
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    clearScreen: false,
    watch: {
      ignored: ['**/.ai/**', '**/.sovereign-shards/**', '**/.prompthouse-data/**', '**/.prompt-garden/**', '**/scratch/**'],
    },
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          const pkgPath = id.split('node_modules/')[1]
          if (!pkgPath) {
            return 'vendor'
          }

          const segments = pkgPath.split('/')
          const pkgName = segments[0].startsWith('@')
            ? `${segments[0]}_${segments[1]}`
            : segments[0]
          return `vendor_${pkgName.replace('@', '')}`
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
})
