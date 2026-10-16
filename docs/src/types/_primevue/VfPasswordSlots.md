```ts
/**
 * Slots available in the VfPassword component.
 */
interface VfPasswordSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    PasswordSlots<VfPasswordContext<VfPasswordProps<TTranslate, TLanguages>>>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    TranslateSlots,
    /* @vue-ignore */ ForwardedSlots<
      APasswordSlots,
      (typeof forwards.slots)[number]
    > {}
```
