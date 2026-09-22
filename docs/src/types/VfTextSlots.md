```ts
/**
 * Slots available in the VfText component.
 */
interface VfTextSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextSlots<VfTextContext<VfTextProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}
```
