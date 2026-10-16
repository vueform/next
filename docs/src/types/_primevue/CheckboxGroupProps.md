```ts
/**
 * Generic props interface for the checkbox-group element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseCheckboxGroupProps` instead when no narrowing is needed.
 *
 * PrimeVue option prop names (`options` / `optionValue` /
 * `optionGroupChildren`) are kept via `OptionsProps`; generics use the
 * PrimeVue-named `TOptions` / `TOptionValueKey` / `TGroupChildren`.
 */
interface CheckboxGroupProps<
  T extends string = 'checkbox-group',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = CheckboxGroupSlots,
  P = CheckboxGroupParts,
  C = CheckboxGroupClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TOptions,
        TOptionValueKey,
        TGroupChildren,
        true,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    ContainerProps,
    DisabledProps<TContext>,
    OptionsProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn,
      TContext
    >,
    StackedProps,
    InfoProps,
    AlignedProps {}
```
