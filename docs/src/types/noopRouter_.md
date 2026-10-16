```ts
/**
 * The inert router surface used when the `router` module is not registered —
 * behaves as if history integration wasn't there: handlers record nothing and
 * navigate nowhere. Warns once in dev when history tracking is actually
 * requested (`active` resolves to `true`).
 */
const noopRouter: RouterModule
```
