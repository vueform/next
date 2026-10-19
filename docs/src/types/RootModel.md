```ts
/**
 * The root-level form model returned by `makeRootModel`: the store-backed model
 * refs plus the registration and lifecycle interface owned by the element
 * operating as the form root. `makeChildModel` mirrors the model refs and
 * lifecycle subset of this interface.
 */
type RootModel = {
  /**
   * The backing model store — the form's own, or the attached `useModel` store
   * when `modelValue` carries one.
   */
  store: ModelStore

  /**
   * Whether the model attached an existing `useModel` store from `modelValue`
   * instead of creating its own.
   */
  attached: boolean

  /**
   * The schema index describing every data-carrying element: the attached
   * instance's index, or an empty one for internally created stores.
   */
  index: SchemaIndex

  /**
   * The attached `useModel` instance's element lookup, `undefined` when the
   * store was created internally.
   */
  modelFind: ((path: string) => StatefulElement | undefined) | undefined

  /**
   * The reactive model object holding all element values.
   */
  model: Ref<Record<string, any>>

  /**
   * A snapshot of the model taken at init, used for change detection.
   */
  lastModel: Ref<any>

  /**
   * A snapshot of the model at creation time (re-snapshotted by `clean()`),
   * used for dirty checking and reset.
   */
  initialModel: Ref<Record<string, any>>

  /**
   * Sets the value at the given data path within the model.
   */
  set: (dataPath: string, value: any) => void

  /**
   * Registers an element's data path in the model, seeding its initial value.
   */
  register: (dataPath: string, initialModel: any) => void

  /**
   * Removes an element's data path from the model. No-op once the form is torn
   * down when the store is attached, so the store's data survives child
   * unregistration.
   */
  unregister: (dataPath: string) => void

  /**
   * Subscribes a callback to writes at the given data path, returning an
   * unsubscribe function.
   */
  subscribe: (dataPath: string, cb: () => void) => () => void

  /**
   * Initializes the model: takes the initial snapshots, emits the initial
   * v-model value, and starts inbound watching (own stores only).
   */
  init: () => void

  /**
   * Tears down the model binding and releases (attached) or destroys (own) the
   * store.
   */
  destroy: () => void
}
```
