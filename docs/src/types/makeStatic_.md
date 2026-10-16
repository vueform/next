```ts
/**
 * Registers a static element with its parent container — path only, no data
 * path, no model — so `form$.find()` and children walking see it, while data
 * collection skips it via the `isStatic` context flag. Static elements are
 * the data-less ones (no data feature in their blueprint chain): button,
 * content. No container means a detached or standalone element — nothing to
 * register with.
 *
 * @param options Factory options containing resolved dependencies.
 */
const makeStatic: (
  config?: unknown
) => (options: MakeStaticOptions) => { isStatic: boolean }
```
