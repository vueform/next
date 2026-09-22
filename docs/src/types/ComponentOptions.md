```ts
/**
 * Options passed to the Vueform component factory when defining a component.
 */
type ComponentOptions = {
  /**
   * Whether the component is a form element (participates in form data and
   * validation).
   */
  element?: boolean

  /**
   * The registered name of the component (e.g. `'VfText'`).
   */
  name: string

  /**
   * Vue component props options for the component.
   */
  props?: ComponentPropsOptions

  /**
   * The list of event names the component can emit.
   */
  emits?: string[]
}
```
