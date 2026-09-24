import { computed, type ComputedRef } from 'vue'
import { useComponentContext } from '@core/contexts'
import { defineFeature } from '@core/helpers'
import type { AddonItem, AddonProp } from '@core/types'

/**
 * Configuration for the addons factory providing before/after addon props.
 */
type MakeAddonsOptions = {
  props: {
    addonBefore: AddonProp | undefined
    addonAfter: AddonProp | undefined
  }
}

/**
 * Resolves an `AddonProp` into an array of individual `AddonItem` values.
 * Functions are called with the element context and arrays are split so each
 * item becomes its own addon.
 */
function resolveAddons(
  prop: AddonProp | undefined,
  context$: any
): AddonItem[] {
  if (!prop) return []

  let raw: any = prop

  if (typeof raw === 'function') {
    raw = raw(context$)
  }

  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
  }

  return [raw]
}

/**
 * Provides resolved before/after addon arrays for input elements. Functions are
 * called with the element context and arrays are split so each item is passed
 * individually to `VfAddon`.
 *
 * @param options Factory options containing the element's addon props.
 */
export const makeAddons = defineFeature(
  () =>
    ({ props }: MakeAddonsOptions) => {
      const context$ = useComponentContext()

      /**
       * Whether this element supports before/after addons.
       */
      const addonable = true

      /**
       * Array of resolved before-addons, each an individual `AddonItem` for
       * `VfAddon`.
       */
      const addonsBefore: ComputedRef<AddonItem[]> = computed(() =>
        resolveAddons(props.addonBefore, context$)
      )

      /**
       * Array of resolved after-addons, each an individual `AddonItem` for
       * `VfAddon`.
       */
      const addonsAfter: ComputedRef<AddonItem[]> = computed(() =>
        resolveAddons(props.addonAfter, context$)
      )

      return {
        addonable,
        addonsBefore,
        addonsAfter,
      }
    }
)
