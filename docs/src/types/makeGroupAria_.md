```ts
/**
 * Provides the part-keyed accessibility bindings for a choice-group element
 * (radio/checkbox groups): the `group` bag carries the container's role,
 * labelling (labelledby when a label renders, aria-label fallback otherwise),
 * describedby, and group-level state.
 *
 * @param config Group options; `role` picks the container role (`'group'` by
 *   default, `'radiogroup'` for radio groups).
 */
const makeGroupAria: (
  config?: { role?: 'group' | 'radiogroup' } | undefined
) => (options: MakeGroupAriaOptions) => {
  a11yBindings: ComputedRef<GroupAriaA11y>
}
```
