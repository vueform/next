import {
  computed,
  ref,
  toRef,
  unref,
  watch,
  type Ref,
  type WatchStopHandle,
} from 'vue'

import type { ElementName } from '#src/types'
import { clone, equals, isPlainObject } from '#src/utils'

import { getInternals, getModelStore, hasModelStore } from './internals'
import { makeModelStore } from './store'
import type { ModelStore, RootModel, SchemaIndex } from './types'
import { makeEmptyIndex } from './walk'

type ModelEventFire = {
  (e: 'change', newValue: any, oldValue: any, context$: any): any
  (e: 'update:modelValue', value: any): any
}

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

// The sync core shared by the root and child models: outbound notify
// (v-model emission + change events) and inbound v-model application.
function makeBinding(options: {
  model: Ref<any>
  modelValue: Ref<any>
  notifyTrigger: Ref<number>
  hasVModel: Ref<boolean>
  lastModel: Ref<any>
  context$: any
  consumeValueChanged: () => boolean
  hasListeners?: (e: 'change') => boolean
  fire: ModelEventFire
  applyInbound: (data: any) => void
  shouldNotify?: () => boolean
  onSkippedFlush?: (changed: boolean) => void
}) {
  let lastEmitted: any = undefined
  let unwatchNotify: WatchStopHandle | undefined
  let unwatchModelValue: WatchStopHandle | undefined

  const emitInitial = () => {
    if (
      options.hasVModel.value &&
      !equals(options.modelValue.value, options.model.value)
    ) {
      const snapshot = clone(options.model.value)
      lastEmitted = snapshot
      options.fire('update:modelValue', snapshot)
    }
  }

  const initNotify = () => {
    unwatchNotify = watch(
      options.notifyTrigger,
      () => {
        const changed = options.consumeValueChanged()

        if (options.shouldNotify && !options.shouldNotify()) return

        // Skip the snapshot — an O(N) deep clone of the bound slice — when
        // nothing consumes it: no v-model bound and no change listeners.
        // Checked on every flush, so a listener added later via `on('change')`
        // resumes snapshotting immediately; its first event then reports the
        // old value as of the last observed flush.
        if (
          !options.hasVModel.value &&
          options.hasListeners &&
          !options.hasListeners('change')
        ) {
          options.onSkippedFlush?.(changed)
          return
        }

        const snapshot = clone(options.model.value)

        if (
          !changed &&
          options.lastModel.value !== undefined &&
          equals(snapshot, options.lastModel.value)
        ) {
          return
        }

        if (options.hasVModel.value) {
          lastEmitted = snapshot
          options.fire('update:modelValue', snapshot)
        }

        if (options.lastModel.value !== undefined) {
          options.fire(
            'change',
            snapshot,
            options.lastModel.value,
            options.context$
          )
        }

        options.lastModel.value = snapshot
      },
      { flush: 'post' }
    )
  }

  // Values just emitted outbound (`lastEmitted`) are ignored to prevent echo
  // loops.
  const initInbound = () => {
    unwatchModelValue = watch(
      () => options.modelValue.value,
      (n) => {
        if (n === undefined) return
        if (n === lastEmitted) return
        if (equals(options.model.value, n)) return

        options.applyInbound(clone(n))
      },
      { deep: true }
    )
  }

  const destroy = () => {
    unwatchNotify?.()
    unwatchModelValue?.()
    unwatchNotify = undefined
    unwatchModelValue = undefined
  }

  return {
    emitInitial,
    initNotify,
    initInbound,
    destroy,
  }
}

/**
 * Creates the root-level reactive model for a form, providing model sync,
 * registration, and lifecycle methods.
 *
 * Always backed by a model store and schema index: when `modelValue` holds a
 * `useModel` instance the form attaches its store and index (the store stays the
 * single source of truth — no v-model emission or inbound watcher), otherwise a
 * store is created internally from the plain `modelValue` and kept in sync with
 * it, with an empty index filled by mounted registration.
 *
 * @param options Root model configuration object.
 */
export function makeRootModel(options: MakeRootModelOptions): RootModel {
  const { context$ } = options

  const initialModelValue = unref(options.modelValue)

  const attached = hasModelStore(initialModelValue)

  const store: ModelStore = attached
    ? getModelStore(initialModelValue)
    : makeModelStore({ model: clone(initialModelValue) || {} })

  const index: SchemaIndex = attached
    ? initialModelValue.index
    : makeEmptyIndex()

  // The engine's virtual find, not the instance's: the instance's `find`
  // prefers the attached form's, which falls back here — a cycle otherwise.
  const modelFind = attached
    ? getInternals(initialModelValue).engine.find
    : undefined

  const model = store.model
  const lastModel = ref()
  const initialModel = store.initialModel

  if (attached) {
    store.attach(context$)
  }

  // Attached stores skip v-model emission — the store is the single source of
  // truth.
  const hasVModel = computed(() => !attached && options.hasVModel.value)

  // The form's teardown runs before its children; this keeps an attached
  // store's data from being wiped by child unregistration.
  let destroyed = false

  const binding = makeBinding({
    model,
    modelValue: options.modelValue,
    notifyTrigger: store.notifyTrigger,
    hasVModel,
    lastModel,
    context$,
    consumeValueChanged: store.consumeValueChanged,
    hasListeners: options.hasListeners,
    fire: options.fire,
    applyInbound: options.applyInbound,
  })

  const unregister = (dataPath: string) => {
    if (destroyed && attached) return
    store.unregister(dataPath)
  }

  const init = () => {
    lastModel.value = clone(model.value)

    if (attached) {
      // Child registration may have seeded keys the schema walk missed —
      // re-snapshot so they don't read as dirty, but never wipe changes the
      // user made before attachment.
      if (!store.dirty.value) store.clean()
    } else {
      initialModel.value = clone(model.value)
    }

    binding.emitInitial()
    binding.initNotify()

    // An attached store is the single source of truth — no inbound watcher.
    if (!attached) {
      binding.initInbound()
    }
  }

  const destroy = () => {
    destroyed = true

    binding.destroy()

    if (attached) {
      store.release()
    } else {
      store.destroy()
    }
  }

  return {
    store,
    attached,
    index,
    modelFind,
    model,
    lastModel,
    initialModel,
    set: store.set,
    register: store.register,
    unregister,
    subscribe: store.subscribe,
    init,
    destroy,
  }
}

/**
 * Creates the reactive model for a child element by reading from its parent
 * container's model and keeping it in sync with the element's `v-model`,
 * mirroring the lifecycle interface of `makeRootModel`.
 *
 * @param options Child model configuration object.
 */
export function makeChildModel(options: MakeChildModelOptions) {
  const { context$ } = options

  const lastModel = ref()
  const initialModel = ref()
  const childModelValue = toRef(() => unref(options.modelValue))
  const childAvailable = toRef(() => options.available?.value !== false)

  const model = computed(() => {
    if (!options.flat.value) {
      return options.parent.model.value?.[options.name.value!]
    }

    const parent = options.parent.model.value
    const result: Record<string, any> = {}

    for (const child$ of options.children?.value ?? []) {
      if (child$.isFlatContainer) {
        Object.assign(result, child$.model)
      } else if (parent && child$.name in parent) {
        result[child$.name] = parent[child$.name]
      }
    }

    return result
  })

  // Seed the parent's level with the initial external model value while the
  // children haven't registered yet (this runs during the container's setup,
  // before the children's), mirroring how nested containers seed their slice
  // via `startupModel` registration. Children registering afterwards find the
  // seeded values in the model and take them over their own defaults, so no
  // change events fire at startup. Written per key directly (not via
  // `update`) because key ownership can't be established before the children
  // exist.
  if (options.flat.value && isPlainObject(unref(options.modelValue))) {
    const prefix = options.dataPath.value ? `${options.dataPath.value}.` : ''
    const seed = clone(unref(options.modelValue))

    for (const key of Object.keys(seed)) {
      options.parent.update(`${prefix}${key}`, seed[key])
    }
  }

  // ================ SYNC ================

  const notifyTrigger = ref(0)

  let valueChanged = false
  let unsubscribe: (() => void) | undefined
  let keySubscriptions: (() => void)[] = []
  let unwatchKeys: WatchStopHandle | undefined
  let unwatchModel: WatchStopHandle | undefined

  // Captured at init — fixed for one init/destroy cycle (toggling `nested`
  // re-inits). Backs the skipped-flush `lastModel` tracking exemption.
  let flat = false

  // `lastModel` must still track changed values on skipped flushes: it backs
  // reorder re-path detection and the dirty baseline. Flat containers are
  // exempt — their data path never changes, so no re-path can occur.
  const binding = makeBinding({
    model,
    modelValue: childModelValue,
    notifyTrigger,
    hasVModel: options.hasVModel,
    lastModel,
    context$,
    consumeValueChanged: () => {
      const changed = valueChanged
      valueChanged = false
      return changed
    },
    hasListeners: options.hasListeners,
    fire: options.fire,
    // For flat containers the inbound value flows through `update`, which
    // merges per owned key — keys no child owns (same-level siblings) are
    // dropped instead of written.
    applyInbound: (data) => options.update(data),
    shouldNotify: () => childAvailable.value && model.value !== undefined,
    onSkippedFlush: (changed) => {
      if (changed && !flat) lastModel.value = clone(model.value)
    },
  })

  // =========== INITIALIZATION ===========

  const init = () => {
    // Drop any stale "value changed" signal left over from a previous binding
    // so the first notify after a re-path can't be forced to fire for a value
    // that didn't actually change (e.g. a pure reorder).
    valueChanged = false

    flat = options.flat.value

    const nextModel = clone(model.value)

    // Preserve the dirty baseline across a reorder-driven re-path: when the
    // slice value is unchanged (the item moved to a new slot but carries the
    // same data), keep the existing snapshots so `dirty` and change detection
    // travel with the item instead of resetting to the new slot's data.
    const preserveBaseline =
      lastModel.value !== undefined && equals(lastModel.value, nextModel)

    if (!preserveBaseline) {
      lastModel.value = nextModel
      initialModel.value = clone(model.value)
    }

    binding.emitInitial()
    binding.initNotify()

    if (flat) {
      // A flat container's own data path equals its parent's, so a single
      // subscription there would wake it for every same-level sibling change.
      // Subscribe to each owned top-level key instead, re-subscribing when the
      // key set changes (children register/unregister) or the path prefix
      // moves (an ancestor list reorder).
      unwatchKeys = watch(
        () => {
          const prefix = options.dataPath.value
            ? `${options.dataPath.value}.`
            : ''
          return Object.keys(model.value ?? {})
            .map((key) => `${prefix}${key}`)
            .join('\u001f')
        },
        (paths) => {
          keySubscriptions.forEach((unsub) => unsub())
          keySubscriptions = paths
            ? paths.split('\u001f').map((path) =>
                options.parent.subscribe(path, () => {
                  valueChanged = true
                  notifyTrigger.value++
                })
              )
            : []
        },
        { immediate: true }
      )
    } else {
      // In-place mutations of this element's slice or any of its descendants
      // don't change object references up the chain, so a non-deep watcher
      // can't see them. The root model dispatches to this path's subscribers
      // instead.
      unsubscribe = options.parent.subscribe(options.dataPath.value, () => {
        valueChanged = true
        notifyTrigger.value++
      })
    }

    // Catches wholesale replacements from above (e.g. an ancestor object being
    // replaced, or the external model-value changing) where the slice's
    // reference changes.
    unwatchModel = watch(model, () => {
      notifyTrigger.value++
    })

    binding.initInbound()
  }

  const destroy = () => {
    unsubscribe?.()
    keySubscriptions.forEach((unsub) => unsub())
    keySubscriptions = []
    binding.destroy()
    unwatchKeys?.()
    unwatchModel?.()
    unsubscribe = undefined
    unwatchKeys = undefined
    unwatchModel = undefined
  }

  return {
    model,
    lastModel,
    initialModel,
    init,
    destroy,
  }
}
