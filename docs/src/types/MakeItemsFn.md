```ts
/**
 * Factory that normalizes option items (arrays, objects, arrays of objects)
 * into a uniform structure with resolved value, label, and disabled state.
 * Supports conditional disabled and conditional availability via
 * `ConditionalProp`. Automatically clears selected values whose items become
 * unavailable. Also exposes library-friendly `rawItems` plus label/value/
 * disabled accessors for adapters that forward options to third-party
 * components.
 */
type MakeItemsFn = <P extends MakeItemsOptions['props']>(options: {
  props: P
  deps: MakeItemsOptions['deps']
}) => MakeItemsReturn<P>
```
