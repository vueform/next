```ts
/**
 * Slots available in the VfInputNumber component.
 */
interface VfInputNumberSlots
  extends
    InputNumberSlots<VfInputNumberContext>,
    FloatLabelSlots,
    IftaSlots,
    AddonsSlots,
    IconsSlots,
    /* @vue-ignore */ ForwardedSlots<
      AInputNumberSlots,
      (typeof forwards.slots)[number]
    > {}
```
