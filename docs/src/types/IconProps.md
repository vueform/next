```ts
/**
 * Props for the icon component blueprint.
 */
interface IconProps<
  S = IconSlots,
  P = IconParts,
  C = IconClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The icon class string to render.
   */
  icon?: string
}
```
