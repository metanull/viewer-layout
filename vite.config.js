import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.js',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n'],
      output: {
        assetFileNames: 'viewer-layout.[ext]',
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
