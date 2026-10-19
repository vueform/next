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

    /**
     * The upload button's resolved bindings (classes, part overrides); apply
     * with `v-bind`.
     */
    bindings: PartBindings<
      'button',
      VfFileUploadParts,
      VfFileUploadModifiers,
      VfFileUploadA11y
    >
  }) => VNode[]
}
```
