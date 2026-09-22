```ts
/**
 * Slot definitions for elements that support before/after icons.
 */
interface IconsSlots {
  /**
   * Slot that replaces the icon rendered before the input.
   *
   * @param props.iconBefore The resolved icon class string.
   */
  iconBefore: (props: { iconBefore: string | undefined }) => VNode[]

  /**
   * Slot that replaces the icon rendered after the input.
   *
   * @param props.iconAfter The resolved icon class string.
   */
  iconAfter: (props: { iconAfter: string | undefined }) => VNode[]
}
```
