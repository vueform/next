```ts
/**
 * Returns reactive theme token styling from a `tokens` prop: token keys are
 * normalized to `--vf-*` CSS custom properties, with `tokens.dark` overrides
 * merged in when dark mode is active.
 *
 * @param source The `tokens` prop value: a map of theme token overrides,
 *   optionally with a `dark` section.
 * @param dark Force dark (`true`) or light (`false`) for `tokens.dark`
 *   overrides. Omit to inherit from the global config.
 */
function useTokens(
  source: MaybeRefOrGetter<Record<string, any>>,
  dark?: MaybeRefOrGetter<boolean | undefined>
): {
  /**
   * Reactive inline style object with resolved theme token CSS custom
   * properties.
   */
  tokens: ComputedRef<CSSProperties>

  /**
   * Unique security nonce for injecting scoped styles.
   */
  nonce: Readonly<Ref<string | undefined, string | undefined>>

  /**
   * A unique CSS class scoped to this component instance, used to target the
   * injected token style rule.
   */
  tokenClass: string

  /**
   * The CSS text for scoped token custom properties on this component
   * instance — a base rule plus a browser-resolved dark-mode block, so the
   * text is identical between server and client renders.
   */
  tokenCss: ComputedRef<string>
}
```
