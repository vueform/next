```ts
/**
 * The prop-dependent slice of the translatable `makeData` return —
 * `MakeDataModelApi` counterpart for translatable elements.
 *
 * The `modelValue` prop may provide a partial locale object (optional keys),
 * but the runtime model always carries every language key — so `model` /
 * `initialModel` are `Required` versions of the prop shape. `update` / `load`
 * follow the `modelValue` prop shape via `MakeDataModelApi`.
 *
 * `TValue` is the type of the element's current value — the active language's
 * entry when translating, the model itself otherwise. It is supplied by each
 * blueprint from its own generics (text/textarea pass their fixed scalar, field
 * derives it from `nullValue`) rather than being dissected out of the model
 * type, which cannot distinguish a locale record from an object-shaped model
 * and collapses entirely on the `NoInfer`-wrapped wide model union.
 */
type MakeDataModelApiTranslatable<
  P = MakeDataOptions['props'],
  TValue = any,
> = Pick<MakeDataModelApi<P>, 'update' | 'load'> & {
  /**
   * The element's reactive model value within the form data tree. Always
   * contains every language key for translatable elements.
   */
  model: Ref<RequiredModelOf<ModelOfProps<P>>>

  /**
   * A snapshot of the model at initialization time.
   */
  initialModel: Ref<RequiredModelOf<ModelOfProps<P>>>

  /**
   * The element's current value — the active language's entry for translatable
   * elements.
   */
  value: WritableComputedRef<TValue>
}
```
