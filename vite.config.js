import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    clearScreen: false,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalized = id.replace(/\\/g, '/')

          if (normalized.includes('/node_modules/')) {
            if (/\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(normalized)) return 'react-vendor'
            if (/\/(framer-motion|lucide-react|zustand|clsx|tailwind-merge|@rive-app)\//.test(normalized)) return 'ui-vendor'
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
          if (/(\/src\/ai-|\/src\/v3-views\.jsx$|\/src\/views\.jsx$|\/src\/bot-|\/src\/evo-duel-engine-|\/src\/commerce-rail-view\.jsx$|\/src\/deploy-rail-view\.jsx$)/.test(normalized)) return 'creative-surfaces'
          return undefined
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
