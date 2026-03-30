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
      formats: ['iife'],
      fileName: () => 'agenda-embed.js'
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true
  }
});
