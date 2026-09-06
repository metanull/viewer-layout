import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // Two entry points: the whole package, and the content components on
      // their own, so a page that composes a list and a pagination does not
      // carry the shell with them. What the two share is emitted once.
      entry: {
        index: 'src/index.js',
        content: 'src/content/index.js',
      },
      formats: ['es'],
      fileName: (format, name) => `${name}.js`,
    },
    // One stylesheet for both entries: `style.css` stays the one file a
    // website imports, whichever entry point its code reaches.
    cssCodeSplit: false,
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
