import type {
  ConditionalProp,
  ConditionsTriggerProp,
} from '#src/modules/conditions'
import type {
  BaseComponentA11y,
  BaseComponentClasses,
  BaseComponentEmits,
  BaseComponentExpose,
  BaseComponentModifiers,
  BaseComponentParts,
  BaseComponentProps,
  BaseComponentSlots,
  ElementName,
  ExpressionsProp,
  LooseContext,
  TProp,
} from '#src/types'

/**
 * Base props shared by all form element types (text, checkbox, select, etc.).
 */
export interface BaseElementProps<
  T extends string,
  S,
  P,
  C,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The element type identifier.
   */
  type?: T

  /**
   * The element's unique identifier and path in the current level of form data
   * model.
   */
  name: ElementName

  /**
   * The HTML `id` attribute for the input element.
   */
  id?: TProp<string, TContext>

  /**
   * Conditions that control the element's visibility and availability.
   */
  conditions?: ConditionalProp<TContext>

  /**
   * The source that triggers re-evaluation of this element's async conditional
   * props (`conditions`, `disabled`, `readonly`, and validation rule
   * conditions). Accepts an array of element paths whose values are watched, a
   * `Ref`, or a function used as a watch getter. When omitted, any change in
   * the form model re-triggers evaluation.
   */
  conditionsTrigger?: ConditionsTriggerProp<TContext>

  /**
   * The debounce delay in milliseconds applied before re-evaluating this
   * element's async conditional props when the trigger source changes.
   * Overrides the global `$conditions.debounce` config (default `300`).
   */
  conditionsDebounce?: number

  /**
   * Whether the element is detached from the form's element registry and data
   * model (if applicable).
   */
  detached?: boolean

  /**
   * Controls which props allow dynamic expression resolution. Set to `false`
   * to disable all expression evaluation, `true` to enable for all
   * expressionable props, or an array of prop keys to enable selectively.
   */
  expressions?: ExpressionsProp
}

/**
 * Base events emitted by all form element types.
 */
export interface BaseElementEmits<
  TContext = LooseContext,
> extends BaseComponentEmits<TContext> {}

/**
 * Base slots shared by all form element types. Threads `TContext` through to
 * `BaseComponentSlots` (including the `#template` slot).
 */
export interface BaseElementSlots<
  TContext = LooseContext,
> extends BaseComponentSlots<TContext> {}

export interface BaseElementParts extends BaseComponentParts {}

/**
 * Parts base for field-kind elements — elements whose accessible name is the
 * native `<label for>` association. Adapters augment it with the parts whose
 * contract differs by element kind (the label).
 */
export interface BaseFieldElementParts extends BaseElementParts {}

/**
 * Parts base for container-kind elements — elements named via
 * `aria-labelledby` that can render their label as a heading (`heading`
 * prop). Adapters augment it with the parts whose contract differs by
 * element kind (the label).
 */
export interface BaseContainerElementParts extends BaseElementParts {}
export interface BaseElementClasses extends BaseComponentClasses {}
export interface BaseElementModifiers extends BaseComponentModifiers {}
export interface BaseElementA11y extends BaseComponentA11y {}
export interface BaseElementExpose extends BaseComponentExpose {}
