```ts
/**
 * Part-keyed binding definitions of the VfLanguages component, registered via
 * `useBindings`. The `wrapper` entry is a parameterized resolver, so the key
 * is functional — the template calls `bindings.wrapper(selected, invalid)`.
 */
interface VfLanguagesBindings extends LanguagesBindings {
  /**
   * Each language wrapper's selection and validity state.
   *
   * @param selected Whether this language option is currently selected.
   * @param invalid Whether this language has validation errors.
   */
  wrapper: (
    selected: boolean,
    invalid: boolean
  ) => {
    'data-selected'?: ''
    'data-invalid'?: ''
  }
}
```
