```ts
type MakeChildModelOptions = {
  /**
   * The parent model surface the element reads from and writes to — typed
   * structurally so the module never learns component container semantics.
   */
  parent: {
    model: Ref<any>
    update: (path: string, value: any) => void
    subscribe: (path: string, cb: () => void) => () => void
  }

  /**
   * The element's name, used as the key into the parent's model.
   */
  name: Ref<ElementName>

  /**
   * The element's absolute data path within the root model, used to subscribe
   * to changes of its slice (and its descendants).
   */
  dataPath: Ref<string>

  /**
   * The external `v-model` ref bound by the parent, if any.
   */
  modelValue?: Ref<any>

  /**
   * Whether the element is currently available (visible). Unavailable elements
   * skip outbound model synchronization.
   */
  available?: Ref<boolean>

  /**
   * Whether the element's data is flattened into the parent rather than nested
   * under its own `name` key. Flat containers project a scoped model from their
   * own children's keys and subscribe to those keys individually instead of
   * their own data path (which equals the parent's).
   */
  flat: Ref<boolean>

  /**
   * The element's registered child contexts. Required for flat containers,
   * whose scoped model is built from these children's keys within the parent's
   * model. Opaque to the module beyond `isFlatContainer` / `name` / `model`.
   */
  children?: Ref<any[]>

  /**
   * Whether the component has an active `v-model` binding (raw prop detection,
   * supplied by the component adapter).
   */
  hasVModel: Ref<boolean>

  /**
   * The element's component context passed to `change` events. Opaque to the
   * module.
   */
  context$: any

  /**
   * Fires the `change` event on value changes and `update:modelValue` for
   * v-model sync.
   */
  fire: ModelEventFire

  /**
   * Writes the given value back to the parent's model for this element
   * (typically the element's own `update` method), also used to apply inbound
   * `v-model` changes.
   */
  update: (data: any) => void

  /**
   * Whether any callback is registered for the given event. When provided and
   * neither a `v-model` nor a `change` listener would consume the notification,
   * the notify watcher skips firing events and skips the model snapshot (a deep
   * clone of the element's slice) on flushes where the value did not change.
   * When omitted, the full notify path runs on every flush.
   */
  hasListeners?: (e: 'change') => boolean
}
```
