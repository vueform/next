```ts
/**
 * Props for the element layout blueprint that provides layout, labels, and
 * error display.
 */
interface LayoutProps<
  S = LayoutSlots,
  P = LayoutParts,
  C = LayoutClasses,
  TContext = any,
>
  extends BaseComponentProps<S, P, C, TContext>, LoadingProps<TContext> {
  /**
   * Whether to render the element's label tag.
   */
  label?: boolean

  /**
   * Whether to render addons when available.
   */
  addons?: boolean

  /**
   * Whether to render loading icon when available.
   */
  loading?: boolean

  /**
   * Whether to render langauges selector when available.
   */
  languages?: boolean

  /**
   * Whether to hide validation error messages for this element.
   */
  hideErrors?: boolean
}
```
