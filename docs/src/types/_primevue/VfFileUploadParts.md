```ts
/**
 * Structural parts of the VfFileUpload component.
 */
interface VfFileUploadParts extends FileUploadParts {
  /**
   * The wrapper element surrounding the file upload input.
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
