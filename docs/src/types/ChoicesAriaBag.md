```ts
/**
 * The attribute bag the `choicesAria` pattern resolves for the `wrapper`
 * part: the group container's role, labelling, describedby, and group-level
 * state. Components whose `wrapper` entry merges their own attributes on top
 * compose it (`() => { ... } & ChoicesAriaBag`). The entry producing it is a
 * zero-argument resolver on purpose: it reads child-aggregating state
 * (`invalid`, `hasError`), which must resolve in the wrapper's own render
 * effect — never inside a shared computed that children's vapor dynamic prop
 * sources pull, where it would close a reactive cycle (aggregate ->
 * children's validation -> child props -> this component's bindings) that
 * Vue 3.6's dirty-check walk cannot terminate on.
 */
interface ChoicesAriaBag {
  role: 'group' | 'radiogroup'
  'aria-labelledby'?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: true
  'aria-required'?: true
}
```
