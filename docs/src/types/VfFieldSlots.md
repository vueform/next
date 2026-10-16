```ts
/**
 * Slots available in the VfField component.
 */
interface VfFieldSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
  TNullValue = any,
>
  extends
    FieldSlots<
      VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
    >,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {
  /**
   * Default slot where the user renders their 3rd party component. Receives the
   * full component context.
   *
   * @param scope The default slot's params.
   */
  default: (scope: {
    /**
     * The component's context.
     */
    context: VfFieldContext<VfFieldProps<TTranslate, TLanguages, TNullValue>>
  }) => VNode[]
}
```
