```ts
/**
 * Slots available in the VfRating component.
 */
interface VfRatingSlots
  extends
    RatingSlots<VfRatingContext>,
    /* @vue-ignore */ ForwardedSlots<
      ARatingSlots,
      (typeof forwards.slots)[number]
    > {}
```
