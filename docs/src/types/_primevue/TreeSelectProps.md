```ts
/**
 * Generic props interface for the tree-select element blueprint, parameterized
 * by the tree-option / selection-mode type arguments. Reach for
 * `LooseTreeSelectProps` instead when no narrowing is needed.
 */
interface TreeSelectProps<
  T extends string = 'tree-select',
  TOptions extends TreeOptionsProp = TreeOptionsProp,
  TSelectionMode extends TreeSelectionModeProp = undefined,
  TModel = any,
  S = TreeSelectSlots,
  P = TreeSelectParts,
  C = TreeSelectClasses,
  TContext = any,
>
  extends
    BaseElementProps<T, S, P, C, TContext>,
    LayoutProps<TContext>,
    ExpressionProps,
    ModelPropsWithDefaultValue<
      TreeSelectModelProp<TOptions, TSelectionMode, TModel>,
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
    TreeOptionsProps<TOptions>,
    /* @vue-ignore */ Omit<
      ATreeSelectProps,
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
      | 'selectionMode'
    > {
  /**
   * Defines the selection mode. Controls the model value shape:
   *
   * - unset / `'single'` / `'multiple'` → `{ [key]?: true }`
   * - `'checkbox'` → `{ [key]?: { checked; partialChecked } }`
   */
  selectionMode?: TSelectionMode | 'single' | 'multiple' | 'checkbox'
}
```
