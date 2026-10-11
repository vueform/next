import { computed, ref, toRaw, watch, type WatchStopHandle } from 'vue'

import {
  clone,
  equals,
  get as getByPath,
  isEmptyValue,
  isPlainObject,
  mergeOrReplace,
  normalize,
  set as setByPath,
  toFormData,
  unset,
  warn,
} from '#src/utils'

import type { ModelInstance, ModelStore } from './types'

/**
 * Configuration options for `makeModelStore`.
 */
type ModelStoreOptions = {
  /**
   * The initial model object the store takes ownership of. Not cloned — the
   * caller is responsible for passing an owned object.
   */
  model?: Record<string, any>

  /**
   * The null-value tree matching the model's shape, used by `clear()` and the
   * `empty` computed. Dynamic containers (lists, dynamic matrices) appear as
   * arrays holding their initial rows' null values.
   */
  nullModel?: Record<string, any>
}

export type ModelStoreEvents = 'change' | 'load' | 'clear' | 'reset'

function clearedValue(value: any, nullNode: any): any {
  if (
    Array.isArray(nullNode) ||
    (nullNode === undefined && Array.isArray(value))
  ) {
    return []
  }

  if (isPlainObject(nullNode)) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(isPlainObject(value) ? value : nullNode)) {
      result[key] = clearedValue(
        isPlainObject(value) ? value[key] : undefined,
        nullNode[key]
      )
    }
    return result
  }

  if (nullNode !== undefined) return clone(nullNode)

  if (isPlainObject(value)) {
    const result: Record<string, any> = {}
    for (const key of Object.keys(value)) {
      result[key] = clearedValue(value[key], undefined)
    }
    return result
  }

  return null
}

// Instance brand + store slot: the store hangs off the instance itself under a
// private symbol (non-enumerable — invisible to key walks and JSON). Not
// exposed on the public surface.
const STORE: unique symbol = Symbol('vueform.modelStore')

/**
 * Creates a component-independent model store: the single owner of a form model
 * object with path-based reads/writes, subscriber-based change dispatching, and
 * data manipulation methods (`update` / `load` / `clear` / `reset` / `clean`)
 * plus `dirty` / `empty` state.
 *
 * Both `useModel` (standalone data ownership) and VfForm's internal root model
 * (`useData`) are built on top of it. When a `useModel` instance is passed to a
 * form, the form adopts this store directly, so the data is shared without
 * cloning.
 *
 * @param options Model store configuration object.
 */
export function makeModelStore(options: ModelStoreOptions = {}) {
  const model = ref<Record<string, any>>(options.model ?? {})
  const initialModel = ref<Record<string, any>>(clone(model.value))
  const nullModel = options.nullModel
  const adopted = ref(false)
  const adoptingContext = ref<any>(null)

  // Incrementing this schedules notify watchers without a deep model
  // traversal. Vue's scheduler coalesces synchronous increments.
  const notifyTrigger = ref(0)

  // Lets the primary notify watcher skip its deep-equality fallback after
  // a known write.
  let valueChanged = false

  const subscribers = new Map<string, Set<() => void>>()
  const listeners = new Map<ModelStoreEvents, Set<(...args: any[]) => void>>()
  const writeListeners = new Set<(dataPath: string) => void>()

  let unwatchChange: WatchStopHandle | undefined
  let lastChangeSnapshot: any

  // ============== COMPUTED ==============

  const dirty = computed(() => !equals(initialModel.value, model.value))
  const empty = computed(() => isEmptyValue(model.value, nullModel))

  // ============== METHODS ===============

  const subscribe = (dataPath: string, cb: () => void) => {
    let set = subscribers.get(dataPath)
    if (!set) subscribers.set(dataPath, (set = new Set()))
    set.add(cb)

    return () => {
      const current = subscribers.get(dataPath)
      if (!current) return
      current.delete(cb)
      if (!current.size) subscribers.delete(dataPath)
    }
  }

  /**
   * Registers a listener called synchronously with the data path of every write
   * that goes through the store (`set` / `register` / `unregister`, including
   * the per-key writes of `update` / `load` / `clear` / `reset`). Every model
   * mutation converges here, which makes it the one spot where validation can
   * observe changes without instrumenting call sites.
   */
  const onWrite = (cb: (dataPath: string) => void) => {
    writeListeners.add(cb)
    return () => {
      writeListeners.delete(cb)
    }
  }

  const notifyWrite = (dataPath: string) => {
    writeListeners.forEach((cb) => cb(dataPath))
  }

  const dispatch = (dataPath: string) => {
    if (!subscribers.size) return

    subscribers.get('')?.forEach((cb) => cb())
    if (!dataPath) return

    const parts = dataPath.split('.')
    let prefix = ''
    for (let i = 0; i < parts.length; i++) {
      prefix = prefix ? `${prefix}.${parts[i]}` : parts[i]
      subscribers.get(prefix)?.forEach((cb) => cb())
    }
  }

  const get = (dataPath?: string) => {
    if (!dataPath) return model.value
    return getByPath(model.value, dataPath)
  }

  const set = (dataPath: string, value: any) => {
    if (getByPath(model.value, dataPath) === value) return
    setByPath(model.value, dataPath, value)
    valueChanged = true
    notifyTrigger.value++
    dispatch(dataPath)
    notifyWrite(dataPath)
  }

  const register = (dataPath: string, initialModel: any) => {
    const currentValue = getByPath(model.value, dataPath)

    if (
      dataPath &&
      (!equals(currentValue, initialModel) || currentValue === undefined)
    ) {
      setByPath(model.value, dataPath, initialModel)
      notifyTrigger.value++
      dispatch(dataPath)
      notifyWrite(dataPath)
    }
  }

  const unregister = (dataPath: string) => {
    unset(model.value, dataPath)
    notifyTrigger.value++
    dispatch(dataPath)
    notifyWrite(dataPath)
  }

  const update = (data: any) => {
    if (data === undefined) return

    // Merge from the raw model so the O(N) read doesn't go through the
    // reactive proxy. Keys untouched by the merge keep their raw identity,
    // so they can be skipped here without writing anything back.
    const current = toRaw(model.value)
    const merged = mergeOrReplace(current, normalize(data))

    Object.keys(merged).forEach((key) => {
      if (merged[key] !== current?.[key]) set(key, merged[key])
    })
  }

  const load = (data: any) => {
    update(data)
    fire('load', model.value)
  }

  const clear = () => {
    const current = toRaw(model.value)
    for (const key of Object.keys(current)) {
      set(
        key,
        clearedValue(
          current[key],
          isPlainObject(nullModel) ? nullModel[key] : undefined
        )
      )
    }
    fire('clear', model.value)
  }

  const reset = () => {
    const current = toRaw(model.value)
    const initial = toRaw(initialModel.value) ?? {}

    for (const key of Object.keys(current)) {
      if (!(key in initial)) {
        unregister(key)
      }
    }
    for (const key of Object.keys(initial)) {
      set(key, clone(initial[key]))
    }
    fire('reset', model.value)
  }

  const clean = () => {
    initialModel.value = clone(model.value)
  }

  const toJSON = (): string => {
    return JSON.stringify(model.value)
  }

  const asFormData = (): FormData => {
    return toFormData(toRaw(model.value))
  }

  const fire = (event: ModelStoreEvents, ...args: any[]) => {
    listeners.get(event)?.forEach((cb) => cb(...args))
  }

  // A `change` listener lazily starts the snapshot watcher so unobserved
  // stores never pay for deep clones.
  const on = (event: ModelStoreEvents, cb: (...args: any[]) => void) => {
    let set = listeners.get(event)
    if (!set) listeners.set(event, (set = new Set()))
    set.add(cb)

    if (event === 'change') ensureChangeWatcher()

    return () => {
      const current = listeners.get(event)
      if (!current) return
      current.delete(cb)
      if (!current.size) listeners.delete(event)
    }
  }

  const ensureChangeWatcher = () => {
    if (unwatchChange) return

    lastChangeSnapshot = clone(model.value)

    unwatchChange = watch(
      notifyTrigger,
      () => {
        const snapshot = clone(model.value)
        if (equals(snapshot, lastChangeSnapshot)) return
        fire('change', snapshot, lastChangeSnapshot)
        lastChangeSnapshot = snapshot
      },
      { flush: 'post' }
    )
  }

  const consumeValueChanged = () => {
    const changed = valueChanged
    valueChanged = false
    return changed
  }

  const adopt = (context$: any) => {
    adopted.value = true
    adoptingContext.value = context$
  }

  const release = () => {
    adopted.value = false
    adoptingContext.value = null
  }

  const submit = async () => {
    if (!adoptingContext.value) {
      warn('`submit()` called on a model that is not adopted by any form')
      return undefined
    }
    return adoptingContext.value.submit()
  }

  const destroy = () => {
    unwatchChange?.()
    unwatchChange = undefined
  }

  return {
    model,
    initialModel,
    nullModel,
    adopted,
    adoptingContext,
    notifyTrigger,
    dirty,
    empty,
    subscribe,
    dispatch,
    onWrite,
    get,
    set,
    register,
    unregister,
    update,
    load,
    clear,
    reset,
    clean,
    toJSON,
    toFormData: asFormData,
    on,
    fire,
    consumeValueChanged,
    adopt,
    release,
    submit,
    destroy,
  }
}

/**
 * Binds a model instance to its backing store. Used as both the instance brand
 * (`hasModelStore`) and the store accessor (`getModelStore`).
 *
 * @param instance The model instance to brand.
 * @param store The store to bind.
 */
export function setModelStore(instance: object, store: ModelStore) {
  Object.defineProperty(instance, STORE, { value: store, enumerable: false })
}

/**
 * Returns the underlying model store of a `useModel` instance.
 *
 * Module-internal — consumed by `makeRootModel` for form adoption, never
 * exposed outside the module.
 *
 * @param instance The model instance to unwrap.
 */
export function getModelStore(instance: ModelInstance<any>): ModelStore {
  return (instance as unknown as { [STORE]: ModelStore })[STORE]
}

/**
 * Whether a value is a `useModel` instance. VfForm checks `modelValue` with it
 * to adopt the instance's store directly instead of cloning the data.
 *
 * @param value The value to check.
 */
export function hasModelStore(value: any): value is ModelInstance {
  return !!value && typeof value === 'object' && STORE in value
}
