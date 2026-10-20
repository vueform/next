```ts
/**
 * Part-keyed binding definitions of the VfField component: the `inputAria`
 * pattern entries it registers via `useBindings`. Zero-argument resolver
 * entries — resolved at each part's consuming site, keys stay static.
 */
interface VfFieldBindings extends FieldBindings, LayoutRegionBindings {
  /**
   * ARIA state for the input control, from the `inputAria` pattern.
   */
  input: InputAriaBag
}
```
