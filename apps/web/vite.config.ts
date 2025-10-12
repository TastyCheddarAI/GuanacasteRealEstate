import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@guanacaste-real/ui': path.resolve(__dirname, './src/components/ui'),
      '@guanacaste-real/lib': path.resolve(__dirname, './src/lib'),
    },
  },
})