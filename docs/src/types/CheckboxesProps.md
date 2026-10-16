```ts
/**
 * Generic props interface for the checkboxes element blueprint, parameterized
 * by the item-driving type arguments. Reach for `LooseCheckboxesProps` instead
 * when no narrowing is needed.
 */
interface CheckboxesProps<
  T extends string = 'checkboxes',
  TItems extends ItemsProp = ItemsProp,
  TItemValueKey extends ItemValueProp = undefined,
  TGroupChildren extends GroupChildrenProp = undefined,
  TModel = any,
  TItemValueReturn = unknown,
  S = CheckboxesSlots,
  P = CheckboxesParts,
  C = CheckboxesClasses,
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
        true,
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
