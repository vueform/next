import * as vue from 'vue'

declare const __VUEFORM_VAPOR__: boolean | undefined

// The Vue 3.6 vapor runtime bindings behind the `#vapor-bindings` internal
// specifier (see the package's `imports` field). Shared modules value-import
// this specifier, and RESOLUTION picks the copy: the `vapor` condition (the
// same one that selects the vapor dist in `exports`) resolves to this module's
// vapor-mode compile, everything else to the main-mode compile, where the
// define folds the Vue accesses away entirely — so the singly-compiled main
// dist graph never references a Vue export that 3.5 lacks (consumer bundlers
// on 3.5 would warn and native ESM would throw). Vapor builds only ever run on
// Vue 3.6+, where the accessed exports exist. STATIC namespace property access
// (`vue.x`) is load-bearing here: it reads the live binding AND stays
// tree-shakeable — aliasing the namespace into a record or using computed
// access makes Rolldown-based consumer builds retain the entire vue runtime
// (~50 kB gzip).

/**
 * Reads Vue's live `currentInstance` binding (3.6 exports it; it holds vapor
 * instances during vapor setup, where `getCurrentInstance()` returns null).
 * Always `undefined` outside vapor mode.
 */
export const getVaporCurrentInstance: () => unknown =
  typeof __VUEFORM_VAPOR__ !== 'undefined' && __VUEFORM_VAPOR__
    ? () => (vue as Record<string, any>).currentInstance
    : () => undefined

/**
 * The marker Vue 3.6's `renderSlot` reads to route a slot function through the
 * `VaporSlot` interop block (a Symbol since 3.6.0-rc.3; absent on runtimes
 * that only use the `__vapor` boolean marker). Always `undefined` outside
 * vapor mode.
 */
export const vaporSlotKey: symbol | undefined =
  typeof __VUEFORM_VAPOR__ !== 'undefined' && __VUEFORM_VAPOR__
    ? ((vue as Record<string, any>).rawVaporSlotKey as symbol | undefined)
    : undefined
