import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    clearScreen: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      }
    },
    watch: {
      ignored: ['**/.ai/**', '**/.sovereign-shards/**', '**/.prompthouse-data/**', '**/.prompt-garden/**', '**/scratch/**'],
    },
  },
  optimizeDeps: {
    exclude: ['fs', 'path', 'net', 'crypto', 'child_process', 'node:fs/promises', 'node:path', 'node:fs'],
  },
  build: {
    target: "esnext",
    sourcemap: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/')

          if (normalized.includes('/node_modules/')) {
            if (/\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(normalized)) return 'react-vendor'
            if (/\/(framer-motion|lucide-react|zustand|clsx|tailwind-merge|@rive-app)\//.test(normalized)) return 'ui-vendor'
            if (/(react-syntax-highlighter|prismjs|refractor|highlight\.js|lowlight)/.test(normalized)) return 'syntax-vendor'
            if (/(react-markdown|remark-|micromark|mdast|hast|unist|vfile)/.test(normalized)) return 'markdown-vendor'
            if (/\/(@openai\/agents|@openai\/agents-core|@openai\/agents-openai|openai)\//.test(normalized)) return 'ai-vendor'
            return 'vendor'
          }

          if (normalized.endsWith('/src/engine.js')) return 'engine-core'
          if (normalized.endsWith('/src/mobile-engine.js')) return 'mobile-engine'
          if (/(\/src\/features\/|\/src\/app\/AppShell\.jsx$)/.test(normalized)) return 'studio-shell'
          if (/(\/src\/proof-|\/src\/new-features-views\.jsx$|\/src\/release-spine-panels\.jsx$|\/src\/studio-complement-views\.jsx$)/.test(normalized)) return 'truth-surfaces'
          if (/(\/src\/forge-|\/src\/nightforge|\/src\/tool-autogen|\/src\/pattern-miner|\/src\/real-execution)/.test(normalized)) return 'forge-surfaces'
          if (/(\/src\/autonomous-|\/src\/self-build-|\/src\/worktwin-|\/src\/past-mvp-console)/.test(normalized)) return 'autonomy-surfaces'
          if (/(\/src\/promptlink-|\/src\/agent-bridge-|\/src\/chrome-extension-|\/src\/evo-copilot-sidebar)/.test(normalized)) return 'bridge-surfaces'
          if (/(\/src\/ai-|\/src\/features\/AI|\/src\/features\/Evo(Diffuser|Pixelator|Layout)Dashboard\.jsx$)/.test(normalized)) return 'ai-surfaces'
          if (/(\/src\/v3-views\.jsx$|\/src\/views\.jsx$|\/src\/evo-duel-engine-)/.test(normalized)) return 'creative-surfaces'
          if (/(\/src\/bot-|\/src\/bot_)/.test(normalized)) return 'bot-surfaces'
          if (/(\/src\/commerce-rail-view\.jsx$|\/src\/deploy-rail-view\.jsx$|\/src\/commerce-rail\.js$|\/src\/deployment-)/.test(normalized)) return 'launch-surfaces'
          return undefined
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    testTimeout: 15000,
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
