import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    svelte({
      emitCss: false
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/agenda.js'),
      name: 'AgendaEmbed',
      formats: ['es', 'iife'],
      fileName: (format) => format === 'es' ? 'agenda.es.js' : 'agenda-embed.js'
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true
  }
});
