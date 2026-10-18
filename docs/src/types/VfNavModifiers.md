```ts
/**
 * Styling modifiers of the VfNav component.
 */
interface VfNavModifiers extends NavModifiers {
  /**
   * The root navigation element's position variant and the marker set while
   * the back button is hidden on the first page.
   */
  root: {
    'data-position'?: NavPosProp
    'data-no-back'?: ''
  }

  /**
   * The next button's loading state.
   */
  next: {
    'data-loading'?: ''
  }

  /**
   * The finish button's loading state.
   */
  finish: {
    'data-loading'?: ''
  }
}
```
