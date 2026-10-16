```ts
/**
 * Props for the steps component blueprint.
 */
interface StepsProps<
  S = StepsSlots,
  P = StepsParts,
  C = StepsClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The pager instance managing multi-step form navigation.
   */
  pager: Pager
}
```
