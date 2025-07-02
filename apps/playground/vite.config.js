import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [],
  server: {
    port: 3001,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['monaco-editor']
  },
  define: {
    'process.env': {}
  }
})
