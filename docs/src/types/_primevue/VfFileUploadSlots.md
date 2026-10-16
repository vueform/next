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
   * @param scope The button slot's params.
   */
  button: (scope: {
    /**
     * The upload handler function.
     */
    upload: () => void
  }) => VNode[]
}
```
