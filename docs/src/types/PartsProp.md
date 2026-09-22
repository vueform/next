```ts
/**
 * Prop type for overriding a component's template parts. Each part may be
 * provided as a static value or as a function (with optional context-aware
 * variants), regardless of whether the underlying part is itself callable.
 */
type PartsProp<T, TContext = any> = {
  [K in keyof T]?: PartValue<T[K], TContext>
}
```
