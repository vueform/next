```ts
/**
 * Props for elements that support before/after addon slots.
 */
interface AddonsProps<TContext = any> {
  /**
   * Content or schema rendered as addons before the input.
   */
  addonBefore?: AddonProp<TContext>

  /**
   * Content or schema rendered as addons after the input.
   */
  addonAfter?: AddonProp<TContext>
}
```
