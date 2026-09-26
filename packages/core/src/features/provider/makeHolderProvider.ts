import { computed } from 'vue'
import type { ContainerTypes } from '#core/contexts'
import type { ElementName, ReturnsOf } from '#core/types'
import { useContainerProvider } from '#core/composables'
import { type makeElement, type makeItems, type makeData } from '#core/features'
import { defineFeature } from '#core/helpers'
import { equals } from '#core/utils'

/**
 * Configuration for the holder provider factory, controlling single- or
 * multi-select container context for child elements.
 */
type MakeHolderProviderOptions = {
  deps: ReturnsOf<
    [
      [
        typeof makeElement,
        ['id', 'available', 'visible', 'path', 'children', 'container'],
      ],
      [typeof makeData, ['model', 'onUserInput', 'dataPath']],
      [typeof makeItems, ['normalizedItems']],
    ]
  >
}

/**
 * Configuration for the holder provider factory.
 */
type MakeHolderProviderConfig = {
  /**
   * Whether the holder allows multiple selections (checkboxes) or a single
   * selection (radios).
   */
  multiple: boolean

  /**
   * The prop name on child elements used to resolve the item value when no
   * matching normalized item exists (e.g. `'radioValue'` or `'trueValue'`).
   */
  valueProp: string

  /**
   * The container type identifier passed to `useContainerProvider`. Defaults to
   * `'holder'` when not specified.
   */
  type?: keyof ContainerTypes
}

/**
 * Resolves the actual item value for a child element by its registered name.
 * Uses the normalized items list when available (standard rendering), falling
 * back to reading the child's configured value prop (matrix / custom slot).
 *
 * @param name The child element's registered name.
 * @param normalizedItems The pre-filter normalized items from makeItems.
 * @param children The children registry.
 * @param valueProp The prop name to read from the child when no normalized item
 *   matches.
 */
function resolveChildValue(
  name: string | number,
  normalizedItems: any[],
  children: Map<ElementName, any>,
  valueProp: string
) {
  const key = typeof name !== 'number' ? parseInt(name) : name
  if (!isNaN(key) && normalizedItems[key]) {
    return normalizedItems[key].value
  }
  return children.get(name)?.props?.[valueProp]
}

/**
 * Provides container context with model mapping and child registration for
 * single- or multi-select holders. Children receive their own configured
 * checked value (`radioValue` / `trueValue`, `true` by default) when selected,
 * and `null` (single) or their `falseValue` (multiple) otherwise. The provider
 * translates between these child values and actual item values.
 *
 * @param config Factory configuration controlling selection mode, child value
 *   prop, and container type.
 */
export const makeHolderProvider = defineFeature(
  (config: MakeHolderProviderConfig) =>
    ({ deps }: MakeHolderProviderOptions) => {
      const {
        id,
        available,
        visible,
        path,
        dataPath,
        children,
        container,
        model,
        normalizedItems,
        onUserInput,
      } = deps

      const { multiple, valueProp, type = 'holder' } = config

      useContainerProvider({
        type,
        id,
        available,
        visible,
        path,
        dataPath,
        children,
        container,
        model: computed(() => {
          const selected = multiple ? model.value || [] : model.value
          const items = normalizedItems.value
          const result: Record<string, any> = {}
          for (const [name] of children.children$) {
            const itemValue = resolveChildValue(
              name,
              items,
              children.children$,
              valueProp
            )

            // Children render their checked state by comparing their model
            // against their own configured value prop (`radioValue` /
            // `trueValue`), so map back to that value rather than a plain
            // boolean. For standard child elements these are `true` / `false`
            // anyway, but they differ for matrix cells and custom slot
            // children that carry the item value on the prop itself.
            const childProps = children.children$.get(name)?.props
            const checkedValue = childProps?.[valueProp] ?? true

            result[name] = multiple
              ? selected.some((v: any) => equals(v, itemValue))
                ? checkedValue
                : (childProps?.falseValue ?? false)
              : equals(itemValue, selected)
                ? checkedValue
                : null
          }
          return result
        }),
        register(instance, path) {
          children.register(path, instance)
          container.register(instance, path)
        },
        unregister(path, _dataPath, instance) {
          children.unregister(path, instance)
          container.unregister(path, undefined, instance)
        },
        update(childDataPath, value) {
          const name = childDataPath.split('.').slice(-1)[0]
          const itemValue = resolveChildValue(
            name,
            normalizedItems.value,
            children.children$,
            valueProp
          )

          if (multiple) {
            // Checked state may arrive as the child's configured checked value
            // (native input via `trueValue`) or as a plain `true`
            // (programmatic `update(true)`).
            const checkedValue =
              children.children$.get(name)?.props?.[valueProp] ?? true

            const newModel = (model.value || []).filter(
              (v: any) => !equals(v, itemValue)
            )

            if (value === true || equals(value, checkedValue)) {
              newModel.push(itemValue)
            }

            container.update(dataPath.value, newModel)
          } else {
            container.update(dataPath.value, value == null ? value : itemValue)
          }

          onUserInput()
        },
      })

      return {}
    }
)
