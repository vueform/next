import { computed, ref, toRef, unref } from 'vue'
import type { makeElement } from '#core/features'
import type { ReturnsOf } from '#core/types'
import { useConditions } from '#core/composables'
import { useContainerContext, useFormContext } from '#core/contexts'
import { defineFeature } from '#core/helpers'
import {
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '#core/modules/conditions'

/**
 * Configuration for the disable factory controlling whether the element is
 * disabled.
 */
type MakeDisabledOptions = {
  props: {
    disabled: ConditionalProp | undefined
    conditionsTrigger?: ConditionsTriggerProp
    conditionsDebounce?: number
  }
  deps: ReturnsOf<[[typeof makeElement, ['path']]]>
}

/**
 * Provides disabled state management with programmatic enable/disable methods.
 *
 * @param options Factory options containing element props and resolved
 *   dependencies.
 */
export const makeDisabled = defineFeature(
  () =>
    ({ props, deps }: MakeDisabledOptions) => {
      const { path } = deps
      const form$ = useFormContext()
      const container = useContainerContext()

      // ================ DATA ================

      /**
       * Local override for the disabled state, set via enable/disable methods.
       */
      const localDisabled = ref<undefined | boolean>()

      // ============= CONDITIONS =============

      const conditionalDisabled = useConditions(
        toRef(() => props.disabled),
        {
          path,
          trigger: toRef(() => props.conditionsTrigger),
          debounce: toRef(() => props.conditionsDebounce),
        }
      )

      // ============== COMPUTED ==============

      /**
       * Whether the element is currently disabled, considering form state,
       * parent container state, local override, and the disabled prop. The prop
       * is evaluated through the conditions pipeline, so sync and async
       * conditional values are supported uniformly.
       */
      const disabled = computed(() => {
        const disabled = unref(props.disabled)

        return (
          form$?.disabled ||
          container?.disabled.value ||
          localDisabled.value ||
          disabled === true ||
          disabled === '' ||
          conditionalDisabled.value
        )
      })

      // ============== METHODS ===============

      /**
       * Programmatically disables the element.
       */
      const disable = () => {
        localDisabled.value = true
      }

      /**
       * Programmatically enables the element.
       */
      const enable = () => {
        localDisabled.value = false
      }

      return {
        disabled,
        disable,
        enable,
      }
    }
)
