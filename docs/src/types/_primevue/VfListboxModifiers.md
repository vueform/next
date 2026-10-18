```ts
/**
 * Styling modifiers of the VfListbox component.
 */
interface VfListboxModifiers extends ListboxModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The listbox control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
