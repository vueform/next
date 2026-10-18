```ts
/**
 * Styling modifiers of the VfGroup component.
 */
interface VfGroupModifiers extends GroupModifiers {
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
