import { toRef, type Ref } from 'vue'

import { useElementContext, useFormContext } from '#core/contexts'

/**
 * Returns a reactive ref that resolves a prop value by falling back from the
 * element context to the form context.
 *
 * @private
 * @param prop The prop name to look up on the element and form contexts.
 */
export function useFallbackProp<T = any>(prop: string): Ref<T> {
  const el$ = useElementContext()
  const form$ = useFormContext()

  return toRef(() => el$?.props?.[prop] ?? (form$?.props as any)?.[prop])
}
