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
   * @param scope The toolbar slot's params.
   */
  toolbar: (scope: {
    /**
     * Available language labels keyed by locale code.
     */
    languages: Record<string, string>

    /**
     * The currently active language code.
     */
    language: string
  }) => VNode[]
}
```
