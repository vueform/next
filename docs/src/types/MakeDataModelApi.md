```ts
/**
 * The prop-dependent slice of the `makeData` return: model fields and mutators
 * following `P['modelValue']`. Single source of truth for model narrowing —
 * blueprints receive it automatically through `MakeDataReturn<P>` without any
 * per-component overlay.
 */
type MakeDataModelApi<P = MakeDataOptions['props']> = {
  /**
   * The element's reactive model value within the form data tree.
   */
  model: Ref<ModelOfProps<P>>

  /**
   * A snapshot of the model at initialization time.
   */
  initialModel: Ref<ModelOfProps<P>>

  /**
   * The element's current value.
   */
  value: WritableComputedRef<ModelOfProps<P>>

  /**
   * Updates the element's model value.
   *
   * @param data The new model value.
   */
  update: (data: ModelOfProps<P>) => void

  /**
   * Loads data into the element's model.
   *
   * @param data The value to load.
   */
  load: (data: ModelOfProps<P>) => void
}
```
