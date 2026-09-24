import type { RulesProp, TRulesProp } from '@core/modules/validation'
import type {
  ElementValidateOnProp,
  LooseContext,
  RuleMessagesProp,
  ShowRequiredProp,
  TProp,
} from '@core/types'

/**
 * Props for elements that support validation rules and error display.
 */
export interface ValidationProps<TContext = any> {
  /**
   * Validation rules to apply to the element.
   */
  rules?: RulesProp<TContext>

  /**
   * Whether to stop validation after the first failing rule.
   */
  bail?: boolean

  /**
   * Custom error messages keyed by validation rule name.
   */
  ruleMessages?: RuleMessagesProp<TContext>

  /**
   * The display name used in validation error messages.
   */
  displayName?: TProp<string, TContext>

  /**
   * Maximum number of validation errors to display at once.
   */
  maxErrors?: number

  /**
   * Whether to hide validation error messages.
   */
  hideErrors?: boolean

  /**
   * Where to show required field indicators (e.g. label, placeholder).
   */
  showRequired?: ShowRequiredProp

  /**
   * Delay in milliseconds before processing input.
   */
  debounce?: number

  /**
   * Whether to push the element's errors to its nearest ancestor element.
   */
  hoist?: boolean

  /**
   * Controls when validation is triggered (e.g. on change, blur, or submit).
   */
  validateOn?: ElementValidateOnProp
}

export interface TValidationProps<TContext = any> extends Omit<
  ValidationProps<TContext>,
  'rules'
> {
  /**
   * Validation rules to apply to the textarea.
   */
  rules?: TRulesProp<TContext>
}

/**
 * @write
 */
export interface ValidationEmits<TContext = LooseContext> {
  /**
   * Emitted when the element becomes valid after having been invalid.
   *
   * @param context$ The element's component context.
   */
  valid: [context$: TContext]

  /**
   * Emitted when the element becomes invalid.
   *
   * @param context$ The element's component context.
   */
  invalid: [context$: TContext]
}
