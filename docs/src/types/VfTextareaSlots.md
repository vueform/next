```ts
/**
 * Slots available in the VfTextarea component.
 */
interface VfTextareaSlots<
  TTranslate extends boolean = boolean,
  TLanguages extends LanguagesProp = LanguagesProp,
>
  extends
    TextareaSlots<VfTextareaContext<VfTextareaProps<TTranslate, TLanguages>>>,
    AddonsSlots,
    IconsSlots,
    TranslateSlots {}
```
