```ts
/**
 * CSS classes for the VfCol component's structural parts.
 */
interface VfColClasses extends ColClasses {
  /**
   * Resolves CSS classes for the root column element from alignment and header
   * options.
   *
   * @param options Alignment and header values used when computing the root
   *   classes.
   */
  root: (options: {
    align: AlignProp
    valign: ValignProp
    colHeader: boolean
    rowHeader: boolean
  }) => ClassValue
}
```
