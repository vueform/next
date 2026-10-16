```ts
/**
 * Props for PrimeVue options-based elements (`options` / `option*` naming).
 *
 * Same generics and inference rules as core `ItemsProps`, with PrimeVue prop
 * names. Model typing uses `OptionsModel` / `OptionsModelProp`.
 *
 * `optionValue` is split across two generics so Vue can contextually type the
 * mapper's `option` argument from `options` while still inferring the return
 * type into the model:
 *
 * - `TOptionValueKey` — string property key
 * - `TOptionValueReturn` — mapper return type (defaults to `unknown` = unset)
 */
interface OptionsProps<
  TOptions extends OptionsProp = OptionsProp,
  TOptionValueKey extends OptionValueProp = undefined,
  TGroupChildren extends OptionGroupChildrenProp = undefined,
  TOptionValueReturn = unknown,
  TContext = any,
> {
  /**
   * The option items for the element.
   */
  options?: MaybeRef<TOptions>

  /**
   * Resolves the label for an option. A string key for property lookup, or a
   * function returning the label string. Not allowed for plain scalar arrays or
   * plain object/record maps.
   */
  optionLabel?: OptionKeyProp<TOptions, TGroupChildren, string>

  /**
   * Resolves the value for an option. A string key for property lookup, or a
   * function returning the value. Not allowed for plain scalar arrays or plain
   * object/record maps.
   *
   * Typed as `(TOptionValueKey & AllowedOptionValueKey) | AllowedOptionValueKey
   *
   * | ((option) => TOptionValueReturn)` so:
   *
   * - string keys infer into `TOptionValueKey` through the intersection, which
   *   also rejects keys missing from the option shape (the generic itself is
   *   only bounded by the simple `OptionValueProp`, so validation must happen
   *   here)
   * - keys remain assignable on the defaulted `ElementSchema` / `FormSchema`
   *   surface where `TOptionValueKey` is still `undefined`
   * - mapper return types infer into `TOptionValueReturn`
   * - the `option` parameter stays concrete and is contextually typed even for
   *   bare inline arrows (whose return type cannot drive generics under Vue's
   *   single-pass inference — annotate the param or use a named function for
   *   full model inference)
   */
  optionValue?: AllowsOptionKeyProps<TOptions> extends true
    ?
        | (TOptionValueKey & AllowedOptionValueKey<TOptions, TGroupChildren>)
        | AllowedOptionValueKey<TOptions, TGroupChildren>
        | ((
            option: RawOptionOf<TOptions, TGroupChildren>
          ) => TOptionValueReturn)
    : never

  /**
   * Determines whether an option is disabled. A string key for property lookup,
   * or a function returning a `ConditionalProp`. Not allowed for plain scalar
   * arrays or plain object/record maps.
   */
  optionDisabled?: OptionKeyProp<
    TOptions,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Determines whether an option is available. A string key for property
   * lookup, or a function returning a `ConditionalProp`. Options whose
   * conditions are not met are omitted from the list. Not allowed for plain
   * scalar arrays or plain object/record maps.
   */
  optionConditions?: OptionKeyProp<
    TOptions,
    TGroupChildren,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Resolves the label for an option group. A string key for property lookup on
   * the group object, or a function returning the label string. Not allowed for
   * plain scalar arrays or plain object/record maps.
   */
  optionGroupLabel?: OptionGroupKeyProp<TOptions, string>

  /**
   * Resolves the children items for an option group. A string key for property
   * lookup on the group object, or a function returning a children array. Not
   * allowed for plain scalar arrays or plain object/record maps.
   *
   * Mapper returns are restricted to arrays to match PrimeVue's
   * `optionGroupChildren` prop.
   *
   * The intersection arm infers keys into `TGroupChildren` while rejecting keys
   * missing from the group shape (the generic itself is only bounded by the
   * simple `OptionGroupChildrenProp`). The bare `AllowedOptionGroupChildren`
   * arm keeps keys assignable on the defaulted schema surface where
   * `TGroupChildren` is still `undefined`.
   */
  optionGroupChildren?: AllowsOptionKeyProps<TOptions> extends true
    ?
        | (TGroupChildren & AllowedOptionGroupChildren<TOptions>)
        | AllowedOptionGroupChildren<TOptions>
    : never

  /**
   * Determines whether an option group is available. A string key for property
   * lookup on the group object, or a function returning a `ConditionalProp`.
   * Groups whose conditions are not met are omitted entirely. Not allowed for
   * plain scalar arrays or plain object/record maps.
   */
  optionGroupConditions?: OptionGroupKeyProp<
    TOptions,
    ConditionalProp<TContext> | undefined
  >

  /**
   * Custom HTTP headers to include when loading options from an endpoint.
   */
  headers?: Record<string, string>

  /**
   * The HTTP method to use when loading options from an endpoint. Defaults to
   * `'GET'`.
   */
  method?: string

  /**
   * The source that triggers re-resolution of function-based options. Accepts
   * an array of element paths whose values are watched, a `Ref`, or a function
   * used as a watch getter. When omitted, function-based options are only
   * re-resolved when the `options` prop reference itself changes.
   */
  optionsTrigger?: ConditionsTriggerProp

  /**
   * The debounce delay in milliseconds applied before re-resolving
   * function-based options when the `optionsTrigger` source changes. Defaults
   * to no debounce (immediate re-resolution).
   */
  optionsDebounce?: number

  /**
   * Transforms data received from an endpoint into the options format. When
   * `options` is a string (endpoint URL), the HTTP response data is passed
   * through this function before normalization.
   *
   * @param data The received from the endpoint.
   */
  transformOptions?: (data: any) => any[] | Record<string, any>
}
```
