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
    /**
     * The column's horizontal alignment.
     */
    align: AlignProp

    /**
     * The column's vertical alignment.
     */
    valign: ValignProp

    /**
     * Whether the column is a column header.
     */
    colHeader: boolean

    /**
     * Whether the column is a row header.
     */
    rowHeader: boolean
  }) => ClassValue
}
```
