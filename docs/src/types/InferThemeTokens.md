````ts
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
type InferThemeTokens<T extends Record<string, any>> = {
  [K in ThemeTokenKeys<T>]?: string | number
} & {
  dark?: { [K in ThemeTokenKeys<T>]?: string | number } & Record<
    string,
    string | number | undefined
  >
  [key: string]: any
}
````
