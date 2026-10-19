```ts
/**
 * A11y pattern for choice-group elements: the `wrapper` bag carries the group
 * container's role, labelling (labelledby when a label renders, aria-label
 * fallback otherwise), describedby, and group-level state.
 *
 * Register with `useA11y(choicesAria({ role: 'radiogroup' }))`.
 *
 * @param config `role` picks the container role (`'group'` by default,
 *   `'radiogroup'` for radio groups).
 */
const choicesAria: (config?: {
  role?: 'group' | 'radiogroup'
}) => (
  api: LayoutPatternApi & {
    genericName: Ref<string>
    invalid: Ref<boolean>
    required: Ref<boolean>
    hasError: Ref<boolean>
  }
) => GroupAriaA11y
```
