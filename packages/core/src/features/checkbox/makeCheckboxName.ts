import { computed } from 'vue'
import { useDynamicProp } from '@core/composables'
import type { makeElement } from '@core/features'
import { defineFeature } from '@core/helpers'
import type { ReturnsOf, TProp } from '@core/types'

/**
 * Configuration for the checkbox name factory resolving the HTML name
 * attribute.
 */
type MakeCheckboxNameOptions = {
  props: {
    /**
     * Overrides the HTML `name` attribute for the checkbox input.
     */
    checkboxName: TProp | undefined
  }

  deps: ReturnsOf<[[typeof makeElement, ['container', 'path']]]>
}

/**
 * Resolves the checkbox input name from the checkboxName prop or container
 * path.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeCheckboxName = defineFeature(
  () =>
    ({ props, deps }: MakeCheckboxNameOptions) => {
      const { container, path } = deps

      const checkboxName = useDynamicProp('checkboxName', props)

      /**
       * The resolved HTML name attribute, falling back to the parent checkboxes
       * container path or element path.
       */
      const inputName = computed(
        () =>
          checkboxName.value ||
          (container.type === 'holder' ? container.path.value : path.value)
      )

      return {
        inputName,
      }
    }
)
