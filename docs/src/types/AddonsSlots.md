```ts
/**
 * Slot definitions for elements that support before/after addons.
 */
interface AddonsSlots {
  /**
   * Slot that replaces the before-addons section.
   *
   * @param scope The addonBefore slot's params.
   */
  addonBefore: (scope: {
    /**
     * The resolved before-addon prop value.
     */
    addonBefore: AddonProp | undefined
  }) => VNode[]

  /**
   * Slot that replaces the after-addons section.
   *
   * @param scope The addonAfter slot's params.
   */
  addonAfter: (scope: {
    /**
     * The resolved after-addon prop value.
     */
    addonAfter: AddonProp | undefined
  }) => VNode[]
}
```
