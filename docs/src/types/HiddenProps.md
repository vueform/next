```ts
/**
 * Props for the hidden element blueprint.
 */
interface HiddenProps<
  T extends string = 'hidden',
  S = HiddenSlots,
  P = HiddenParts,
  C = HiddenClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    ModelPropsWithDefault<any, TContext>,
    Omit<ValidationProps<TContext>, 'hideErrors' | 'showRequired'> {
  /**
   * When true the element stores metadata only and renders nothing to the DOM —
   * not even a hidden input.
   */
  meta?: boolean
}
```
