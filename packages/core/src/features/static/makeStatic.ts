import { onBeforeUnmount, watch } from 'vue'

import { useComponentContext } from '#src/contexts'
import type { makeElement } from '#src/features'
import { defineFeature } from '#src/helpers'
import type { ReturnsOf } from '#src/types'

/**
 * Configuration for the static factory registering a data-less element with
 * its parent container.
 */
type MakeStaticOptions = {
  deps: ReturnsOf<[[typeof makeElement, ['path', 'container']]]>
}

/**
 * Registers a static element with its parent container — path only, no data
 * path, no model — so `form$.find()` and children walking see it, while data
 * collection skips it via the `isStatic` context flag. Static elements are
 * the data-less ones (no data feature in their blueprint chain): button,
 * content. No container means a detached or standalone element — nothing to
 * register with.
 *
 * @param options Factory options containing resolved dependencies.
 */
export const makeStatic = defineFeature(() => ({ deps }: MakeStaticOptions) => {
  const context$ = useComponentContext()
  const { path, container } = deps

  if (container) {
    container.register(context$, path.value)

    // A path change is a reorder or rename (e.g. inside a list row) —
    // re-point the registration without touching anything else.
    watch(path, (newPath, oldPath) => {
      container.unregister(oldPath, undefined, context$)
      container.register(context$, newPath)
    })

    onBeforeUnmount(() => {
      container.unregister(path.value, undefined, context$)
    })
  }

  return {
    /**
     * Whether the element is a static (non-data) element.
     */
    isStatic: true,
  }
})
