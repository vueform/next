```ts
/**
 * Styling modifiers of the VfRating component.
 */
interface VfRatingModifiers extends RatingModifiers {
  /**
   * The root element's label-alignment marker, set while the element renders
   * without help text.
   */
  root: {
    'data-align-label'?: ''
  }

  /**
   * The rating control's validation state.
   */
  input: {
    'data-invalid'?: ''
  }
}
```
