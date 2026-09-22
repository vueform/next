```ts
/**
 * Events emitted by the VfFile component, parameterized by the model-driving
 * type argument so event handlers (e.g. `@change`) receive the narrowed context
 * — same pattern as `VfFileSlots`. Plain usage (`VfFileEmits`) keeps the
 * context wide.
 */
interface VfFileEmits<TMultiple extends boolean = boolean> extends FileEmits<
  VfFileContext<VfFileProps<TMultiple>>
> {}
```
