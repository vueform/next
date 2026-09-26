import {
  computed,
  getCurrentScope,
  isRef,
  reactive,
  toRef,
  unref,
  type ComputedGetter,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from 'vue'
import { joinMaybeArrays } from './array'
import { getGenericInstance } from './instance'
import type { VueformRouter } from '#core/modules/router'

/**
 * Shared constant computed that always resolves to `true`. Reuse it for
 * fallback/stub paths instead of allocating a `computed(() => true)` per call
 * site.
 */
export const alwaysTrue: ComputedRef<boolean> = computed(() => true)

/**
 * Shared constant computed that always resolves to `false`. Reuse it for
 * fallback/stub paths instead of allocating a `computed(() => false)` per call
 * site.
 */
export const alwaysFalse: ComputedRef<boolean> = computed(() => false)

/**
 * Shared constant computed that always resolves to an empty array. Reuse it for
 * fallback/stub paths instead of allocating a `computed(() => [])` per call
 * site.
 */
export const emptyArray: ComputedRef<any[]> = computed(() => [])

const emptyLanguageSet = new Set<string>()

/**
 * Shared constant computed that always resolves to an empty language set. Reuse
 * it for fallback/stub paths instead of allocating a `computed(() => new
 * Set())` per call site.
 */
export const emptyLanguages: ComputedRef<Set<string>> = computed(
  () => emptyLanguageSet
)

/**
 * The result of aliasing property names on a source type. Alias keys replace
 * their corresponding source keys, and all un-aliased source keys pass
 * through.
 */
type AliasedProps<
  T extends Record<string, any>,
  A extends Record<string, keyof T & string>,
> = {
  [K in keyof A]: T[A[K] & keyof T]
} & T

/**
 * Returns a `computed` that is not allocated until `.value` is first read. The
 * inner computed is created in the effect scope active at call time, so it is
 * disposed with that scope even if the first read happens later.
 *
 * Vue's `computed` is already lazy on evaluation; this is lazy on allocation.
 *
 * @param getter The computed getter.
 */
export function lazyComputed<T>(getter: ComputedGetter<T>): ComputedRef<T> {
  let inner: ComputedRef<T> | undefined
  const scope = getCurrentScope()
  const ref = {
    get value() {
      if (inner === undefined) {
        inner = scope?.run(() => computed(getter)) ?? computed(getter)
      }
      return inner.value
    },
  }
  Object.defineProperty(ref, '__v_isRef', { value: true })
  return ref as ComputedRef<T>
}

/**
 * Creates a record of `Ref`s by picking the specified keys from an object using
 * `toRef`.
 *
 * @param object The source reactive object.
 * @param pick Keys to pick from the object.
 */
export function pickRefs<
  T extends Record<string, any>,
  P extends keyof T & string,
>(object: T, pick: P[]) {
  const refs = {} as { [K in P]: Ref<T[K]> }
  for (const key of pick) {
    refs[key] = toRef(object, key)
  }
  return refs
}

/**
 * Lazy `toRef` proxy over a reactive props object. Property access returns a
 * cached `Ref` for that key, so destructuring is reactive: `const { multiple }
 * = api.propRefs`.
 *
 * @param props The resolved props object (e.g. from `useProps`).
 */
export function createPropRefs<T extends Record<string, any>>(props: T) {
  const cache = new Map<string, Ref<any>>()

  return new Proxy({} as { [K in keyof T]-?: Ref<T[K]> }, {
    get(_, key) {
      if (typeof key !== 'string') return undefined
      let ref = cache.get(key)
      if (!ref) {
        ref = toRef(props, key as keyof T & string)
        cache.set(key, ref)
      }
      return ref
    },
    has(_, key) {
      return typeof key === 'string' && key in props
    },
    ownKeys() {
      return Reflect.ownKeys(props as object)
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key === 'string' && key in props) {
        return {
          enumerable: true,
          configurable: true,
          get: () => {
            let ref = cache.get(key)
            if (!ref) {
              ref = toRef(props, key as keyof T & string)
              cache.set(key, ref)
            }
            return ref
          },
        }
      }
      return undefined
    },
  })
}

/**
 * Resolves `props:<target>` bindings from props, merging class values with the
 * base.
 *
 * @param props The component's raw props.
 * @param target The target part name (looked up as `props:<target>`).
 * @param base Optional base props to merge into.
 */
export function withDefaultProps(
  props: Record<string, any>,
  target: string,
  base?: Record<string, any>
) {
  const binding = props[`props:${target}`]
  if (!binding) return base || {}
  if (!base) return binding

  const bindingClass = binding.class

  if (!bindingClass) {
    return base
  }

  const baseClass = base.class
  const out = Object.assign({}, base, binding)

  if (baseClass) {
    out.class = joinMaybeArrays(baseClass, bindingClass)
  }

  return out
}

/**
 * Creates a proxy over a reactive props object that exposes aliased property
 * names. Reads are redirected through the original reactive source, preserving
 * Vue's reactivity tracking without introducing an intermediate reactive
 * wrapper (which would break with inline array/object props that create new
 * references on every render).
 *
 * @param source The reactive props object (e.g. from `useProps`).
 * @param aliases A mapping from desired alias key to original source key.
 */
export function aliasProps<
  T extends Record<string, any>,
  const A extends Record<string, keyof T & string>,
>(source: T, aliases: A): AliasedProps<T, A> {
  return new Proxy(source, {
    get(target, key, receiver) {
      if (typeof key === 'string' && key in aliases) {
        return Reflect.get(target, aliases[key], receiver)
      }
      return Reflect.get(target, key, receiver)
    },
  }) as unknown as AliasedProps<T, A>
}

/**
 * Resolves a vue-router instance from the Vueform config or the Vue app's
 * global `$router` property. Returns `undefined` when the config explicitly
 * disables the router (`false`) or no router is available.
 */
export function resolveRouter(
  configRouter: VueformRouter | false | undefined
): VueformRouter | undefined {
  if (configRouter === false) return undefined
  if (configRouter) return configRouter
  const instance = getGenericInstance()
  const $router = instance?.appContext.config.globalProperties.$router
  return $router?.push ? $router : undefined
}

/**
 * Converts a ref of an object into a reactive-like proxy whose property reads
 * and writes are forwarded to the current ref value (nested refs unwrapped on
 * read). Replacing the ref's value is reflected on the proxy immediately.
 */
export function toReactive<T extends object>(objectRef: MaybeRef<T>): T {
  // Cast: `Reactive<T>` ref-unwraps, but callers pass plain object shapes.
  if (!isRef(objectRef)) return reactive(objectRef) as T

  const proxy = new Proxy({} as T, {
    get(_, p, receiver) {
      return unref(Reflect.get(objectRef.value, p, receiver))
    },
    set(_, p, value) {
      const target = objectRef.value as Record<PropertyKey, unknown>
      if (isRef(target[p]) && !isRef(value)) {
        ;(target[p] as Ref<unknown>).value = value
      } else {
        target[p] = value
      }
      return true
    },
    deleteProperty(_, p) {
      return Reflect.deleteProperty(objectRef.value, p)
    },
    has(_, p) {
      return Reflect.has(objectRef.value, p)
    },
    ownKeys() {
      return Object.keys(objectRef.value)
    },
    getOwnPropertyDescriptor() {
      return { enumerable: true, configurable: true, writable: true }
    },
  })

  return reactive(proxy) as T
}

/**
 * A computed whose object result is exposed as a reactive-like proxy, so
 * property access stays reactive without `.value` (equivalent to
 * `toReactive(computed(fn))`).
 */
export function reactiveComputed<T extends object>(fn: () => T): T {
  return toReactive(computed(fn))
}
