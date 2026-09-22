```ts
/**
 * Whether a registered element's wide props include a `modelValue` prop (i.e.
 * the element carries form data).
 */
type HasModelProp<N extends ElementNames> =
  'modelValue' extends keyof ElementRegistry[N]['props'] ? true : false
```
