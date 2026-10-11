import { computed, toRef, unref } from 'vue'

import { useConditions } from '#src/composables'
import { useFormContext } from '#src/contexts'
import type { makeElement } from '#src/features'
import { defineFeature } from '#src/helpers'
import {
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '#src/modules/conditions'
import type { ReturnsOf } from '#src/types'

/**
 * Configuration for the readonly factory controlling whether the element is
 * read-only.
 */
type MakeReadonlyOptions = {
  props: {
    readonly: ConditionalProp | undefined
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
  }
  deps: ReturnsOf<[[typeof makeElement, ['path']]]>
}

/**
 * Provides readonly state management for form elements.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
export const makeReadonly = defineFeature(
  () =>
    ({ props, deps }: MakeReadonlyOptions) => {
      const { path } = deps
      const form$ = useFormContext()

      // ============= CONDITIONS =============

      const conditionalReadonly = useConditions(
        toRef(() => props.readonly),
        {
          path,
          trigger: toRef(() => props.conditionsTrigger),
          debounce: toRef(() => props.conditionsDebounce),
        }
      )

      // ============== COMPUTED ==============

      /**
       * Whether the element is readonly, resolved from the prop, form-level
       * setting, or conditional logic. The prop is evaluated through the
       * conditions pipeline, so sync and async conditional values are supported
       * uniformly.
       */
      const readonly = computed(() => {
        const readonly = unref(props.readonly)

        return !!form$?.readonly || readonly === '' || conditionalReadonly.value
      })

      return {
        readonly,
      }
    }
)
