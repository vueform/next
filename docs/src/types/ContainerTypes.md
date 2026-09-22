```ts
/**
 * Maps container type identifiers to their corresponding component types.
 */
interface ContainerTypes {
  /**
   * The root form container.
   */
  root: any

  /**
   * A holder group container (eg. checkboxes and radios).
   */
  holder: any

  /**
   * A grid layout container.
   */
  grid: any

  /**
   * A list container managing repeatable elements.
   */
  list: any

  /**
   * A matrix container for tabular input layouts.
   */
  matrix: any

  /**
   * A group container.
   */
  group: any

  /**
   * A transparent input container forwarding registration to its parent while
   * tracking opted-in descendants (e.g. addons) that push their errors up.
   */
  input: any
}
```
