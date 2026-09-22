```ts
/**
 * The exhaustive theme shape derived from a concrete theme definition: every
 * top-level token is **required**, and a `dark` override map must be present
 * (`{}` opts out of a dark variant). Adapters use this to type their
 * `defineTheme` helper so authoring a theme from scratch cannot silently omit
 * tokens — a missing or mistyped key surfaces as a type error.
 */
type CompleteTheme<T extends Record<string, any>> = {
  [K in ThemeTokenKeys<T>]: string | number
} & {
  dark: { [K in ThemeTokenKeys<T>]?: string | number }
}
```
