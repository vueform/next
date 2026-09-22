```ts
/**
 * Structural parts of the VfFileUpload component.
 */
interface VfFileUploadParts extends FileUploadParts {
  /**
   * @write
   */
  wrapper: DomAttrsOf<'div'>

  /**
   * The file upload element.
   *
   * @tag FileUpload
   */
  input: PvFileUploadProps

  /**
   * The upload button.
   *
   * @tag VfButton
   */
  button: PartOf<'VfButton'>
}
```
