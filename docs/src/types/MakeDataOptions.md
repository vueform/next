```ts
/**
 * Configuration for the data factory that wraps useData with the standard
 * factory props/deps/events pattern.
 *
 * The generic parameter narrows the options based on the factory config:
 *
 * - `{ repeatable: true }` makes `rows` required in deps.
 * - `{ translatable: true }` makes `translate` required in props.
 */
type MakeDataOptions<C extends MakeDataConfig = {}> = {
  props: {
    name: ElementName

    /**
     * The `v-model` value of the element.
     */
    modelValue: any

    hoist: boolean | undefined
    maxErrors: number | undefined
    ruleMessages: RuleMessagesProp | undefined

    submit: boolean | undefined

    /**
     * Whether the element holds sensitive data, excluded from locally stored
     * drafts.
     */
    sensitive?: boolean

    /**
     * Validation rules to apply to the input.
     */
    rules: RulesProp | TRulesProp | undefined

    /**
     * The default value of the element.
     */
    default?: any

    /**
     * Whether the container nests its data under its own key in the form model.
     */
    nested?: boolean

    /**
     * The value used when a boolean style input is "checked".
     */
    trueValue?: any

    /**
     * The value used when a boolean style input is "unchecked".
     */
    falseValue?: any

    /**
     * Whether the element allows picking multiple items (eg. multiselect,
     * multiple files).
     */
    multiple?: Booleanish

    languages?: LanguagesProp | undefined
    nullValue?: any

    string?: boolean

    /**
     * Transforms the element's value when submitting the form.
     *
     * @param value The raw value being submitted.
     * @param context$ The element's component context.
     */
    transformPayload: ((value: any, context$: any) => any) | undefined
  }

  deps: ReturnsOf<
    [
      [
        typeof makeElement,
        ['container', 'available', 'path', 'children', 'id'],
      ],
    ],
    [[typeof makeInteraction, ['touched']]] & {
      nullValue?: Ref<any>
    }
  > &
    (C extends { repeatable: true }
      ? {
          rows: Ref<any[] | number>
        }
      : {}) &
    (C extends { translatable: true }
      ? ReturnsOf<
          [
            [
              typeof makeMultilingual,
              ['language', 'languages', 'translatable', 'languageId'],
            ],
          ]
        >
      : {})

  events: FeatureEvents<{
    reset: [context$: any]
    clear: [context$: any]
    load: [value: any, context$: any]
    change: [newValue: any, oldValue: any, context$: any]
    'update:modelValue': [value: any]
    valid: [context$: any]
    invalid: [context$: any]
  }>
}
```
