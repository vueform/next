```ts
/**
 * Generic props interface for the auto-complete element blueprint,
 * parameterized by the suggestion-driving type arguments. Reach for
 * `LooseAutoCompleteProps` instead when no narrowing is needed. There is no
 * `optionValue` — the model is the suggestion item itself.
 */
interface AutoCompleteProps<
  T extends string = 'auto-complete',
  TSuggestions extends SuggestionsProp = SuggestionsProp,
  TMultiple extends boolean = false,
  TModel = any,
  S = AutoCompleteSlots,
  P = AutoCompleteParts,
  C = AutoCompleteClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      OptionsModelProp<
        TSuggestions,
        undefined,
        undefined,
        TMultiple,
        TModel,
        unknown
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
    MultipleProps<TMultiple>,
    SuggestionsProps<TSuggestions, TContext>,
    /* @vue-ignore */ Omit<
      AAutoCompleteProps,
      | 'modelValue'
      | 'defaultValue'
      | 'name'
      | 'invalid'
      | 'fluid'
      | 'formControl'
      | 'disabled'
      | 'placeholder'
      | 'loading'
      | 'multiple'
      | 'suggestions'
      | 'optionLabel'
      | 'optionDisabled'
      | 'minLength'
    >,
    Pick<AAutoCompleteProps, 'minLength'> {}
```
