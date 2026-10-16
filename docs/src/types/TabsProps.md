```ts
/**
 * Props for the tabs component blueprint.
 */
interface TabsProps<
  S = TabbedSlots,
  P = TabbedParts,
  C = TabsClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The pager instance managing tab navigation.
   */
  pager: Pager
}
```
