```ts
/**
 * Props for the content element blueprint.
 */
interface ContentProps<
  T extends string = 'content',
  S = ContentSlots,
  P = ContentParts,
  C = ContentClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    AlignedProps {
  /**
   * The text content rendered inside the element.
   */
  content?: TProp<string, TContext>

  /**
   * Horizontal alignment of the element within its layout container.
   */
  align?: AlignProp
}
```
