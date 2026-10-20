```ts
/**
 * Binding pattern for choice-group elements: the `wrapper` entry carries the
 * group container's role, labelling (labelledby when a label renders,
 * aria-label fallback otherwise), describedby, and group-level state.
 *
 * Register with `useBindings(choicesAria(api, { role: 'radiogroup' }))`.
 *
 * @param api The component api slice the entries read.
 * @param config `role` picks the container role (`'group'` by default,
 *   `'radiogroup'` for radio groups).
 */
const choicesAria: (
  api: LayoutPatternApi & {
    genericName: Ref<string>
    invalid: Ref<boolean>
    required: Ref<boolean>
    hasError: Ref<boolean>
  },
  config?: { role?: 'group' | 'radiogroup' }
) => BindingDefsOf<LayoutRegionBindings & { wrapper: ChoicesAriaBag }>
```
