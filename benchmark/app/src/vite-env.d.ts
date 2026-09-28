/// <reference types="vite/client" />

/** True in the vapor build (set by vite.config.ts `define`). */
declare const __BENCH_VAPOR__: boolean

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
