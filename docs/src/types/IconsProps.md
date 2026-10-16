```ts
/**
 * Props for elements that support before/after icon slots.
 */
interface IconsProps<TContext = any> {
  /**
   * Icon displayed before the input.
   */
  iconBefore?: DProp<string, TContext>

  /**
   * Icon displayed after the input.
   */
  iconAfter?: DProp<string, TContext>
}
```
