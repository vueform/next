```ts
/**
 * Whether `TItems` is still the unconstrained `ItemsProp` default (no concrete
 * items shape has been inferred yet).
 */
type IsDefaultItems<TItems> = [TItems] extends [ItemsProp]
  ? [ItemsProp] extends [TItems]
    ? true
    : false
  : false
```
