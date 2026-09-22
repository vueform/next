```ts
/**
 * Slots available in the VfEditor component.
 */
interface VfEditorSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    EditorSlots<VfEditorContext<VfEditorProps<TTranslate, TLanguages>>>,
    /* @vue-ignore */ ForwardedSlots<
      AEditorSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Custom editor toolbar content.
   *
   * @param props.languages Available language labels keyed by locale code.
   * @param props.language The currently active language code.
   */
  toolbar: (props: {
    languages: Record<string, string>
    language: string
  }) => VNode[]
}
```
