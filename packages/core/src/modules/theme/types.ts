import type { CSSProperties, ComputedRef, MaybeRefOrGetter } from 'vue'

/**
 * Dark-mode configuration accepted by `createVueform` and the form-level
 * `darkMode` prop.
 *
 * - `'system'` — follows the OS preference via `prefers-color-scheme`.
 * - A CSS subselector string — watches `<html>` for a class or attribute.
 *   Examples: `'.dark'`, `'[data-theme="dark"]'`.
 */
export type DarkModeConfig = 'system' | (string & {})

/**
 * The theme module API. Owns token style generation and shared dark-mode
 * detection (CSS generation / injection happen at registration, not on the
 * instance).
 */
export interface ThemeModule {
  /**
   * Creates a reactive `ComputedRef<CSSProperties>` from a `tokens` prop,
   * converting token keys to `--vf-*` CSS custom properties and applying
   * `tokens.dark` overrides when dark mode is active.
   *
   * An optional `dark` parameter explicitly forces dark (`true`) or light
   * (`false`) for this component's `tokens.dark` inline overrides. When
   * `undefined`, falls back to the global dark-mode detection.
   *
   * Must be called during component `setup()`.
   *
   * @param tokens The theme tokens object (or a getter/ref to one).
   * @param dark Optional explicit dark-mode override for this component.
   */
  makeTokens: (
    tokens: MaybeRefOrGetter<Record<string, any>>,
    dark?: MaybeRefOrGetter<boolean | undefined>
  ) => ComputedRef<CSSProperties>
}

/**
 * Configuration options for the theme module (`config.$theme`).
 */
export interface ThemeModuleOptions {}
