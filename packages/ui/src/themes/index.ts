import type { CompleteTheme, InferThemeTokens } from '@vueform/core'

import type { origin } from './tokens'

declare module '@vueform/core' {
  interface ThemeTokens extends InferThemeTokens<typeof origin> {}
}

/**
 * Type-safe helper for authoring a complete ui theme from scratch. Every token
 * of the built-in themes must be defined — a missing or mistyped key surfaces
 * as a type error — and an explicit `dark` block is required (pass `{}` to opt
 * out of a dark variant). Extra custom tokens are accepted alongside the
 * built-in set. To derive a theme from an existing one instead, use
 * `extendTheme`; to author a theme with your own token structure (for a custom
 * visual layer), use the structure-agnostic `defineTheme` from the root entry.
 *
 * @param theme The complete theme definition.
 */
export function defineTheme<T extends CompleteTheme<typeof origin>>(
  theme: T
): T {
  return theme
}

export { extendTheme } from '@vueform/core'
export * from './tokens'
