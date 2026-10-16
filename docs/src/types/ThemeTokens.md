```ts
/**
 * The shape of the `tokens` property accepted by `VueformConfig` and the
 * per-form / per-element `tokens` prop. Defaults to a loose record so core
 * remains visual-layer-agnostic. Adapter packages augment this interface via
 * declaration merging to restrict it to their known tokens.
 */
interface ThemeTokens {
  [key: string]: any
}
```
