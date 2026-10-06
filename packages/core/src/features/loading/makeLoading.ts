import { computed, toRef, unref } from 'vue'

import { useConditions } from '#core/composables'
import { type makeElement, type makeData } from '#core/features'
import { defineFeature } from '#core/helpers'
import {
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '#core/modules/conditions'
import type { ReturnsOf } from '#core/types'

/**
 * Configuration for the loading factory combining explicit loading props with
 * async pending state from inputs.
 */
type MakeLoadingOptions = {
  props: {
    loading?: ConditionalProp
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
  }
  deps: ReturnsOf<
    [[typeof makeElement, ['path']], [typeof makeData, ['pending']]]
  >
}

/**
 * Provides loading state that combines the element's pending state with an
 * explicit loading prop. The prop is evaluated through the conditions pipeline,
 * so sync and async conditional values are supported uniformly.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
export const makeLoading = defineFeature(
  () =>
    ({ props, deps }: MakeLoadingOptions) => {
      const { path, pending } = deps

      // ============= CONDITIONS =============

      const conditionalLoading = useConditions(
        toRef(() => props.loading),
        {
          path,
          trigger: toRef(() => props.conditionsTrigger),
          debounce: toRef(() => props.conditionsDebounce),
        }
      )

      // ============== COMPUTED ==============

      /**
       * Whether the element is in a loading state, true when pending,
       * explicitly set to loading, or resolved via conditions.
       */
      const loading = computed(() => {
        const loading = unref(props.loading)

        return (
          pending.value ||
          loading === true ||
          loading === '' ||
          conditionalLoading.value
        )
      })

      return {
        loading,
      }
    }
)
