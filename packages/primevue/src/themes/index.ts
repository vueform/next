import type { theme } from './tokens'
import type { CompleteTheme, InferThemeTokens } from '@vueform/core'

declare module '@vueform/core' {
  interface ThemeTokens extends InferThemeTokens<typeof theme> {}
}

/**
 * Type-safe helper for authoring a complete PrimeVue-adapter theme from
 * scratch. Every token of the built-in theme must be defined — a missing or
 * mistyped key surfaces as a type error — and an explicit `dark` block is
 * required (pass `{}` to opt out of a dark variant). Extra custom tokens are
 * accepted alongside the built-in set. To derive a theme from the existing one
 * instead, use `extendTheme`; to author a theme with your own token structure
 * (for a custom visual layer), use the structure-agnostic `defineTheme` from
 * the root entry.
 *
 * @param definition The complete theme definition.
 */
export function defineTheme<T extends CompleteTheme<typeof theme>>(
  definition: T
): T {
  return definition
}

export { extendTheme } from '@vueform/core'
export * from './tokens'
