```ts
/**
 * Events emitted by the VfFileUpload component, parameterized by the
 * model-driving type argument so event handlers (e.g. `@change`) receive the
 * narrowed context — same pattern as `VfFileUploadSlots`. Plain usage
 * (`VfFileUploadEmits`) keeps the context wide.
 */
interface VfFileUploadEmits<
  TMultiple extends boolean = boolean,
> extends FileUploadEmits<VfFileUploadContext<VfFileUploadProps<TMultiple>>> {}
```
