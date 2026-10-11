import { toRef, type Ref } from 'vue'

import { useComponentContext, useFormContext } from '#src/contexts'
import {
  getConditionsModule,
  type ConditionsResult,
} from '#src/modules/conditions'

import type { UseConditionsOptions } from './useConditions'

/**
 * Resolves conditions for a dynamic list of items into a parallel array of
 * boolean refs evaluated against the current form's model (or a custom one).
 * Items without conditions default to `true`. Setup-only: throws when called
 * outside a component setup context. When the `conditions` module is not
 * registered, returns an empty list.
 *
 * @private
 * @param source A ref or getter returning the list of items.
 * @param getConditions Extracts the conditions prop from each item.
 * @param options Path, debounce, trigger, date format, model, and context
 *   overrides.
 */
export function useConditionalList<T>(
  source: Ref<T[]>,
  getConditions: (item: T) => ConditionsResult | undefined,
  options: UseConditionsOptions = {}
): Ref<Ref<boolean>[]> {
  const module = getConditionsModule()
  const context$ = options.context$ ?? useComponentContext()
  const form$ = useFormContext() ?? context$?.form$
  const model = options.model ?? toRef(() => form$?.model)

  return module.makeConditionalList(source, getConditions, model, context$, {
    path: options.path,
    debounce: options.debounce,
    trigger: options.trigger,
    valueFormat: options.valueFormat,
    form$,
  })
}
