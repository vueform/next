```ts
/**
 * Base props shared by all form element types (text, checkbox, select, etc.).
 */
interface BaseElementProps<
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
   * Disables expression resolution for this element. Applies to the element
   * itself only (container elements don't cascade it to their children), and a
   * form-level `noExpressions` cannot be overridden by setting it to `false`
   * here.
   */
  noExpressions?: boolean
}
```
