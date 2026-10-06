```ts
/**
 * Generic props interface for the cascade-select element blueprint,
 * parameterized by the option-driving type arguments. Reach for
 * `LooseCascadeSelectProps` instead when no narrowing is needed.
 */
interface CascadeSelectProps<
  T extends string = 'cascade-select',
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends CascadeOptionGroupChildrenProp = undefined,
  TModel = any,
  TOptionValueReturn = unknown,
  S = CascadeSelectSlots,
  P = CascadeSelectParts,
  C = CascadeSelectClasses,
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
        false,
        TModel,
        TOptionValueReturn
      >,
      TContext
    >,
    ValidationProps<TContext>,
    AddonsProps<TContext>,
    IconsProps<TContext>,
    AddonableProps,
    AriaProps,
    DisabledProps<TContext>,
    LoadingProps<TContext>,
    PlaceholderProps<TContext>,
    FloatLabelProps,
    IftaLabelProps,
    InfoProps,
    /* @vue-ignore */ OptionsGenericsBrand<
      TOptions,
      TOptionValueKey,
      TGroupChildren,
      TOptionValueReturn
    >,
    Omit<
      OptionsProps<
        TOptions,
        TOptionValueKey,
        any,
        TOptionValueReturn,
        TContext
      >,
      'optionGroupChildren'
    >,
    /* @vue-ignore */ Omit<
      ACascadeSelectProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'loading'
      | 'options'
      | 'optionLabel'
      | 'optionValue'
      | 'optionDisabled'
      | 'optionGroupLabel'
      | 'optionGroupChildren'
    > {
  /**
   * Resolves nested children for each cascade level. Accepts a string key, a
   * nested path array (e.g. `['states', 'cities']`), or a mapper function.
   *
   * The intersection arm infers keys into `TGroupChildren` while rejecting keys
   * missing from the group shape (the generic itself is only bounded by the
   * simple `CascadeOptionGroupChildrenProp`). The bare
   * `AllowedCascadeOptionGroupChildren` arm keeps keys assignable on the
   * defaulted schema surface where `TGroupChildren` is still `undefined`.
   */
  optionGroupChildren?: AllowsOptionKeyProps<TOptions> extends true
    ?
        | (TGroupChildren & AllowedCascadeOptionGroupChildren<TOptions>)
        | AllowedCascadeOptionGroupChildren<TOptions>
    : never
}
```
