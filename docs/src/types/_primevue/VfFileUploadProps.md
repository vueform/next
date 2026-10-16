```ts
/**
 * Generic props interface for the VfFileUpload component, parameterized by the
 * model-driving type argument (e.g. `VfFileUploadProps<true>`). Reach for
 * `VfFileUploadProps` instead when no narrowing is needed.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfFileUploadProps<
  TMultiple extends boolean = boolean,
> extends FileUploadProps<
  'file-upload',
  TMultiple,
  VfFileUploadSlots<TMultiple>,
  VfFileUploadParts,
  VfFileUploadClasses,
  VfFileUploadContext<VfFileUploadProps<TMultiple>>
> {}
```
