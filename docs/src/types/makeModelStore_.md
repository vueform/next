```ts
/**
 * Creates a component-independent model store: the single owner of a form model
 * object with path-based reads/writes, subscriber-based change dispatching, and
 * data manipulation methods (`update` / `load` / `clear` / `reset` / `clean`)
 * plus `dirty` / `empty` state.
 *
 * Both `useModel` (standalone data ownership) and VfForm's internal root model
 * (`useData`) are built on top of it. When a `useModel` instance is passed to a
 * form, the form attaches this store directly, so the data is shared without
 * cloning.
 *
 * @param options Model store configuration object.
 */
function makeModelStore(options: ModelStoreOptions = {}): {
  model: Ref<Record<string, any>, Record<string, any>>
  initialModel: Ref<Record<string, any>, Record<string, any>>
  nullModel: Record<string, any> | undefined
  attached: Ref<boolean, boolean>
  attachingContext: Ref<any, any>
  notifyTrigger: Ref<number, number>
  dirty: ComputedRef<boolean>
  empty: ComputedRef<boolean>
  subscribe: (dataPath: string, cb: () => void) => () => void
  dispatch: (dataPath: string) => void

  /**
   * Registers a listener called synchronously with the data path of every write
   * that goes through the store (`set` / `register` / `unregister`, including
   * the per-key writes of `update` / `load` / `clear` / `reset`). Every model
   * mutation converges here, which makes it the one spot where validation can
   * observe changes without instrumenting call sites.
   */
  onWrite: (cb: (dataPath: string) => void) => () => void

  get: (dataPath?: string) => any
  set: (dataPath: string, value: any) => void
  register: (dataPath: string, initialModel: any) => void
  unregister: (dataPath: string) => void
  update: (data: any) => void
  load: (data: any) => void
  clear: () => void
  reset: () => void
  clean: () => void
  toJSON: () => string
  toFormData: () => FormData
  on: (event: ModelStoreEvents, cb: (...args: any[]) => void) => () => void
  fire: (event: ModelStoreEvents, ...args: any[]) => void
  consumeValueChanged: () => boolean
  attach: (context$: any) => void
  release: () => void
  submit: () => Promise<any>
  destroy: () => void
}
```
