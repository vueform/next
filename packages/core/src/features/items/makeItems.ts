import {
  computed,
  toRef,
  watch,
  type ComputedRef,
  type MaybeRef,
  type Ref,
  type ShallowRef,
} from 'vue'

import { useItemsSource, useConditionalList } from '#src/composables'
import type { makeData, MakeDataModelApi } from '#src/features'
import { defineFeature } from '#src/helpers'
import {
  type ConditionsResult,
  type ConditionsTriggerProp,
} from '#src/modules/conditions'
import type { ReturnsOf } from '#src/types'
import { equals, isPlainObject, normalize, typedEntries } from '#src/utils'

import {
  type ItemsProp,
  type ItemValueOf,
  type ItemsGenericsBrand,
  type RawItemOf,
} from './types'

/**
 * Intermediate normalized item before conditions/disabled are resolved.
 */
type NormalizedItem = {
  $raw: any
  value: any
  label: string
}

/**
 * Extracts the item value from a raw item. A string key or a mapping function.
 */
export type ItemValue = string | ((item: any) => any)

/**
 * Extracts the item label from a raw item. A string key or a mapping function.
 */
export type ItemLabel = string | ((item: any) => string)

/**
 * Determines whether an item is disabled. A string key for direct property
 * lookup, or a function returning a `ConditionalProp` for reactive evaluation.
 */
export type ItemDisabled =
  | string
  | ((item: any) => ConditionsResult | undefined)

/**
 * Determines whether an item is available (visible). A string key for direct
 * property lookup, or a function returning a `ConditionalProp` for reactive
 * evaluation. Items whose conditions are not met are omitted from the list.
 */
export type ItemConditions =
  | string
  | ((item: any) => ConditionsResult | undefined)

/**
 * Determines whether a group is available. A string key for direct property
 * lookup, or a function returning a `ConditionalProp`. Groups whose conditions
 * are not met are omitted entirely.
 */
export type GroupConditions =
  | string
  | ((group: any) => ConditionsResult | undefined)

/**
 * Resolves the label for a group. A string key or a mapping function.
 */
export type GroupLabel = string | ((group: any) => string)

/**
 * Resolves the children items from a group. A string key or a function
 * returning children in any ItemsProp format.
 */
export type GroupChildren =
  | string[]
  | string
  | ((group: any) => any[] | Record<string, any>)

/**
 * A normalized item with resolved value, label, and disabled state. Items
 * originating from an array of objects also include `$raw` with the original.
 */
export type ResolvedItem<TValue = any, TRaw = Record<string, any>> = {
  /**
   * The resolved option value.
   */
  value: TValue

  /**
   * The resolved display label.
   */
  label: string

  /**
   * Whether the option is currently disabled.
   */
  disabled: boolean

  /**
   * Stable index key for the option within the flat item list.
   */
  key: number

  /**
   * The original raw item object before normalization.
   */
  $raw?: TRaw
}

/**
 * A resolved group containing a label, its normalized child items, and the
 * original group object as `$raw`.
 */
export type ResolvedGroup<TValue = any, TRaw = Record<string, any>> = {
  /**
   * The resolved group label.
   */
  label: string

  /**
   * The group's normalized child items.
   */
  items: ResolvedItem<TValue, TRaw>[]

  /**
   * The original raw group object before normalization.
   */
  $raw: Record<string, any>
}

const emptyItems: ResolvedItem[] = []
const emptyGroups: ResolvedGroup[] = []

/**
 * Configuration for the items factory that normalizes option items.
 */
type MakeItemsOptions = {
  props: {
    /**
     * Optional key (matches `ItemsProps`): may be absent on the props object.
     * When present, the value may still be `undefined`.
     */
    items?: MaybeRef<ItemsProp>
    itemValue?: ItemValue
    itemLabel?: ItemLabel
    itemDisabled?: ItemDisabled
    itemConditions?: ItemConditions
    itemsTrigger?: ConditionsTriggerProp
    itemsDebounce?: number
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
    headers?: Record<string, string>
    method?: string
    groupLabel?: GroupLabel
    groupChildren?: GroupChildren
    groupConditions?: GroupConditions
    multiple?: boolean
    /**
     * The minimum query length before items are resolved. When set, the
     * initial items resolution on setup is skipped.
     */
    minLength?: number
    /**
     * Transforms data received from an endpoint into the items format.
     *
     * @param data The response data received from the endpoint.
     */
    transformItems?: (data: any) => any[] | Record<string, any>
  }
  deps: ReturnsOf<[[typeof makeData, ['nullValue', 'update', 'model']]]>
}

/**
 * Props generics carried by an items-based element, recovered from the
 * `ItemsGenericsBrand` heritage on `ItemsProps`. (`extends ItemsProps<infer…>`
 * re-infers a wide `itemValue` union and collapses values to `any`.)
 *
 * Matches against the named `ItemsGenericsBrand` interface — not an inline
 * `[itemsGenericsBrandKey]` object — so declaration emit can name the type in
 * deferred conditionals (computed symbol keys cannot be named across modules,
 * TS4023/TS4058).
 */
type ItemsGenericsOf<P> =
  P extends ItemsGenericsBrand<
    infer TItems,
    infer TItemValueKey,
    infer TGroupChildren,
    infer TItemValueReturn
  >
    ? {
        items: TItems
        itemValueKey: TItemValueKey
        groupChildren: TGroupChildren
        itemValueReturn: TItemValueReturn
      }
    : {
        items: ItemsProp
        itemValueKey: undefined
        groupChildren: undefined
        itemValueReturn: unknown
      }

type ItemValueFromProps<P> = ItemValueOf<
  ItemsGenericsOf<P>['items'],
  ItemsGenericsOf<P>['itemValueKey'],
  ItemsGenericsOf<P>['groupChildren'],
  ItemsGenericsOf<P>['itemValueReturn']
>

type RawItemFromProps<P> = RawItemOf<
  ItemsGenericsOf<P>['items'],
  ItemsGenericsOf<P>['groupChildren']
>

/**
 * Factory that normalizes option items (arrays, objects, arrays of objects)
 * into a uniform structure with resolved value, label, and disabled state.
 * Supports conditional disabled and conditional availability via
 * `ConditionalProp`. Automatically clears selected values whose items become
 * unavailable. Also exposes library-friendly `rawItems` plus label/value/
 * disabled accessors for adapters that forward options to third-party
 * components.
 */
type MakeItemsFn = <P extends MakeItemsOptions['props']>(options: {
  props: P
  deps: MakeItemsOptions['deps']
}) => MakeItemsReturn<P>

/**
 * Compile-time configuration a blueprint passes to `makeItems`.
 */
export type MakeItemsConfig = {
  /**
   * Whether item and group conditions are evaluated and values of
   * filtered-out items are cleared from the model. Defaults to `true`.
   */
  conditions?: boolean

  /**
   * Whether the element always holds multiple selected values, regardless of
   * its `multiple` prop.
   */
  multiple?: boolean
}

/**
 * Prop-dependent return type of `makeItems`. `items` / `groups` element types
 * follow the generics carried by `P` (typically via `ItemsProps`).
 */
export type MakeItemsReturn<P = MakeItemsOptions['props']> = {
  items: Ref<ResolvedItem<ItemValueFromProps<P>, RawItemFromProps<P>>[]>
  groups: Ref<ResolvedGroup<ItemValueFromProps<P>, RawItemFromProps<P>>[]>
  rawItems: ComputedRef<any[]>
  resolvedItems: ShallowRef<any[] | Record<string, any>>
  normalizedItems: ComputedRef<NormalizedItem[]>
  selectedLabel: ComputedRef<string | string[] | undefined>
  itemLabel: ComputedRef<string | ((item: any) => string) | undefined>
  itemValue: ComputedRef<string | ((item: any) => any) | undefined>
  itemDisabled: ComputedRef<string | ((item: any) => boolean) | undefined>
  grouped: ComputedRef<boolean>
  resolving: ShallowRef<boolean>
  synthetic: ComputedRef<boolean>
  resolveItems: () => void
}

/**
 * Blueprint API overlay for elements that use `makeData` and `makeItems`.
 * Caches the wide `Base` (typically `ReturnType<typeof blueprint>`) and
 * re-binds the prop-dependent model slice plus `items` / `groups`.
 */
export type ItemsModelApi<Base, P> = Omit<
  Base,
  keyof MakeDataModelApi | 'items' | 'groups'
> &
  MakeDataModelApi<P> &
  Pick<MakeItemsReturn<P>, 'items' | 'groups'>

/**
 * Provides the items handling of option-based elements: resolves items from
 * static data, an endpoint URL, or a function, normalizes and groups them,
 * applies item/group conditions, and exposes accessors for third-party
 * components.
 */
export const makeItems = defineFeature<
  (config?: MakeItemsConfig) => MakeItemsFn
>(
  (config?: MakeItemsConfig) =>
    <P extends MakeItemsOptions['props']>({
      props,
      deps,
    }: {
      props: P
      deps: MakeItemsOptions['deps']
    }): MakeItemsReturn<P> => {
      /**
       * The raw items source resolution: handles plain data, endpoint URLs, and
       * (async) functions. `resolving` indicates an in-flight load,
       * `resolvedItems` holds the loaded raw data. The initial resolution is
       * deferred until after the conditional lists below are set up, so the
       * value-clearing watcher's initial skip stays aligned with the first
       * availability rebuild.
       */
      const { resolving, resolvedItems, resolveItems } = useItemsSource({
        props: props as MakeItemsOptions['props'] & {
          items: MaybeRef<ItemsProp> | undefined
        },
        immediate: false,
      })

      // ============== COMPUTED ==============

      /**
       * Internal resolved list. When grouped, returns `ResolvedGroup[]`;
       * otherwise returns `ResolvedItem[]`.
       */
      const itemsOrGroups = computed<ResolvedItem[] | ResolvedGroup[]>(() => {
        if (grouped.value) {
          let flatIndex = 0
          const result: ResolvedGroup[] = []
          for (let gi = 0; gi < normalizedGroups.value.length; gi++) {
            const group = normalizedGroups.value[gi]

            if (groupAvailabilityStates) {
              const groupAvailRef = groupAvailabilityStates.value[gi]
              if (groupAvailRef && !groupAvailRef.value) {
                flatIndex += group.items.length
                continue
              }
            }

            const groupItems: ResolvedItem[] = []
            for (const item of group.items) {
              const resolved = toResolvedItem(item, flatIndex)
              if (resolved) groupItems.push(resolved)
              flatIndex++
            }
            result.push({
              label: group.label,
              items: groupItems,
              $raw: group.$raw,
            })
          }

          return result
        }

        const result: ResolvedItem[] = []
        for (let i = 0; i < normalizedItems.value.length; i++) {
          const resolved = toResolvedItem(normalizedItems.value[i], i)
          if (resolved) result.push(resolved)
        }
        return result
      })

      /**
       * Resolved flat option items. Empty when grouped — use `groups` then.
       */
      const items = toRef(() =>
        grouped.value ? emptyItems : (itemsOrGroups.value as ResolvedItem[])
      )

      /**
       * Resolved option groups. Empty when not grouped — use `items` then.
       */
      const groups = toRef(() =>
        grouped.value ? (itemsOrGroups.value as ResolvedGroup[]) : emptyGroups
      )

      /**
       * Library-friendly items for third-party components. Flat lists are the
       * original raw objects (with `__disabled` injected when conditional
       * disabled resolution is active). Grouped lists are the original group
       * objects with children replaced by the filtered raw items.
       */
      const rawItems = computed(() => {
        const resolved = itemsOrGroups.value as any[]

        if (!grouped.value) {
          return resolved.map(processItem)
        }

        return resolved.map((group) => {
          const target = { ...group.$raw }
          const children = (group.items as any[]).map(processItem)
          const gc = props.groupChildren
          if (typeof gc === 'string') {
            target[gc] = children
          }
          return target
        })
      })

      /**
       * All normalized items before conditional filtering, flattened across
       * groups when grouped.
       */
      const normalizedItems = computed(() => {
        if (grouped.value) {
          return normalizedGroups.value.flatMap((g) => g.items)
        }
        return normalizeItems(resolvedItems.value)
      })

      const normalizedGroups = computed(() => {
        if (!grouped.value || !Array.isArray(resolvedItems.value)) return []
        return resolvedItems.value.map((group) => ({
          $raw: group,
          label: resolveGroupLabel(group),
          items: normalizeItems(resolveGroupChildren(group)),
        }))
      })

      /**
       * Whether the items are grouped (a `groupLabel` or `groupChildren` prop
       * is set).
       */
      const grouped = computed(
        () => !!(props.groupLabel || props.groupChildren)
      )

      /**
       * The resolved label(s) of the currently selected item(s). Returns a
       * single string for single-select, or an array of strings for
       * multi-select. Returns `undefined` (single) or `[]` (multiple) when
       * nothing is selected.
       */
      const selectedLabel = computed<string | string[] | undefined>(() => {
        const isMultiple = config?.multiple || props.multiple
        const currentValue = deps.model.value

        if (
          currentValue == null ||
          equals(currentValue, deps.nullValue.value)
        ) {
          return isMultiple ? [] : undefined
        }

        const allItems = normalizedItems.value

        if (isMultiple && Array.isArray(currentValue)) {
          return currentValue.map((v) => {
            const item = allItems.find((i) => equals(i.value, v))
            return item?.label ?? String(v)
          })
        }

        const item = allItems.find((i) => equals(i.value, currentValue))
        return item?.label
      })

      /**
       * Whether the resolved data uses synthetic `{ value, label }` items. True
       * for plain object maps and arrays of primitives — cases where raw values
       * are wrapped into `{ value, label }` objects.
       */
      const synthetic = computed(() => {
        const source = resolvedItems.value

        if (isPlainObject(source)) return true
        if (
          Array.isArray(source) &&
          source.length > 0 &&
          !isPlainObject(source[0])
        )
          return true
        return false
      })

      /**
       * Whether `itemDisabled` needs conditional resolution. A string key or a
       * function that only ever returns a boolean can be forwarded as-is;
       * anything else must be resolved into `__disabled` on `rawItems`.
       */
      const disabledIsConditional = computed(() => {
        const disabled = props.itemDisabled
        if (disabled === undefined) return false

        const allItems = itemsOrGroups.value as any[]

        if (typeof disabled === 'string') {
          for (const item of allItems) {
            const val = item.$raw[disabled]
            if (val != null && typeof val !== 'boolean') return true
          }
          return false
        }

        if (typeof disabled !== 'function') return false

        for (const item of allItems) {
          const result = disabled(item.$raw)
          if (result != null && typeof result !== 'boolean') return true
        }
        return false
      })

      /**
       * Disabled accessor to forward to third-party components. Points at
       * `__disabled` when conditional resolution is required.
       */
      const itemDisabled = computed<
        string | ((item: any) => boolean) | undefined
      >(() => {
        const disabled = props.itemDisabled
        if (disabled === undefined) return undefined
        if (disabledIsConditional.value) return '__disabled'
        return disabled as string | ((item: any) => boolean)
      })

      /**
       * Label accessor to forward to third-party components. Falls back to
       * `'label'` for synthetic items.
       */
      const itemLabel = computed<string | ((item: any) => string) | undefined>(
        () => {
          if (props.itemLabel) return props.itemLabel
          return synthetic.value ? 'label' : undefined
        }
      )

      /**
       * Value accessor to forward to third-party components. Falls back to
       * `'value'` for synthetic items.
       */
      const itemValue = computed<string | ((item: any) => any) | undefined>(
        () => {
          if (props.itemValue) return props.itemValue
          return synthetic.value ? 'value' : undefined
        }
      )

      // =============== METHODS ==============

      const toResolvedItem = (
        item: NormalizedItem,
        index: number
      ): ResolvedItem | undefined => {
        if (index !== undefined && availabilityStates) {
          const availableRef = availabilityStates.value[index]
          if (availableRef && !availableRef.value) return undefined
        }

        const disabledRef = disabledStates.value[index]

        const resolved: ResolvedItem = {
          value: item.value,
          label: item.label,
          disabled: disabledRef ? disabledRef.value : false,
          key: index,
          $raw: item.$raw,
        }

        return resolved
      }

      /**
       * Processes a single resolved item into a library-friendly object. When
       * conditional disabled resolution is active, `__disabled` is injected;
       * otherwise the original raw item is returned as-is.
       *
       * @param item The resolved item to process.
       */
      const processItem = (item: any) => {
        const raw = item.$raw
        if (!disabledIsConditional.value) {
          return raw
        }

        Object.defineProperty(raw, '__disabled', {
          value: item.disabled,
          enumerable: false,
          configurable: true,
          writable: true,
        })

        return raw
      }

      const normalizeItems = (
        items: any[] | Record<string, any>
      ): NormalizedItem[] => {
        if (Array.isArray(items)) {
          return items.map((item) => {
            const isPrimitive = !isPlainObject(item)
            const raw = !isPrimitive ? item : { value: item, label: item }

            return {
              $raw: raw,
              value: resolveValue(raw, isPrimitive ? 'value' : undefined),
              label: resolveLabel(raw, isPrimitive ? 'label' : undefined),
            }
          })
        }

        if (isPlainObject(items)) {
          return typedEntries(items).map(([key, label]) => {
            const value = normalize(key)
            const raw = { value, label }
            return {
              $raw: raw,
              value: resolveValue(raw, 'value'),
              label: resolveLabel(raw, 'label'),
            }
          })
        }

        return []
      }

      const resolveValue = (item: any, itemValue?: ItemValue) => {
        const value = itemValue ?? props.itemValue
        if (!value) return item
        if (typeof value === 'string') return item[value]
        return value(item)
      }

      const resolveLabel = (item: any, itemLabel?: ItemLabel) => {
        const label = itemLabel ?? props.itemLabel
        if (!label) return isPlainObject(item) ? JSON.stringify(item) : item
        if (typeof label === 'string') return item[label]
        return label(item)
      }

      const resolveGroupLabel = (group: any): string => {
        const gl = props.groupLabel
        if (!gl) return ''
        if (typeof gl === 'string') return group[gl] ?? ''
        return gl(group)
      }

      const resolveGroupChildren = (
        group: any,
        level = 0
      ): any[] | Record<string, any> => {
        const gc = props.groupChildren
        if (!gc) return []
        if (typeof gc === 'string') return group[gc] ?? []
        if (Array.isArray(gc)) return group[gc[level]] ?? []
        return gc(group)
      }

      // ============= CONDITIONS =============
      /**
       * Shared conditions options forwarded to each conditional list.
       */
      const conditionsOptions = {
        trigger: toRef(() => props.conditionsTrigger),
        debounce: toRef(() => props.conditionsDebounce),
      }

      const disabledStates = useConditionalList(
        normalizedItems,
        (item: NormalizedItem): ConditionsResult => {
          const disabled = props.itemDisabled
          if (disabled === undefined) return false
          if (typeof disabled === 'string') return item.$raw[disabled] ?? false
          return disabled(item.$raw) ?? false
        },
        conditionsOptions
      )

      const availabilityStates =
        config?.conditions !== false
          ? useConditionalList(
              normalizedItems,
              (item: NormalizedItem): ConditionsResult | undefined => {
                const conditions = props.itemConditions
                if (conditions === undefined) return undefined
                if (typeof conditions === 'string') return item.$raw[conditions]
                return conditions(item.$raw)
              },
              conditionsOptions
            )
          : undefined

      const groupAvailabilityStates =
        config?.conditions !== false
          ? useConditionalList(
              normalizedGroups,
              (group: {
                $raw: any
                label: string
                items: NormalizedItem[]
              }): ConditionsResult | undefined => {
                const conditions = props.groupConditions
                if (conditions === undefined) return undefined
                if (typeof conditions === 'string')
                  return group.$raw[conditions]
                return conditions(group.$raw)
              },
              conditionsOptions
            )
          : undefined

      // =============== HOOKS ================

      if (!props.minLength) {
        resolveItems()
      }

      // ============== WATCHERS ==============

      if (config?.conditions !== false) {
        let settled = false

        watch(itemsOrGroups, (currentItems, previousItems) => {
          if (!settled) {
            settled = true
            return
          }

          if (equals(currentItems, previousItems)) return
          const currentValue = deps.model.value
          if (
            currentValue == null ||
            equals(currentValue, deps.nullValue.value)
          ) {
            return
          }
          const allItems = normalizedItems.value
          const flatItems: ResolvedItem[] = grouped.value
            ? groups.value.flatMap((g) => g.items)
            : items.value
          const isConditionFiltered = (v: any) =>
            allItems.some((i) => equals(i.value, v)) &&
            !flatItems.some((i) => equals(i.value, v))
          if (
            (config?.multiple || props.multiple) &&
            Array.isArray(currentValue)
          ) {
            const filtered = currentValue.filter((v) => !isConditionFiltered(v))
            if (filtered.length !== currentValue.length) {
              deps.update(filtered)
            }
          } else {
            if (isConditionFiltered(currentValue)) {
              deps.update(deps.nullValue.value)
            }
          }
        })
      }

      return {
        items,
        groups,
        rawItems,
        resolvedItems,
        normalizedItems,
        selectedLabel,
        itemLabel,
        itemValue,
        itemDisabled,
        grouped,
        resolving,
        synthetic,
        resolveItems,
      } as MakeItemsReturn<P>
    }
)
