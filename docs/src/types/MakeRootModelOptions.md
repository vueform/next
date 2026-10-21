```ts
type MakeRootModelOptions = {
  /**
   * The reactive ref bound to the form's `v-model`, used as the initial source
   * of truth for the root model. When it holds a `useModel` instance, its store
   * is attached directly (shared data, no clone or v-model sync).
   */
  modelValue: Ref<any>

  /**
   * Whether the component has an active `v-model` binding (raw prop detection,
   * supplied by the component adapter). Attached stores override it to `false`
   * internally — the store is the single source of truth, so no v-model
   * emission happens.
   */
  hasVModel: Ref<boolean>

  /**
   * The form's component context, recorded on attached stores (backing
   * `instance.submit()`) and passed to `change` events. Opaque to the module.
   */
  context$: any

  /**
   * Whether any callback is registered for the given event. When provided, the
   * notify watcher skips the model snapshot (a deep clone of the whole model)
   * on flushes where neither a `v-model` nor a `change` listener would consume
   * it. When omitted, a snapshot is taken on every flush.
   */
  hasListeners?: (e: 'change') => boolean

  /**
   * Applies an inbound external `modelValue` change to the root model (e.g. the
   * form context's `update`).
   */
  applyInbound: (data: any) => void

  /**
   * Fires the `change` event on value changes and `update:modelValue` for
   * v-model sync.
   */
  fire: ModelEventFire
}
```
