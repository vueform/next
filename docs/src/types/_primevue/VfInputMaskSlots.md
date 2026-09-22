```ts
/**
 * Slots available in the VfInputMask component.
 */
interface VfInputMaskSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    InputMaskSlots<
      VfInputMaskContext<VfInputMaskProps<TTranslate, TLanguages>>
    >,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}
```
