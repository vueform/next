```ts
/**
 * Slots available in the VfInputText component.
 */
interface VfInputTextSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    InputTextSlots<
      VfInputTextContext<VfInputTextProps<TTranslate, TLanguages>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}
```
