```ts
/**
 * Part-keyed accessibility bindings provided by `makeFileAria`: the input's
 * bags plus the per-file remove control's bag, a function of the file index.
 */
interface FileAriaA11y extends AriaA11y {
  /**
   * The per-file remove control's localized accessible name.
   *
   * @param file The file entry.
   * @param index The file's zero-based index.
   */
  remove: (
    file: FileListItem,
    index: number
  ) => {
    'aria-label': string
  }
}
```
