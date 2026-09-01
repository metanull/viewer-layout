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
      // viewer-core is the application's, not ours: the layout reads the
      // active language from the same instance the application installed.
      external: ['vue', '@metanull/viewer-core/i18n'],
      output: {
        assetFileNames: 'viewer-layout.[ext]',
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
