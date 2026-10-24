import { computed, watch } from 'vue'

import { useDynamicProp } from '#src/composables'
import { useComponentContext } from '#src/contexts'
import { type makeElement, type makeData } from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf, TProp } from '#src/types'

/**
 * Configuration for the radio name factory resolving the HTML name attribute
 * and standalone radio group behavior.
 */
type MakeRadioNameOptions = {
  props: {
    /**
     * Overrides the HTML `name` attribute for the radio input.
     */
    radioName: TProp | undefined

    type: any
  }

  deps: ReturnsOf<
    [
      [typeof makeElement, ['container', 'path', 'form$']],
      [typeof makeData, ['value']],
    ]
  >
}

/**
 * Resolves the radio input name from the radioName prop or container path, and
 * deselects other standalone radios in the same group when one is selected.
 *
 * @param options Factory options containing element props and dependencies.
 */
export const makeRadioName = defineFeature(
  () =>
    ({ props, deps }: MakeRadioNameOptions) => {
      const context$ = useComponentContext()
      const { container, path, form$, value } = deps

      const radioName = useDynamicProp('radioName', props)

      /**
       * The resolved input name for the radio button, falling back to the
       * container or element path.
       */
      const inputName = computed(
        () =>
          radioName.value ||
          (container.type === 'holder' ? container.path.value : path.value)
      )

      // ============== WATCHERS ==============

      watch(value, (val) => {
        if (container.type === 'holder') return
        if (!radioName.value || !val || !form$) return

        for (const [, el] of form$.elements$) {
          if (
            el &&
            el !== context$ &&
            el.type === props.type &&
            el.inputName === radioName.value &&
            el.value !== null
          ) {
            el.update(null)
          }
        }
      })

      return {
        inputName,
      }
    }
)
