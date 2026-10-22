import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))
const buildBase = process.env.CIVIC_UI_BASE || '/'

// Library mode emits the CSS without importing it from the JS. The ES build
// is therefore civic-ui.unstyled.es.js (the `civic-ui/unstyled` export) and
// civic-ui.es.js is a thin wrapper that imports the stylesheet first.
// UMD stays unstyled: a CSS require would crash plain Node.
function styledEsEntry() {
  return {
    name: 'civic-ui:styled-es-entry',
    apply: 'build',
    generateBundle(options) {
      if (options.format !== 'es') return
      this.emitFile({
        type: 'asset',
        fileName: 'civic-ui.es.js',
        source: [
          "import './civic-ui.css'",
          "export * from './civic-ui.unstyled.es.js'",
          "export { default } from './civic-ui.unstyled.es.js'",
          ''
        ].join('\n')
      })
    }
  }
}

// Fills the library version into the playground's JSON-LD.
function packageVersionInHtml() {
  return {
    name: 'civic-ui:package-version-in-html',
    transformIndexHtml: (html) => html.replaceAll('__CIVIC_UI_VERSION__', pkg.version)
  }
}

// MODE=lib builds the library; otherwise Vite serves and builds the playground.
export default defineConfig({
  plugins: process.env.MODE === 'lib' ? [vue(), styledEsEntry()] : [vue(), packageVersionInHtml()],
  // Defaults to custom-domain root and is overridden in the Pages workflow.
  base: buildBase,
  root: process.env.MODE === 'lib' ? undefined : 'playground',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Examples import from 'civic-ui' exactly like a consumer, resolved to src/.
      'civic-ui': fileURLToPath(new URL('./src/index.js', import.meta.url))
    }
  },
  build: process.env.MODE === 'lib' ? {
    lib: {
      entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
      name: 'CivicUI',
      fileName: (format) => `civic-ui.${format === 'es' ? 'unstyled.es.js' : 'umd.cjs'}`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: { vue: 'Vue' },
        // keep the single stylesheet name predictable regardless of Rollup's hashing
        assetFileNames: (asset) => asset.name === 'style.css' ? 'civic-ui.css' : asset.name
      }
    },
    cssCodeSplit: false
  } : {
    outDir: '../playground-dist',
    // outDir is outside the playground root, so clear it explicitly.
    emptyOutDir: true
  }
})
