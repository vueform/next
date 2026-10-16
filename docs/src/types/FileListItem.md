```ts
/**
 * A normalized file entry used for rendering the file list.
 */
interface FileListItem {
  /**
   * The display name of the file.
   */
  name: string

  /**
   * An optional URL to render the name as a link.
   */
  url?: string

  /**
   * Whether the file can be removed from the list.
   */
  removable: boolean

  /**
   * The kind of the original value: `'file'` for `File` instances, `'string'`
   * for plain strings, or `'object'` for `FileObject` entries.
   */
  type: 'file' | 'string' | 'object'

  /**
   * The original raw value from the model (`File`, `string`, or `FileObject`).
   * Available for custom slot rendering.
   */
  raw: FileProp
}
```
