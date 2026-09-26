```ts
/**
 * The inert devtools surface used when the `devtools` module is not registered
 * — and served by the module itself in production or with `devtools: false` in
 * the config. Every method is a no-op: nothing is tracked, no DevTools plugin
 * is registered. Never mutated — shared by every caller.
 */
const noopDevtools: DevtoolsModule
```
