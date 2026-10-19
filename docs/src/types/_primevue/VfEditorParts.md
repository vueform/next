```ts
/**
 * Structural parts of the VfEditor component.
 */
interface VfEditorParts extends EditorParts {
  /**
   * The editor element.
   *
   * @tag Editor
   */
  input: PvEditorProps

  /**
   * The loading-skeleton placeholder shown until the editor module loads.
   *
   * @tag div
   */
  placeholder: DomAttrsOf<'div'>

  /**
   * The loading-skeleton toolbar area.
   *
   * @tag div
   */
  placeholderToolbar: DomAttrsOf<'div'>

  /**
   * The loading-skeleton content area.
   *
   * @tag div
   */
  placeholderContent: DomAttrsOf<'div'>
}
```
