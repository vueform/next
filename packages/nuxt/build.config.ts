// Unbuild config consumed by @nuxt/module-builder. The Vueform packages are
// type-only imports resolved by the consumer's install (ui/primevue are
// peers; core arrives transitively) — keep them external instead of letting
// the d.ts rollup try to inline their entire type surface.
export default {
  externals: ['@vueform/core', '@vueform/ui', '@vueform/primevue'],
}
