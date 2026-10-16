```ts
/**
 * Marks a value placed on a context's raw object as opaque to Vue's reactivity.
 * The rule this enforces: `ref(context)` (or a deep reactive collection holding
 * a context) builds Vue's `reactive()` view over the raw object, and that view
 * would wrap any plain object it reaches — so whatever lands on the raw object
 * and is not reactive state is `markRaw`ed at placement. A no-op for
 * non-objects, refs, Vue proxies (incl. other contexts), and already-marked
 * objects, so shared values (the config) are only reshaped once.
 *
 * @param value The value being placed on a context's raw object.
 */
function opaque<T>(value: T): T
```
