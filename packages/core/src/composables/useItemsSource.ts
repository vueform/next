import {
  computed,
  isRef,
  shallowRef,
  toRef,
  unref,
  watch,
  type MaybeRef,
  type Ref,
} from 'vue'

import { useContext, useFormContext } from '#src/contexts'
import type { ItemsProp } from '#src/features'
import type { ConditionsTriggerProp } from '#src/modules/conditions'
import type { HttpResponse } from '#src/modules/http'
import type { ExpressionableKeys } from '#src/types'
import {
  debounce,
  isPlainObject,
  isServer,
  isThenable,
  warn,
  isDev,
} from '#src/utils'

import { useExpression } from './useExpression'
import { useHttp } from './useHttp'

/**
 * Options for resolving a raw items source (plain data, endpoint URL, or
 * function) into loaded data.
 */
type UseItemsSourceOptions = {
  /**
   * Reactive props describing the items source and its loading behavior.
   */
  props: {
    /**
     * The raw items source: plain data, an endpoint URL string (supporting
     * expressions), or a (possibly async) function receiving the component
     * context.
     */
    items: MaybeRef<ItemsProp> | undefined

    /**
     * The source that triggers re-resolution of function-based items. Accepts
     * an array of element paths whose values are watched, a `Ref`, or a
     * function used as a watch getter.
     */
    itemsTrigger?: ConditionsTriggerProp

    /**
     * The debounce delay in milliseconds applied before re-resolving items when
     * an expression path or trigger source changes.
     */
    itemsDebounce?: number

    /**
     * Custom HTTP headers to include when loading items from an endpoint.
     */
    headers?: Record<string, string>

    /**
     * The HTTP method to use when loading items from an endpoint. Defaults to
     * `'GET'`.
     */
    method?: string

    /**
     * Transforms data received from an endpoint or function into the items
     * format before normalization.
     */
    transformItems?: (data: any) => any[] | Record<string, any>
  }

  /**
   * The expressionable prop key checked against the expression allow list when
   * the source is an endpoint URL. Defaults to `'items'`.
   */
  key?: ExpressionableKeys

  /**
   * Whether to resolve the source immediately on setup. Defaults to `true`.
   */
  immediate?: boolean
}

/**
 * Resolves a raw items source into loaded data: plain arrays and objects are
 * passed through, endpoint URL strings are fetched via HTTP, and (async)
 * functions are invoked with the component context.
 *
 * @private
 * @param options Items source configuration object.
 */
export function useItemsSource(options: UseItemsSourceOptions) {
  const { props, key = 'items', immediate = true } = options

  const form$ = useFormContext()
  const context$ = useContext()
  const expression = useExpression()
  const $http = useHttp()

  // ================ REFS ================

  /**
   * Whether the items are currently being loaded from an endpoint or an async
   * function.
   */
  const resolving = shallowRef(false)

  /**
   * The raw items data before normalization (from props, endpoint, or
   * function).
   */
  const resolvedItems = shallowRef<any[] | Record<string, any>>([])

  // ============== COMPUTED ==============

  // When `items` isn't a string it can't contain expressions, so this
  // collapses to `undefined` — a stable primitive. That means inline array
  // props (e.g. :items="[1,2,3]") never notify the watcher below, because
  // Vue's computed only propagates when its output changes by Object.is.
  const expressionPaths = computed<string[] | undefined>(() => {
    const source = unref(props.items)
    if (typeof source !== 'string') return undefined
    const paths = expression.usedPaths(source)
    return paths.length ? paths : undefined
  })

  // Inline array triggers (e.g. :items-trigger="['text']") get a fresh
  // reference on every parent re-render. Reducing the path list to a
  // primitive string key lets Vue's built-in computed diffing (Object.is)
  // treat identical path lists as unchanged, so the watcher below is not
  // notified on re-render — no deep equals required.
  const triggerSource = computed<
    string | Ref | ((...args: any[]) => any) | undefined
  >(() => {
    const trigger = props.itemsTrigger
    if (!trigger) return undefined

    if (Array.isArray(trigger)) {
      return trigger.join('\u0000')
    }

    if (isRef(trigger)) {
      return trigger
    }

    if (typeof trigger === 'function') {
      return trigger
    }

    return undefined
  })

  // =============== METHODS ==============

  /**
   * Resolves the items source: fetches endpoint URLs, invokes functions
   * (awaiting async results), and passes plain data through.
   */
  const resolveItems = () => {
    const source = unref(props.items)

    if (typeof source === 'string') {
      if (isServer) return

      const url = expression.resolveIfAllowed(key, source)
      if (!url) return

      resolving.value = true

      $http
        .request({
          url,
          method: props.method || 'GET',
          headers: props.headers,
        })
        .then((response: HttpResponse) => {
          resolvedItems.value = applyTransform(response.data)
          resolving.value = false
        })
        .catch((error: unknown) => {
          resolving.value = false

          if (isDev()) {
            warn('Failed to load items from endpoint.', error)
          }
        })
      return
    }

    if (typeof source === 'function') {
      const result = source(context$)

      if (isThenable(result)) {
        if (isServer) {
          Promise.resolve(result).catch(() => {})
          return
        }

        resolving.value = true
        Promise.resolve(result)
          .then((resolved) => {
            resolvedItems.value = applyTransform(resolved)

            resolving.value = false
          })
          .catch((error: unknown) => {
            resolving.value = false

            if (isDev()) {
              warn('Failed to resolve items from function source.', error)
            }
          })
        return
      }

      resolvedItems.value = applyTransform(result)
      return
    }

    resolvedItems.value =
      Array.isArray(source) || isPlainObject(source) ? source : []
  }

  const applyTransform = (data: any): any[] | Record<string, any> => {
    if (props.transformItems) return props.transformItems(data)
    if (Array.isArray(data) || isPlainObject(data)) return data
    return []
  }

  const debouncedResolveItems = debounce(
    resolveItems,
    toRef(() => props.itemsDebounce ?? 0)
  )

  // =============== HOOKS ================

  if (immediate) {
    resolveItems()
  }

  // ============== WATCHERS ==============

  watch(
    () => {
      const paths = expressionPaths.value
      if (!paths) return undefined
      return paths.map((p: string) => form$?.get(p))
    },
    () => {
      // Resolve the expression eagerly so a successful evaluation cancels any
      // pending warning immediately, even when the HTTP request is debounced.
      const source = unref(props.items)
      if (typeof source === 'string') {
        expression.resolveIfAllowed(key, source)
      }

      debouncedResolveItems()
    },
    { deep: true, immediate: false, flush: 'sync' }
  )

  watch(
    () => {
      const source = triggerSource.value
      if (source === undefined) return undefined

      if (typeof source === 'string') {
        const paths = source ? source.split('\u0000') : []
        return paths.map((p) => form$?.get(p))
      }

      if (isRef(source)) {
        return unref(source)
      }

      if (typeof source === 'function') {
        return source(context$)
      }

      return undefined
    },
    () => debouncedResolveItems(),
    { deep: true, immediate: false }
  )

  watch(
    () => unref(props.items),
    (n, o) => {
      if (
        typeof n === 'function' &&
        typeof o === 'function' &&
        n?.toString() === o?.toString()
      ) {
        return
      }

      resolveItems()
    }
  )

  return {
    resolving,
    resolvedItems,
    resolveItems,
  }
}
