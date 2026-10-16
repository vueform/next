```ts
/**
 * Props for the button element blueprint.
 *
 * Non-generic counterpart — no item-driving type parameters. The plain props
 * type and the props interface are the same shape.
 */
interface ButtonProps<
  T extends string = 'button',
  S = ButtonSlots,
  P = ButtonParts,
  C = ButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    BtnProps {
  /**
   * The visual variant of the button.
   */
  variant?: 'filled' | 'outlined' | 'text' | 'link'

  /**
   * The color severity of the button.
   */
  severity?: DProp<
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast',
    TContext
  >

  /**
   * The size of the button.
   */
  size?: 'medium' | 'small'
}
```
