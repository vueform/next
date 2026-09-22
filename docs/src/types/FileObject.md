```ts
/**
 * Describes a previously uploaded file with optional display metadata. All
 * properties are optional to allow custom object shapes — the defaults provide
 * an opinionated structure for the built-in file list rendering.
 */
interface FileObject {
  /**
   * The display name of the file.
   */
  name?: string

  /**
   * A URL to link the file name to.
   */
  url?: string

  /**
   * Whether the file can be removed. Defaults to `true` when omitted.
   */
  remove?: boolean

  [key: string]: unknown
}
```
