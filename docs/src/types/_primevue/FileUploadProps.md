```ts
/**
 * Props for the file-upload element blueprint, parameterized by the
 * model-driving type argument (`multiple`). Plain usage (`FileUploadProps`)
 * keeps every member wide, so no separate plain-props alias is needed.
 *
 * - `multiple: false` — model is `File | null`
 * - `multiple: true` — model is `File[]`
 */
interface FileUploadProps<
  T extends string = 'file-upload',
  TMultiple extends boolean = boolean,
  S = FileUploadSlots,
  P = FileUploadParts,
  C = FileUploadClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefaultValue<FileModelProp<TMultiple>, TContext>,
    ValidationProps<TContext>,
    DisabledProps<TContext>,
    MultipleProps<TMultiple>,
    InfoProps,
    PlaceholderProps<TContext>,
    Pick<AFileUploadProps, 'mode' | 'showUploadButton'>,
    /* @vue-ignore */ Omit<
      AFileUploadProps,
      | 'name'
      | 'disabled'
      | 'multiple'
      | 'style'
      | 'class'
      | 'url'
      | 'accept'
      | 'maxFileSize'
      | 'fileLimit'
      | 'mode'
      | 'showUploadButton'
    > {
  /**
   * **This replaces the original PrimeVue `url` prop.** Remote url to upload
   * the files. Supports dynamic text props.
   *
   * @replaces url
   */
  url?: DProp<string, TContext>

  /**
   * **This replaces the original PrimeVue `accept` prop.** Pattern to restrict
   * the allowed file types such as `'image/*'`. Supports dynamic text props.
   *
   * @replaces accept
   */
  accept?: DProp<string, TContext>

  /**
   * **This replaces the original PrimeVue `maxFileSize` prop.** Maximum file
   * size allowed in bytes. Supports dynamic text props.
   *
   * @replaces maxFileSize
   */
  maxFileSize?: DProp<number, TContext>

  /**
   * **This replaces the original PrimeVue `fileLimit` prop.** Maximum number of
   * files that can be uploaded. Supports dynamic text props.
   *
   * @replaces fileLimit
   */
  fileLimit?: DProp<number, TContext>
}
```
