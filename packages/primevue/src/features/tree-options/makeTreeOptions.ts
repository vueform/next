import {
  defineFeature,
  useConditionalList,
  useExpression,
  useFormContext,
  useComponentContext,
  useHttp,
  equals,
  isThenable,
  debounce,
  type makeData,
  type makeElement,
  type makeInput,
  type ReturnsOf,
  type ConditionalProp,
  type ConditionsTriggerProp,
  clone,
} from '@vueform/core'
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

import type { TreeNode, TreeOptionsProp } from '#src/types'

/**
 * Options for the makeTreeOptions factory.
 */
interface MakeTreeOptionsOptions {
  props: {
    options: MaybeRef<TreeOptionsProp> | undefined
    optionsTrigger?: ConditionsTriggerProp
    optionsDebounce?: number
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
    transformOptions?: (data: any) => any[]
    headers?: Record<string, string>
    method?: string
    loading?: ConditionalProp
  }
  deps: ReturnsOf<
    [
      [typeof makeData, ['nullValue', 'update', 'model', 'pending']],
      [typeof makeElement, ['path']],
      [typeof makeInput, ['input']],
    ]
  >
}

/**
 * Flattens a tree of nodes into a single array in depth-first order.
 */
function flattenNodes(nodes: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) {
      result.push(...flattenNodes(node.children))
    }
  }
  return result
}

/**
 * Recursively rebuilds a tree, excluding nodes whose availability ref is false
 * and stripping the `conditions` property from the output.
 */
function filterTree(
  nodes: TreeNode[],
  availabilities: Ref<boolean>[],
  counter: { index: number }
): TreeNode[] {
  const result: TreeNode[] = []

  for (const node of nodes) {
    const i = counter.index++
    const available = availabilities[i]?.value ?? true

    if (!available) {
      if (node.children?.length) {
        skipNodes(node.children, counter)
      }
      continue
    }

    const { conditions: _, ...clean } = node

    if (node.children?.length) {
      clean.children = filterTree(node.children, availabilities, counter)
    }

    result.push(clean)
  }

  return result
}

/**
 * Advances the counter past all descendants of skipped nodes.
 */
function skipNodes(nodes: TreeNode[], counter: { index: number }) {
  for (const node of nodes) {
    counter.index++
    if (node.children?.length) {
      skipNodes(node.children, counter)
    }
  }
}

/**
 * Collects all `key` values from a tree into a Set.
 */
function collectKeys(
  nodes: TreeNode[],
  keys: Set<string> = new Set()
): Set<string> {
  for (const node of nodes) {
    if (node.key != null) keys.add(String(node.key))
    if (node.children?.length) collectKeys(node.children, keys)
  }
  return keys
}

/**
 * Factory that resolves tree-select options, filtering out nodes whose
 * `conditions` prop evaluates to false. Clears selected values that become
 * unavailable when conditions change. Supports async options from a URL
 * endpoint, a function returning tree nodes, or a static array.
 */
export const makeTreeOptions = defineFeature(
  () =>
    ({ props, deps }: MakeTreeOptionsOptions) => {
      const form$ = useFormContext()
      const context$ = useComponentContext()
      const expression = useExpression()
      const $http = useHttp()

      // ================ REFS ================

      /**
       * Whether the items are currently being loaded from an async source.
       */
      const resolving = shallowRef(false)

      const resolvedItems = shallowRef<TreeNode[]>([])

      // ============== COMPUTED ==============

      const flatNodes = computed(() => flattenNodes(resolvedItems.value))

      const availabilities = useConditionalList(
        flatNodes,
        (node: TreeNode) => node.conditions,
        {
          trigger: toRef(() => props.conditionsTrigger),
          debounce: toRef(() => props.conditionsDebounce),
        }
      )

      /**
       * The filtered tree of options with unavailable nodes removed.
       */
      const items = computed(() => {
        void availabilities.value
        return filterTree(resolvedItems.value, availabilities.value, {
          index: 0,
        })
      })

      const expressionPaths = computed<string[] | undefined>(() => {
        const source = unref(props.options)
        if (typeof source !== 'string') return undefined
        const paths = expression.usedPaths(source)
        return paths.length ? paths : undefined
      })

      const triggerSource = computed<
        string | Ref | ((...args: any[]) => any) | undefined
      >(() => {
        const trigger = props.optionsTrigger
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
       * Resolves the tree options from the configured source. Handles static
       * arrays, endpoint URLs (with expression interpolation), and sync/async
       * functions.
       */
      const resolveItems = () => {
        const source = unref(props.options)

        if (typeof source === 'string') {
          const url = expression.resolveIfAllowed('items', source)
          if (!url) return

          resolving.value = true

          $http
            .request({
              url,
              method: props.method || 'GET',
              headers: props.headers,
            })
            .then((response) => {
              resolvedItems.value = applyTransform(response.data)
              resolving.value = false
            })
          return
        }

        if (typeof source === 'function') {
          const result = source(context$)

          if (isThenable(result)) {
            resolving.value = true
            Promise.resolve(result).then((resolved) => {
              resolvedItems.value = applyTransform(resolved)
              resolving.value = false
            })
            return
          }

          resolvedItems.value = applyTransform(result)
          return
        }

        resolvedItems.value = Array.isArray(source) ? source : []
      }

      /**
       * Applies the `transformOptions` function to raw data if provided.
       */
      const applyTransform = (data: any): TreeNode[] => {
        if (props.transformOptions) return props.transformOptions(data)
        if (Array.isArray(data)) return data
        return []
      }

      const debouncedResolveItems = debounce(
        resolveItems,
        toRef(() => props.optionsDebounce ?? 0)
      )

      // ================ HOOKS ===============

      resolveItems()

      // ============== WATCHERS ==============

      watch(
        () => {
          const paths = expressionPaths.value
          if (!paths) return undefined
          return paths.map((p: string) => form$?.get(p))
        },
        () => debouncedResolveItems(),
        { deep: true, immediate: false }
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
        () => unref(props.options),
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

      let settled = false

      watch(
        items,
        (currentOptions, previousOptions) => {
          if (!settled) {
            settled = true
            return
          }

          if (equals(currentOptions, previousOptions)) return

          const currentValue = deps.model.value

          if (
            typeof currentValue !== 'object' ||
            equals(currentValue, deps.nullValue.value)
          ) {
            return
          }

          const availableKeys = collectKeys(currentOptions)

          const filtered: Record<string, boolean> = {}
          let changed = false

          for (const key of Object.keys(currentValue)) {
            if (availableKeys.has(key)) {
              filtered[key] = currentValue[key]
            } else {
              changed = true
            }
          }

          if (!changed) return

          deps.update(
            Object.keys(filtered).length
              ? filtered
              : clone(deps.nullValue.value)
          )
        },
        { immediate: false }
      )

      return {
        items,
        resolving,
        resolveItems,
      }
    }
)
