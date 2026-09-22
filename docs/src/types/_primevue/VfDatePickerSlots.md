```ts
/**
 * Slots available in the VfDatePicker component.
 */
interface VfDatePickerSlots<
  TSelectionMode extends DatePickerSelectionModeProp =
    DatePickerSelectionModeProp,
>
  extends
    DatePickerSlots<VfDatePickerContext<VfDatePickerProps<TSelectionMode>>>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ ForwardedSlots<
      ADatePickerSlots,
      (typeof forwards.slots)[number]
    > {}
```
