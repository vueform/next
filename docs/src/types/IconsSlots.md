```ts
/**
 * Slot definitions for elements that support before/after icons.
 */
interface IconsSlots {
  /**
   * Slot that replaces the icon rendered before the input.
   *
   * @param scope The iconBefore slot's params.
   */
  iconBefore: (scope: {
    /**
     * The resolved icon class string.
     */
    iconBefore: string | undefined
  }) => VNode[]

  /**
   * Slot that replaces the icon rendered after the input.
   *
   * @param scope The iconAfter slot's params.
   */
  iconAfter: (scope: {
    /**
     * The resolved icon class string.
     */
    iconAfter: string | undefined
  }) => VNode[]
}
```
