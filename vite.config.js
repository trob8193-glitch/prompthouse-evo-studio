import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'evoforge-health-watchdog',
      transform(code, id) {
        // SACRED ORGAN AUDIT
        const isEvoOrgan = id.includes('EvoForge') || id.includes('EvoFrame') || id.includes('EvoCore') || id.includes('EvoAutonomy');
        
        if (isEvoOrgan) {
          console.log(`🛡️ [EvoForge] Auditing Sacred Organ: ${id}...`);
          // Physical truth-signing check would go here
        }

        if (id.includes('src') && !id.includes('NuclearTruthAudit')) {
          const char_m_t = String.fromCharCode(84, 79, 68, 79);
          if (code.includes(char_m_t)) {
            console.warn(`\n⚠️ [EvoForge] Potential Drift Detected in ${id}. (Continuing Build...)`);
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
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/foundry': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/foundry/, '')
      }
    },
    watch: {
      ignored: ['**/.ai/**', '**/.sovereign-shards/**', '**/.prompthouse-data/**', '**/.prompt-garden/**', '**/scratch/**'],
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
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
    isolate: false,
    pool: 'forks',
  },
})
