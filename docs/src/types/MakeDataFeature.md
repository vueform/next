```ts
/**
 * Overloaded factory type for makeData. The overload order ensures:
 *
 * - Call sites match the most specific overload (narrowed return type)
 * - `FeatureReturn<typeof makeData>` picks the last overload (full return)
 *
 * Each overload returns a prop-generic inner function (like `makeItems`), so
 * model fields follow the blueprint's concrete `modelValue` type.
 */
interface MakeDataFeature {
  /**
   * Requires `rows` in deps, excludes translatable keys from the return type.
   *
   * @param config Config with `repeatable` set.
   */
  (config: {
    repeatable: true
  }): <P extends MakeDataOptions<{ repeatable: true }>['props']>(
    options: FeatureContext<
      P,
      MakeDataOptions<{ repeatable: true }>['deps'],
      MakeDataOptions<{ repeatable: true }>['events']
    >
  ) => MakeDataReturnRepeatable<P>

  /**
   * Requires `translate` in props, excludes repeatable keys from the return
   * type.
   *
   * @param config Config with `translatable` set.
   */
  (config: {
    translatable: true
  }): <P extends MakeDataOptions<{ translatable: true }>['props']>(
    options: FeatureContext<
      P,
      MakeDataOptions<{ translatable: true }>['deps'],
      MakeDataOptions<{ translatable: true }>['events']
    >
  ) => MakeDataReturnTranslatable<P>

  /**
   * Accepts optional cast config, returns the full type excluding repeatable
   * and translatable keys.
   *
   * @param config Optional config with `cast` set.
   */
  (config?: {
    cast?: CastOption
  }): <P extends MakeDataOptions['props']>(
    options: FeatureContext<
      P,
      MakeDataOptions['deps'],
      MakeDataOptions['events']
    >
  ) => MakeDataReturn<P>
}
```
