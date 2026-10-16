```ts
/**
 * Augmentable public API surface for VfRating.
 *
 * Plugins that add runtime API members should declaration-merge the same
 * members here (or on `RatingExpose` for all rating-based components) so they
 * appear on `ContextOf<'VfRating'>` / `context$` / `defineExpose`.
 */
interface VfRatingExpose extends RatingExpose {}
```
