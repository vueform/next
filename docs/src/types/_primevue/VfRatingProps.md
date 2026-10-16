```ts
/**
 * Props for the VfRating component.
 *
 * Non-generic — there is no plain-props split because nothing is
 * item-parameterized. The interface itself is the props type.
 *
 * The `part:*` / `class:*` / `reclass:*` shorthand attrs come from the
 * declaration merge on this interface in `unstyled.ts` / `styled.ts`.
 */
interface VfRatingProps extends RatingProps<
  'rating',
  VfRatingSlots,
  VfRatingParts,
  VfRatingClasses,
  VfRatingContext
> {}
```
