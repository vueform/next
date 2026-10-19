```ts
/**
 * Slot definitions for elements that support before/after icons.
 */
interface IconsSlots {
  /**
   * Slot that replaces the icon rendered before the input.
   *
   * @param scope The icon-before slot's params.
   */
  'icon-before': (scope: {
    /**
     * The resolved icon class string.
     */
    iconBefore: string | undefined
  }) => VNode[]

  /**
   * Slot that replaces the icon rendered after the input.
   *
   * @param scope The icon-after slot's params.
   */
  'icon-after': (scope: {
    /**
     * The resolved icon class string.
     */
    iconAfter: string | undefined
  }) => VNode[]
}
```
