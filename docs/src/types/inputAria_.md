```ts
/**
 * Binding pattern for single-input elements: the `input` entry carries ARIA
 * state (describedby, invalid, required, busy), and the layout entries
 * (label, help, description, errors) carry the ids and roles their regions
 * must render with.
 *
 * Register with `useBindings(inputAria(api))`. The entries read
 * child-aggregating state (`hasError`), which is exactly why they are
 * zero-argument resolvers: the reads run in each part's own render effect,
 * never inside a shared computed that children's vapor prop sources pull.
 *
 * @param api The component api slice the entries read.
 */
const inputAria: (
  api: LayoutPatternApi & {
    hasError: Ref<boolean>
    busy: Ref<boolean>
    required: Ref<boolean>
  }
) => BindingDefsOf<LayoutRegionBindings & { input: InputAriaBag }>
```
