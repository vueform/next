```ts
/**
 * Events emitted by the file element.
 */
interface FileEmits<TContext = any>
  extends
    BaseElementEmits<TContext>,
    ModelEmits<FileModel, TContext>,
    ValidationEmits<TContext>,
    InteractionEmits<TContext>,
    InputEmits<FileModel, TContext> {
  /**
   * Emitted for each newly added file. In multi mode fires once per file.
   *
   * @param file The newly added file.
   * @param context$ The component context.
   */
  add: [file: File, context$: TContext]

  /**
   * Emitted when a file is removed from the list.
   *
   * @param value The raw model value of the removed item.
   * @param context$ The component context.
   */
  remove: [value: File | string | FileObject, context$: TContext]
}
```
