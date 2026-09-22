```ts
/**
 * Base props shared by all Vueform components (elements, form, and layout
 * components).
 */
interface BaseComponentProps<S, P, C, TContext = any> {
  /**
   * CSS classes to apply to the component's root element.
   */
  class?: ClassValue

  /**
   * Named configuration presets to apply to the component.
   */
  presets?: PresetsProp

  /**
   * Custom DOM attribute overrides for the component's structural parts.
   */
  parts?: PartsProp<P, TContext>

  /**
   * Custom CSS class overrides for the component's structural parts.
   */
  classes?: ClassesProp<C, TContext>

  /**
   * CSS class overrides that replace (rather than merge with) default classes.
   */
  reclass?: ReclassProp<C, TContext>

  /**
   * Custom Vue components to use for named slots. Every component resolves it
   * through the standard outlets pipeline (see `useOutlets`).
   */
  slots?: SlotsProp<S>

  /**
   * A custom Vue component to use as the template instead of the default.
   */
  template?: ComponentProp | null

  /**
   * A custom Vue component to render in the component's default slot.
   */
  component?: ComponentProp
}
```
