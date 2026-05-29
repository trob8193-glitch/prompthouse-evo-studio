import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@features': path.resolve(__dirname, './src/features'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },

  // Scoped to src/main.jsx so esbuild never crawls JSX files
  // that contain raw CSS strings at module top-level.
  optimizeDeps: {
    entries: ['src/main.jsx'],
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'zustand',
      'framer-motion',
      'lucide-react',
      'clsx',
      'openai',
    ],
    exclude: ['@rive-app/react-canvas'],
  },

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    clearScreen: false,
    watch: {
      ignored: [
        '**/.ai/**',
        '**/.sovereign-shards/**',
        '**/.prompthouse-data/**',
        '**/.prompt-garden/**',
        '**/scratch/**',
      ],
    },
  },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    reportCompressedSize: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        manualChunks(id) {
          const n = id.replace(/\\/g, '/')

          if (n.includes('/node_modules/')) {
            if (n.includes('/react/') || n.includes('/react-dom/') || n.includes('/react-router')) return 'react-vendor'
            if (n.includes('/framer-motion/') || n.includes('/lucide-react/') || n.includes('/zustand/') || n.includes('/clsx/') || n.includes('/@rive-app/')) return 'ui-vendor'
            if (n.includes('/@openai/') || n.includes('/openai/')) return 'ai-vendor'
            return 'vendor'
          }

          if (n.endsWith('/src/engine.js')) return 'engine-core'
          if (n.endsWith('/src/mobile-engine.js')) return 'mobile-engine'
          if (n.includes('/src/features/') || n.endsWith('/src/app/AppShell.jsx')) return 'studio-shell'
          if (n.includes('/src/proof-') || n.endsWith('/src/new-features-views.jsx') || n.endsWith('/src/release-spine-panels.jsx') || n.endsWith('/src/studio-complement-views.jsx')) return 'truth-surfaces'
          if (n.includes('/src/forge-') || n.includes('/src/nightforge') || n.includes('/src/tool-autogen') || n.includes('/src/pattern-miner') || n.includes('/src/real-execution')) return 'forge-surfaces'
          if (n.includes('/src/autonomous-') || n.includes('/src/self-build-') || n.includes('/src/worktwin-') || n.includes('/src/past-mvp-console')) return 'autonomy-surfaces'
          if (n.includes('/src/promptlink-') || n.includes('/src/agent-bridge-') || n.includes('/src/chrome-extension-') || n.includes('/src/evo-copilot-sidebar')) return 'bridge-surfaces'
          if (n.includes('/src/ai-') || n.endsWith('/src/v3-views.jsx') || n.endsWith('/src/views.jsx') || n.includes('/src/bot-') || n.includes('/src/evo-duel-engine-') || n.endsWith('/src/commerce-rail-view.jsx') || n.endsWith('/src/deploy-rail-view.jsx')) return 'creative-surfaces'

          return undefined
        },
      },
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.prompthouse-data/**',
      '**/buildkit_import/**',
      '**/generated_apps/**',
      '**/prompthouse-evo-studio/**',
      '**/temp_zip/**',
      '**/zip_temp/**',
      '**/zip_temp_chunk/**',
      '**/zip_temp_v1_2/**',
      '**/scripts/**',
    ],
  },
})
