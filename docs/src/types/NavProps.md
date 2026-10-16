```ts
/**
 * Props for the nav component blueprint that renders back/next/finish
 * navigation buttons.
 */
interface NavProps<
  S = NavSlots,
  P = NavParts,
  C = NavClasses,
  TContext = any,
> extends BaseComponentProps<S, P, C, TContext> {
  /**
   * The pager instance managing step/tab navigation state.
   */
  pager: Pager

  /**
   * The label text for the "back" navigation button.
   */
  back?: TProp<string, TContext>

  /**
   * The label text for the "next" navigation button.
   */
  next?: TProp<string, TContext>

  /**
   * The label text for the "finish" navigation button.
   */
  finish?: TProp<string, TContext>

  /**
   * Whether to hide the "back" navigation button.
   */
  hideBack?: boolean

  /**
   * The alignment of the navigation buttons: `'left'`, `'center'`, `'right'`,
   * `'fluid'` (stretched to full width), or `'auto'`.
   */
  position?: NavPosProp
}
```
