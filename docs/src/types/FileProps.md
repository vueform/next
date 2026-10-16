```ts
/**
 * Props for the file element blueprint, parameterized by the model-driving type
 * argument (`multiple`). Plain usage (`FileProps`) keeps every member wide, so
 * no separate plain-props alias is needed.
 *
 * - `multiple: false` — model is `File | null`
 * - `multiple: true` — model is `File[]`
 */
interface FileProps<
  T extends string = 'file',
  TMultiple extends boolean = boolean,
  S = FileSlots,
  P = FileParts,
  C = FileClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefault<FileModelProp<TMultiple>, TContext>,
    ValidationProps<TContext>,
    AriaProps,
    DisabledProps<TContext>,
    MultipleProps<TMultiple> {
  /**
   * Whether pre-existing (non-File) items can be removed. Defaults to `true`.
   * Newly added files are always removable regardless of this setting.
   */
  remove?: boolean

  /**
   * Whether the file select button should be displayed.
   */
  add?: boolean

  /**
   * The accepted file types (e.g. `image/*`, `.pdf,.docx`).
   */
  accept?: string

  /**
   * The capture attribute for mobile device camera/microphone access (e.g.
   * `user`, `environment`).
   */
  capture?: 'user' | 'environment' | boolean

  /**
   * The label text displayed on the file selection button.
   */
  text?: TProp<string, TContext>

  /**
   * The icon identifier for the add button.
   */
  addIcon?: DProp<string, TContext>

  /**
   * The icon identifier for the remove button.
   */
  removeIcon?: DProp<string, TContext>
}
```
