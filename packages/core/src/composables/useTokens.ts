import { toRef, useId, type MaybeRefOrGetter } from 'vue'

import { getThemeModule } from '#src/modules/theme'

import { useConfig } from './useConfig'

/**
 * Returns reactive theme token styling from a `tokens` prop: token keys are
 * normalized to `--vf-*` CSS custom properties, with `tokens.dark` overrides
 * merged in when dark mode is active.
 *
 * @private
 * @param source The `tokens` prop value: a map of theme token overrides,
 *   optionally with a `dark` section.
 * @param dark Force dark (`true`) or light (`false`) for `tokens.dark`
 *   overrides. Omit to inherit from the global config.
 */
export function useTokens(
  source: MaybeRefOrGetter<Record<string, any>>,
  dark?: MaybeRefOrGetter<boolean | undefined>
) {
  const config = useConfig()
  const { makeTokens, makeTokenCss } = getThemeModule()

  /**
   * Reactive inline style object with resolved theme token CSS custom
   * properties.
   */
  const tokens = makeTokens(source, dark)

  /**
   * Unique security nonce for injecting scoped styles.
   */
  const nonce = toRef(() => config.nonce)

  /**
   * A unique CSS class scoped to this component instance, used to target the
   * injected token style rule.
   */
  const tokenClass = `vf-t-${useId().replace(/:/g, '-')}`

  /**
   * The CSS text for scoped token custom properties on this component
   * instance — a base rule plus a browser-resolved dark-mode block, so the
   * text is identical between server and client renders.
   */
  const tokenCss = makeTokenCss(source, dark, tokenClass)

  return {
    tokens,
    nonce,
    tokenClass,
    tokenCss,
  }
}
