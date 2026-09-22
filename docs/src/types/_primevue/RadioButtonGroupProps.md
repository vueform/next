```ts
/**
 * Generic props interface for the radio-button-group element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseRadioButtonGroupProps` instead when no narrowing is needed.
 *
 * PrimeVue option prop names (`options` / `optionValue` /
 * `optionGroupChildren`) are kept via `OptionsProps`; generics use the
 * PrimeVue-named `TOptions` / `TOptionValueKey` / `TGroupChildren`.
 */
interface RadioButtonGroupProps<
  T extends string = 'radio-button-group',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = RadioButtonGroupSlots,
  P = RadioButtonGroupParts,
  C = RadioButtonGroupClasses,
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
        false,
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
