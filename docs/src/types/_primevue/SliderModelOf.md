```ts
/**
 * Slider model shaped by `range`:
 *
 * - `range: false` — `string | number | null`
 * - `range: true` — `(string | number)[]`
 * - `range` unset / wide `boolean` — `TextishMaybeArrayModel`
 */
type SliderModelOf<TRange extends boolean = boolean> = [boolean] extends [
  TRange,
]
  ? TextishMaybeArrayModel
  : [TRange] extends [true]
    ? TextishArrayModel
    : TextishModel
```
