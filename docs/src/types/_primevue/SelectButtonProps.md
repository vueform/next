```ts
/**
 * Generic props interface for the select-button element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseSelectButtonProps` instead when no narrowing is needed. Groups are not
 * supported — `optionGroup*` props are omitted.
 */
interface SelectButtonProps<
  T extends string = 'select-button',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
  S = SelectButtonSlots,
  P = SelectButtonParts,
  C = SelectButtonClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TOptions,
        TOptionValueKey,
        undefined,
        TMultiple,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    AddonableProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    MultipleProps<TMultiple>,
    InfoProps,
    Omit<
      OptionsProps<
        TOptions,
        TOptionValueKey,
        undefined,
        TOptionValueReturn,
        TContext
      >,
      'optionGroupLabel' | 'optionGroupChildren' | 'optionGroupConditions'
    >,
    /* @vue-ignore */ Omit<
      ASelectButtonProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'multiple'
      | 'options'
      | 'optionLabel'
      | 'optionValue'
      | 'optionDisabled'
    > {}
```
