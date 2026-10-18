```ts
/**
 * Part-keyed accessibility bindings provided by `makeGroupAria` for
 * choice-group elements: the `group` bag carries the container's role,
 * labelling, describedby, and group-level state.
 */
interface GroupAriaA11y extends A11yLayoutBags {
  /**
   * Role, labelling, and ARIA state for the group container.
   */
  group: {
    role: 'group' | 'radiogroup'
    'aria-labelledby'?: string
    'aria-label'?: string
    'aria-describedby'?: string
    'aria-invalid'?: true
    'aria-required'?: true
  }
}
```
