import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// BENCH_VAPOR=1 builds the vapor variant: the app's SFCs are vapor-compiled
// and the 'vapor' exports condition serves Vueform's vapor dist. Both
// variants install the same Vue 3.6 copy, so the rendering mode is the only
// difference between the two builds — exactly what the mode comparison needs.
const vapor = !!process.env.BENCH_VAPOR

export default defineConfig({
  base: './',
  define: {
    __BENCH_VAPOR__: JSON.stringify(vapor),
  },
  plugins: [vue(vapor ? { features: { vapor: true } } : {})],
  resolve: {
    ...(vapor ? { conditions: ['vapor'] } : {}),
    dedupe: ['vue'],
  },
  build: {
    outDir: vapor ? 'dist/vapor' : 'dist/vdom',
    emptyOutDir: true,
  },
})
