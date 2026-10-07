import type { InferThemeTokens } from '#src/types'

/**
 * Produces a new theme object by layering overrides on top of an existing
 * theme. Non-`dark` keys replace same-named tokens at the top level. The `dark`
 * override is shallow-merged with the base's `dark`.
 *
 * The base object is not mutated.
 *
 * @param base The token map to extend (typically `origin` or another
 *   `defineTheme` result).
 * @param overrides Token overrides — keyed by the base theme's tokens, custom
 *   keys accepted.
 */
export function extendTheme<TBase extends Record<string, any>>(
  base: TBase,
  overrides: InferThemeTokens<TBase>
): TBase {
  const { dark: darkOverrides, ...rest } = overrides as Record<string, any>

  const result: Record<string, any> = { ...base, ...rest }

  if (darkOverrides && typeof darkOverrides === 'object') {
    result.dark = {
      ...((base as any).dark ?? {}),
      ...darkOverrides,
    }
  }

  return result as TBase
}
