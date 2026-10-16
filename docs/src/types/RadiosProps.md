```ts
/**
 * Generic props interface for the radios element blueprint, parameterized by
 * the item-driving type arguments. Reach for `LooseRadiosProps` instead when no
 * narrowing is needed.
 */
interface RadiosProps<
  T extends string = 'radios',
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
  S = RadiosSlots,
  P = RadiosParts,
  C = RadiosClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefault<
      ItemsModelProp<
        TItems,
        TItemValueKey,
        TGroupChildren,
        false,
        TModel,
        TItemValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    ContainerProps,
    DisabledProps<TContext>,
    ItemsProps<
      TItems,
      TItemValueKey,
      TGroupChildren,
      TItemValueReturn,
      TContext
    >,
    StackedProps,
    AlignedProps {}
```
