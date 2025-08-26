import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: '.',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000, // 增加块大小警告限制到 1MB
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          // 将 React 相关库分离到单独的块
          'react-vendor': ['react', 'react-dom'],
          // 将 Ant Design 分离到单独的块
          'antd-vendor': ['antd', '@ant-design/icons'],
          // 将其他第三方库分离
          'vendor': ['electron']
        },
        // 优化输出文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
})