import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(() => ({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  // Optimizaciones para desarrollo más rápido
  optimizeDeps: {
    include: ['react', 'react-dom', '@monaco-editor/react', '@xterm/xterm'],
    exclude: ['@tauri-apps/api'],
  },
  build: {
    target:
      process.env.TAURI_PLATFORM === 'windows'
        ? 'chrome105'
        : process.env.TAURI_PLATFORM === 'darwin'
        ? 'safari13'
        : 'firefox102',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    // Optimizaciones de build
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'monaco-vendor': ['@monaco-editor/react', 'monaco-editor'],
          'xterm-vendor': ['@xterm/xterm', '@xterm/addon-fit'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}))
