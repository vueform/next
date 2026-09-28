/**
 * Vendored type-assertion helpers (no vitest/tsd — vitest's typecheck mode
 * can't cover .vue templates and fixtures should carry no extra tooling). A
 * failing assertion is a tier-1 `vue-tsc --noEmit` error.
 */

export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false

export type Expect<T extends true> = T

export type Extends<A, B> = A extends B ? true : false

export type Not<T extends boolean> = T extends true ? false : true
