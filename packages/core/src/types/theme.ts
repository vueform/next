/**
 * The shape of the `tokens` property accepted by `VueformConfig` and the
 * per-form / per-element `tokens` prop. Defaults to a loose record so core
 * remains visual-layer-agnostic. Adapter packages augment this interface via
 * declaration merging to restrict it to their known tokens.
 */
export interface ThemeTokens {
  [key: string]: any
}

/**
 * Extracts all top-level token keys from a flat theme object, excluding the
 * reserved `dark` entry.
 */
export type ThemeTokenKeys<T> = Exclude<keyof T, 'dark'> & string

/**
 * The exhaustive theme shape derived from a concrete theme definition: every
 * top-level token is **required**, and a `dark` override map must be present
 * (`{}` opts out of a dark variant). Adapters use this to type their
 * `defineTheme` helper so authoring a theme from scratch cannot silently omit
 * tokens — a missing or mistyped key surfaces as a type error.
 */
export type CompleteTheme<T extends Record<string, any>> = {
  [K in ThemeTokenKeys<T>]: string | number
} & {
  dark: { [K in ThemeTokenKeys<T>]?: string | number }
}

/**
 * Infers the `ThemeTokens` shape from a concrete theme map: every top-level
 * token key becomes optional, `dark` is surfaced as an override map, and
 * arbitrary custom keys stay accepted via the open index signature.
 *
 * This is what the adapters' `/themes` entries plug into the `ThemeTokens`
 * augmentation to make their token keys known to the editor — and what you use
 * to do the same for a custom-structure theme of your own:
 *
 * @example
 *   ;```ts
 *   declare module '\@vueform/core' {
 *     interface ThemeTokens extends InferThemeTokens<typeof myTheme> {}
 *   }
 *   ```
 */
export type InferThemeTokens<T extends Record<string, any>> = {
  [K in ThemeTokenKeys<T>]?: string | number
} & {
  dark?: { [K in ThemeTokenKeys<T>]?: string | number } & Record<
    string,
    string | number | undefined
  >
  [key: string]: any
}
