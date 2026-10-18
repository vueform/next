import { computed } from 'vue'

import { useLocale } from '#src/composables'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

// Type-only: erased at compile time, so the runtime module graph stays
// acyclic (blueprints import the aria features, not the reverse).
import type { FileListItem } from '#src/blueprints/file'

import type { makeAria } from './makeAria'
import type { FileAriaA11y } from './types'

/**
 * Configuration for the file ARIA factory extending the input's bindings with
 * the per-file remove control.
 */
type MakeFileAriaOptions = {
  deps: ReturnsOf<[[typeof makeAria, ['a11yBindings']]]>
}

/**
 * Extends the input's part-keyed accessibility bindings (from `makeAria`,
 * which must run earlier in the chain) with the per-file remove control's
 * bag — a function of the file index, resolved at the call site like
 * functional parts.
 *
 * @param options Factory options containing dependencies from earlier
 *   factories.
 */
export const makeFileAria = defineFeature(
  () =>
    ({ deps }: MakeFileAriaOptions) => {
      const { a11yBindings: inputBindings } = deps

      const { t } = useLocale()

      /**
       * Part-keyed accessibility bindings: the input's bags plus the per-file
       * remove control's localized label.
       */
      const a11yBindings = computed<FileAriaA11y>(() => ({
        ...inputBindings.value,
        remove: (_file: FileListItem, index: number) => ({
          'aria-label': t('sr_file_remove', { index: index + 1 }),
        }),
      }))

      return {
        a11yBindings,
      }
    }
)
