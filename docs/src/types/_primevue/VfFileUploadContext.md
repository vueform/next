```ts
/**
 * Public context for VfFileUpload, optionally parameterized by concrete props
 * (e.g. `VfFileUploadContext<VfFileUploadProps<true>>`).
 *
 * Must be an interface — it sits on the recursive type loop (props → context →
 * api → props) and only a nominal, lazily-resolved interface breaks that cycle
 * (a type alias here degrades the whole registry with TS2456).
 */
interface VfFileUploadContext<
  TProps extends WidenProps<VfFileUploadProps, FileUploadProps> =
    VfFileUploadProps,
> extends DefineElementContext<
  TProps,
  VfFileUploadEmits,
  VfFileUploadSlots,
  VfFileUploadParts,
  VfFileUploadClasses,
  VfFileUploadExpose,
  FileUploadApi<TProps>
> {}
```
