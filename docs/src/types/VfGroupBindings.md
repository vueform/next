```ts
/**
 * Part-keyed binding definitions of the VfGroup component. Zero-argument
 * resolver entries — resolved at each part's consuming site, keys stay
 * static.
 */
interface VfGroupBindings extends GroupBindings {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text, and the wrap marker applying the wrapped visual
   * treatment to the group itself.
   */
  root: {
    'data-align-label'?: ''
    'data-wrapped'?: ''
  }

  /**
   * The wrapper element's stacked layout marker and the wrap marker applying
   * the wrapped visual treatment to the group's children.
   */
  wrapper: {
    'data-stacked'?: ''
    'data-wrapped'?: ''
  }
}
```
