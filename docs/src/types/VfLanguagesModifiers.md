```ts
/**
 * Styling modifiers of the VfLanguages component.
 */
interface VfLanguagesModifiers extends LanguagesModifiers {
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
