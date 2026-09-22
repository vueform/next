````ts
/**
 * Intersects a PrimeVue component's Props with all valid `pt:` shorthand
 * attributes (e.g. `pt:root:class`, `pt:pc-toggle-button:root:class`).
 *
 * @example
 *   ;```ts
 *   input: WithPtShorthands<PvSelectButtonProps>
 *   ```
 */
type WithPtShorthands<Props extends { pt?: any }> = Props & {
  [key: `pt:${string}`]: any
}
````
