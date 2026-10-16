```ts
/**
 * Generic props interface for the listbox element blueprint, parameterized by
 * the option-driving type arguments. Reach for `LooseListboxProps` instead when
 * no narrowing is needed.
 */
interface ListboxProps<
  T extends string = 'listbox',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TMultiple extends boolean = false,
  TModel = any,
  TOptionValueReturn = unknown,
  S = ListboxSlots,
  P = ListboxParts,
  C = ListboxClasses,
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
        TGroupChildren,
        TMultiple,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    AriaProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    MultipleProps<TMultiple>,
    InfoProps,
    OptionsProps<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn,
      TContext
    >,
    /* @vue-ignore */ Omit<
      AListboxProps,
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
      | 'optionGroupLabel'
      | 'optionGroupChildren'
    > {}
```
