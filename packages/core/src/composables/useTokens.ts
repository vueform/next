import { computed, toRef, useId, type MaybeRefOrGetter } from 'vue'
import { getThemeModule } from '~/modules/theme'
import { useConfig } from './useConfig'

/**
 * Returns a reactive inline style object from a `tokens` prop. Token keys are
 * normalized to `--vf-*` CSS custom properties and `$ref` values are resolved
 * to `var(--vf-*)`. When dark mode is active, `tokens.dark` overrides are
 * merged in.
 *
 * An optional `dark` parameter explicitly forces dark (`true`) or light
 * (`false`) mode for this component's `tokens.dark` inline overrides. Omit to
 * follow the global dark-mode detection.
 *
 * @param tokens Token overrides — typically `toRef(props, 'tokens')`.
 * @param dark Force dark (`true`) or light (`false`) for `tokens.dark`
 *   overrides. Omit to inherit from the global config.
 * @private
 */
export function useTokens(
  source: MaybeRefOrGetter<Record<string, any>>,
  dark?: MaybeRefOrGetter<boolean | undefined>
) {
  const config = useConfig()
  const { makeTokens } = getThemeModule()

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
   * A unique CSS class scoped to this button instance, used to target the
   * injected token style rule.
   */
  const tokenClass = `vf-t-${useId().replace(/:/g, '-')}`

  /**
   * The CSS text for scoped token custom properties on this button instance.
   */
  const tokenCss = computed(() => {
    const entries = Object.entries(tokens.value)
    if (!entries.length) return ''
    return `.${tokenClass}{${entries.map(([k, v]) => `${k}:${v}`).join(';')}}`
  })

  return {
    tokens,
    nonce,
    tokenClass,
    tokenCss,
  }
}
