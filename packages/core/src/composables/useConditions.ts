import { toRef, type MaybeRef, type Ref } from 'vue'

import { useComponentContext, useFormContext } from '#src/contexts'
import {
  getConditionsModule,
  type ConditionalProp,
  type ConditionsTriggerProp,
} from '#src/modules/conditions'

/**
 * Options for the `useConditions` / `useConditionalList` composables.
 */
export interface UseConditionsOptions {
  /**
   * The element's path used for wildcard resolution in structured conditions.
   */
  path?: MaybeRef<string>

  /**
   * The debounce delay in milliseconds applied before re-evaluating async
   * conditions when the trigger source changes. Overrides the global
   * `$conditions.debounce` config (default `300`).
   */
  debounce?: MaybeRef<number | undefined>

  /**
   * The source that triggers re-evaluation of async conditions. When omitted,
   * any change in the model re-triggers evaluation.
   */
  trigger?: MaybeRef<ConditionsTriggerProp | undefined>

  /**
   * The date format used when comparing the target value in date-based
   * structured conditions.
   */
  valueFormat?: MaybeRef<string | undefined>

  /**
   * The model conditions are checked against. Defaults to the current form's
   * model (`useFormContext().model`).
   */
  model?: MaybeRef<Record<string, any> | undefined>

  /**
   * The component context passed to function conditions. Defaults to the
   * current component's context (`useComponentContext()`).
   */
  context$?: any
}

/**
 * Resolves a conditional prop into a boolean ref evaluated against the current
 * form's model (or a custom one). Setup-only: throws when called outside a
 * component setup context. When the `conditions` module is not registered,
 * returns a ref that always treats conditions as met.
 *
 * @private
 * @param conditions The raw conditional value (or a ref/getter to it).
 * @param options Path, debounce, trigger, date format, model, and context
 *   overrides.
 */
export function useConditions(
  conditions: MaybeRef<ConditionalProp | undefined>,
  options: UseConditionsOptions = {}
): Ref<boolean> {
  const module = getConditionsModule()
  const context$ = options.context$ ?? useComponentContext()
  const form$ = useFormContext() ?? context$?.form$
  const model = options.model ?? toRef(() => form$?.model)

  return module.makeConditional(conditions, model, context$, {
    path: options.path,
    debounce: options.debounce,
    trigger: options.trigger,
    valueFormat: options.valueFormat,
    form$,
  })
}
