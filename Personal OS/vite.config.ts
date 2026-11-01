import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { sites } from './build/sites-vite-plugin'

const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt'

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'supabase', test: /node_modules[\\/]@supabase[\\/]/, priority: 30 },
            { name: 'tanstack', test: /node_modules[\\/]@tanstack[\\/]/, priority: 20 },
            { name: 'react', test: /node_modules[\\/](react|react-dom)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: isCodexSeatbeltSandbox
    ? { watch: { useFsEvents: false, usePolling: true } }
    : undefined,
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    sites(),
  ],
})
