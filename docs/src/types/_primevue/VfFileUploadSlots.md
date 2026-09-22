```ts
/**
 * Slots available in the VfFileUpload component.
 */
interface VfFileUploadSlots<TMultiple extends boolean = boolean>
  extends
    FileUploadSlots<VfFileUploadContext<VfFileUploadProps<TMultiple>>>,
    /* @vue-ignore */ ForwardedSlots<
      AFileUploadSlots,
      (typeof forwards.slots)[number]
    > {
  /**
   * Slot that replaces the upload button. Receives the upload handler.
   *
   * @param props.upload The upload handler function.
   */
  button: (props: { upload: () => void }) => VNode[]
}
```
