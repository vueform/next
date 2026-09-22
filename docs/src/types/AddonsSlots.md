```ts
/**
 * Slot definitions for elements that support before/after addons.
 */
interface AddonsSlots {
  /**
   * Slot that replaces the before-addons section.
   *
   * @param props.addonBefore The resolved before-addon prop value.
   */
  addonBefore: (props: { addonBefore: AddonProp | undefined }) => VNode[]

  /**
   * Slot that replaces the after-addons section.
   *
   * @param props.addonAfter The resolved after-addon prop value.
   */
  addonAfter: (props: { addonAfter: AddonProp | undefined }) => VNode[]
}
```
