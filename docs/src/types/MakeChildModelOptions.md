```ts
/**
 * Configuration options for `makeChildModel`.
 */
type MakeChildModelOptions = {
  /**
   * The parent model surface the element reads from and writes to — typed
   * structurally so the module never learns component container semantics.
   */
  parent: {
    /**
     * The parent's model object holding this element's slice.
     */
    model: Ref<any>

    /**
     * Writes a value at an absolute data path within the root model.
     *
     * @param path The absolute dot-notation data path.
     * @param value The value to set.
     */
    update: (path: string, value: any) => void

    /**
     * Subscribes to changes at an absolute data path (and its descendants),
     * returning an unsubscribe function.
     *
     * @param path The absolute dot-notation data path.
     * @param cb The callback invoked when the path's subtree changes.
     */
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
   * Event emitter for firing model change events during synchronization: the
   * `change` event on value changes and `update:modelValue` for v-model sync.
   */
  fire: {
    (e: 'change', newValue: any, oldValue: any, context$: any): any
    (e: 'update:modelValue', value: any): any
  }

  /**
   * Writes the given value back to the parent's model for this element
   * (typically the element's own `update` method), also used to apply inbound
   * `v-model` changes.
   *
   * @param data The new value to set.
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
