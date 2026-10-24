import { isProxy, isRef, markRaw, shallowRef, unref } from 'vue'

import {
  useConfig,
  useCurrentInstance,
  useGlobals,
  getResolvedProps,
  useHttp,
  useLocale,
} from '#src/composables'
import { useFormContext } from '#src/contexts'
import { createContext } from '#src/helpers'
import type { UnknownComponent } from '#src/types'

/**
 * Symbol key under which a component's exposed context carries its class
 * registrar. Lets `useClasses()` called from a custom template or slot add
 * class definitions to the host component without the registrar becoming part
 * of the public context surface.
 */
export const CLASS_REGISTRAR: unique symbol = Symbol('class-registrar')

/**
 * Symbol key under which a component's exposed context carries its base class
 * setter. Lets the element layout (`VfLayout`) install the shared wrapper
 * classes (`root`, `label`, `errors`, …) at the bottom of the host element's
 * class chain — below `reclass`, which replaces them, and `classes`, which
 * merges on top — without the setter becoming part of the public context
 * surface.
 */
export const BASE_CLASS_REGISTRAR: unique symbol = Symbol(
  'base-class-registrar'
)

/**
 * Symbol key under which the raw context object carries its readiness flag —
 * flipped by `useBlueprint` once the component's API has been assigned (see
 * `markContextReady`).
 */
const READY: unique symbol = Symbol('context-ready')

/**
 * Vue's `ReactiveFlags.RAW` key, answered by the context proxy so `toRaw`,
 * `isProxy`, and `toRefs` treat it like reactive state. A literal because the
 * enum is not a runtime export in every Vue version.
 */
const VUE_RAW = '__v_raw'

const [_useComponentContext, provideComponentContext] =
  createContext<UnknownComponent>('vueform-component')

/**
 * Marks a value placed on a context's raw object as opaque to Vue's reactivity.
 * The rule this enforces: `ref(context)` (or a deep reactive collection holding
 * a context) builds Vue's `reactive()` view over the raw object, and that view
 * would wrap any plain object it reaches — so whatever lands on the raw object
 * and is not reactive state is `markRaw`ed at placement. A no-op for
 * non-objects, refs, Vue proxies (incl. other contexts), and already-marked
 * objects, so shared values (the config) are only reshaped once.
 *
 * @param value The value being placed on a context's raw object.
 */
export function opaque<T>(value: T): T {
  return value !== null &&
    typeof value === 'object' &&
    !isRef(value) &&
    !isProxy(value) &&
    !(value as any).__v_skip
    ? (markRaw(value as object) as T)
    : value
}

/**
 * Contexts already created per component instance. Keyed by instance (not via
 * inject) so the idempotency guard never returns an ancestor's context.
 */
const createdContexts = new WeakMap<object, any>()

/**
 * Creates and provides the component's public context: a proxy over the object
 * the component later hands to `defineExpose` (`toRaw(context)`) with Vue's
 * `proxyRefs` semantics — ref members read unwrapped and write through on
 * assignment — plus one rule of its own: a read of a member the blueprint has
 * not assigned yet subscribes to the context's readiness, so effects that saw a
 * half-built sibling (a list row reading another row's model through the
 * registry) re-run once the API is in place.
 *
 * Deliberately not `reactive()`: that would track a dependency per key on the
 * context itself for every property read in every render — a Dep and a Link per
 * key per component on top of the refs' own tracking, measured at +40–85% mount
 * time. The proxy answers Vue's `__v_raw` probe, so `isProxy`, `toRefs`, and
 * `toRaw` work; storing it in a `ref` yields Vue's deep view over the raw
 * object rather than this proxy, as with `shallowReactive`.
 *
 * `form$`, the modules, and the resolved `props` are available from the start.
 * Idempotent within a single setup: a second call on the same instance returns
 * the already-created context (needed when both `useBlueprint` / `useProps`
 * create the context).
 */
export function createComponentContext(): UnknownComponent {
  const instance = useCurrentInstance()

  const existing = instance && createdContexts.get(instance)
  if (existing) return existing

  if (instance?.exposed === undefined) {
    throw new Error(
      '`createComponentContext()` must be called within setup() context'
    )
  }

  const form$ = useFormContext()

  // Placed on the raw object below, so `opaque` applies (see its docblock);
  // `form$` is itself a context proxy and passes through untouched.
  const $config = opaque(useConfig())
  const $locale = opaque(useLocale())
  const $globals = opaque(useGlobals())
  const $http = opaque(useHttp())

  const ready = shallowRef(false)
  // Plain mirror of `ready`: reads of missing members after readiness must
  // not touch the ref, or every such read in every render would track it.
  let isReady = false

  const raw: Record<string | symbol, any> = {
    form$,
    $config,
    $locale,
    $globals,
    $http,
    [READY]: () => {
      if (!isReady) {
        isReady = true
        ready.value = true
      }
    },
  }

  // Prefer the resolved props from `useProps` (defaults, config, presets
  // merged); raw instance props are only a fallback for components that don't
  // use the pipeline. A getter, because the resolved props may not exist yet
  // when the context is created.
  Object.defineProperty(raw, 'props', {
    get: () => getResolvedProps(instance) ?? instance.props,
    enumerable: true,
    configurable: true,
  })

  // The traps deliberately don't forward `receiver`: with the proxy as
  // receiver, `Reflect.set` routes every assignment through the proxy's
  // define-property machinery and `Reflect.get` takes a generic path — on a
  // plain target with no setters, `target[key]` semantics are what we want.
  const component$ = new Proxy(raw, {
    get(target, key) {
      if (key === VUE_RAW) return target

      const value = target[key]

      // Not there (yet): subscribe the reading effect to readiness so it
      // re-runs once the API has been assigned. Reading `ready.value` is what
      // tracks it; only missing members before readiness get there.
      if (value === undefined && !isReady && typeof key === 'string') {
        void ready.value
        return undefined
      }

      return unref(value)
    },

    set(target, key, value) {
      const current = target[key]

      if (isRef(current) && !isRef(value)) {
        current.value = value
        return true
      }

      target[key] = value
      return true
    },
  })

  createdContexts.set(instance, component$)
  provideComponentContext(component$)

  return component$
}

/**
 * Marks a context as fully assembled: effects that read members before the
 * blueprint assigned them re-run. Called by `useBlueprint` after the API has
 * been put in place.
 *
 * @param context The component context (proxy or raw).
 */
export function markContextReady(context: any) {
  const mark = (context?.[VUE_RAW] ?? context)?.[READY]
  if (typeof mark === 'function') mark()
}

/**
 * Injects the nearest ancestor's component context, throwing if none is
 * available.
 */
export function useComponentContext(): UnknownComponent {
  const context$ = _useComponentContext()

  if (!context$) {
    throw new Error('Component context is not available')
  }

  return context$
}
