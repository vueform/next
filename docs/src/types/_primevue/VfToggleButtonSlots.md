```ts
/**
 * Slots available in the VfToggleButton component.
 */
interface VfToggleButtonSlots
  extends
    ToggleButtonSlots<VfToggleButtonContext>,
    /* @vue-ignore */ ForwardedSlots<
      AToggleButtonSlots,
      (typeof forwards.slots)[number]
    > {}
```
