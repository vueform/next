```ts
/**
 * The inert theme surface used when the `theme` module is not registered —
 * behaves as if theming wasn't there: token styles resolve to an empty object
 * and no CSS is generated or injected. Warns once in dev when tokens are
 * actually provided.
 */
const noopTheme: ThemeModule
```
