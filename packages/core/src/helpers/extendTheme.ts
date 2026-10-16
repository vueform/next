import type { InferThemeTokens } from '#src/types'

/**
 * Produces a new theme object by layering overrides on top of an existing
 * theme: top-level keys replace same-named tokens, `dark` blocks are
 * shallow-merged. The base object is not mutated.
 *
 * @param base The token map to extend.
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
