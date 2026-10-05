import type { RulesProp, TRulesProp } from '#core/modules/validation'
import type {
  Booleanish,
  ElementName,
  LanguagesProp,
  ReturnsOf,
  RuleMessagesProp,
} from '#core/types'
import type { Ref, WritableComputedRef } from 'vue'
import { useData, type CastOption } from '#core/composables'
import {
  type makeElement,
  type makeInteraction,
  type makeMultilingual,
} from '#core/features'
import {
  defineFeature,
  type FeatureContext,
  type FeatureEvents,
} from '#core/helpers'
import { pickRefs } from '#core/utils'

/**
 * Keys returned by useData only when the element is a dynamic list (has the
 * `rows` option).
 */
type UseDataRepeatableKeys =
  | 'items'
  | 'dragIndex'
  | 'dropIndex'
  | 'add'
  | 'remove'
  | 'sort'

/**
 * Keys returned by useData only when the element supports translation (has the
 * `translate` option).
 */
type UseDataTranslatableKeys =
  | 'currentValidation'
  | 'invalidLanguages'
  | 'validateCurrent'

/**
 * The full return type of useData, including all conditional groups.
 */
type UseDataReturn = ReturnType<typeof useData>

/**
 * The non-generic slice of the `useData` return shared by every default
 * `makeData` instantiation (model fields and conditional groups excluded).
 *
 * Hoisted to a module-level alias — unlike the generic-parameter `Base` of the
 * previous `MakeDataReturn<P, Base>` shape — so the heavy `Omit` over
 * `UseDataReturn` is computed and cached once instead of being re-derived per
 * prop instantiation. Only the small `MakeDataModelApi<P>` slice varies with
 * `P` (same structure `MakeItemsReturn<P>` uses).
 */
type MakeDataBase = Omit<
  UseDataReturn,
  UseDataRepeatableKeys | UseDataTranslatableKeys | keyof MakeDataModelApi
>

/**
 * `MakeDataBase` counterpart for repeatable elements (keeps list keys, drops
 * translatable keys).
 */
type MakeDataRepeatableBase = Omit<
  UseDataReturn,
  UseDataTranslatableKeys | keyof MakeDataModelApi
> &
  Required<Pick<UseDataReturn, UseDataRepeatableKeys>>

/**
 * `MakeDataBase` counterpart for translatable elements (keeps translate keys,
 * drops list keys).
 */
type MakeDataTranslatableBase = Omit<
  UseDataReturn,
  UseDataRepeatableKeys | keyof MakeDataModelApi
> &
  Required<Pick<UseDataReturn, UseDataTranslatableKeys>>

/**
 * `Required`, guarded for model types that mapped types can't process
 * member-wise: `null` / `undefined` and arrays pass through, and so does a
 * model whose `keyof` collapsed to `never` — the `NoInfer`-wrapped wide model
 * union, which blocks both mapped-type and conditional-type distribution and
 * would otherwise become `{}`.
 */
type RequiredModelOf<M> = M extends null | undefined
  ? M
  : M extends readonly any[]
    ? M
    : [keyof M] extends [never]
      ? M
      : Required<M>

/**
 * Config flags for makeData controlling which optional return-type groups are
 * excluded. By default (no config), all groups are included.
 */
type MakeDataConfig = {
  /**
   * When `true`, repeatable-only keys (`items`, `dragIndex`, `dropIndex`,
   * `add`, `remove`, `sort`) are excluded from the return type.
   */
  repeatable?: true

  /**
   * When `true`, translatable-only keys (`currentValidation`,
   * `invalidLanguages`, `validateCurrent`) are excluded from the return type.
   */
  translatable?: true

  /**
   * When set, the model value is cast to the specified type before being stored
   * or read. Values that are `null` or `undefined` are not cast.
   */
  cast?: CastOption
}

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

/**
 * Configuration for the data factory that wraps useData with the standard
 * factory props/deps/events pattern.
 *
 * The generic parameter narrows the options based on the factory config:
 *
 * - `{ repeatable: true }` makes `rows` required in deps.
 * - `{ translatable: true }` makes `translate` required in props.
 */
export type MakeDataOptions<C extends MakeDataConfig = {}> = {
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
     * autosave drafts.
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

/**
 * Model type carried by data props (`modelValue`).
 *
 * Uses indexed access (not `infer` in a conditional) so unbound blueprint
 * `TProps` resolves through its constraint instead of staying opaque.
 */
export type ModelOfProps<P> = 'modelValue' extends keyof P
  ? Exclude<P['modelValue'], undefined>
  : any

/**
 * The prop-dependent slice of the `makeData` return: model fields and mutators
 * following `P['modelValue']`. Single source of truth for model narrowing —
 * blueprints receive it automatically through `MakeDataReturn<P>` without any
 * per-component overlay.
 */
export type MakeDataModelApi<P = MakeDataOptions['props']> = {
  /**
   * The element's reactive model value within the form data tree.
   */
  model: Ref<ModelOfProps<P>>

  /**
   * A snapshot of the model at initialization time.
   */
  initialModel: Ref<ModelOfProps<P>>

  /**
   * The element's current value.
   */
  value: WritableComputedRef<ModelOfProps<P>>

  /**
   * Updates the element's model value.
   *
   * @param data The new model value.
   */
  update: (data: ModelOfProps<P>) => void

  /**
   * Loads data into the element's model.
   *
   * @param data The value to load.
   */
  load: (data: ModelOfProps<P>) => void
}

/**
 * Prop-dependent return type of `makeData`. Model fields and mutators follow
 * `P['modelValue']` via `MakeDataModelApi`; everything else comes from the
 * cached non-generic base.
 */
export type MakeDataReturn<P = MakeDataOptions['props']> = MakeDataBase &
  MakeDataModelApi<P>

/**
 * Repeatable `makeData` return (keeps list keys, drops translatable keys).
 */
export type MakeDataReturnRepeatable<P = MakeDataOptions['props']> =
  MakeDataRepeatableBase & MakeDataModelApi<P>

/**
 * The prop-dependent slice of the translatable `makeData` return —
 * `MakeDataModelApi` counterpart for translatable elements.
 *
 * The `modelValue` prop may provide a partial locale object (optional keys),
 * but the runtime model always carries every language key — so `model` /
 * `initialModel` are `Required` versions of the prop shape. `update` / `load`
 * follow the `modelValue` prop shape via `MakeDataModelApi`.
 *
 * `TValue` is the type of the element's current value — the active language's
 * entry when translating, the model itself otherwise. It is supplied by each
 * blueprint from its own generics (text/textarea pass their fixed scalar, field
 * derives it from `nullValue`) rather than being dissected out of the model
 * type, which cannot distinguish a locale record from an object-shaped model
 * and collapses entirely on the `NoInfer`-wrapped wide model union.
 */
export type MakeDataModelApiTranslatable<
  P = MakeDataOptions['props'],
  TValue = any,
> = Pick<MakeDataModelApi<P>, 'update' | 'load'> & {
  /**
   * The element's reactive model value within the form data tree. Always
   * contains every language key for translatable elements.
   */
  model: Ref<RequiredModelOf<ModelOfProps<P>>>

  /**
   * A snapshot of the model at initialization time.
   */
  initialModel: Ref<RequiredModelOf<ModelOfProps<P>>>

  /**
   * The element's current value — the active language's entry for translatable
   * elements.
   */
  value: WritableComputedRef<TValue>
}

/**
 * Translatable `makeData` return (keeps translate keys, drops list keys).
 */
export type MakeDataReturnTranslatable<
  P = MakeDataOptions['props'],
  TValue = any,
> = MakeDataTranslatableBase & MakeDataModelApiTranslatable<P, TValue>

/**
 * Blueprint API overlay for elements that use `makeData` / `makeRData`. Caches
 * the wide `Base` (typically `ReturnType<typeof blueprint>`) and re-binds only
 * the prop-dependent model slice to `P`.
 */
export type ModelApi<Base, P> = Omit<Base, keyof MakeDataModelApi> &
  MakeDataModelApi<P>

/**
 * Blueprint API overlay for elements that use `makeTData`. Same caching as
 * `ModelApi`, with the translatable model slice (`model` required per language,
 * `value` typed by the blueprint-supplied `TValue` — see
 * `MakeDataModelApiTranslatable`).
 */
export type TranslatableModelApi<Base, P, TValue = any> = Omit<
  Base,
  keyof MakeDataModelApiTranslatable
> &
  MakeDataModelApiTranslatable<P, TValue>

/**
 * Wraps useData with the standard factory props/deps/events pattern,
 * eliminating repetitive prop wiring in element factories.
 *
 * Pass a config object to exclude list-only or translatable-only keys from the
 * return type. When no config is provided, the full return type is used. Model
 * value field types follow `props.modelValue`.
 *
 * @param config Optional flags to exclude conditional return-type groups.
 */
export const makeData: MakeDataFeature = defineFeature<MakeDataFeature>(
  (config?: MakeDataConfig) =>
    <P extends MakeDataOptions['props']>({
      props,
      deps,
      events,
    }: FeatureContext<
      P,
      MakeDataOptions['deps'],
      MakeDataOptions['events']
    >) => {
      return useData({
        ...pickRefs(props, [
          'name',
          'rules',
          'maxErrors',
          'submit',
          'sensitive',
          'modelValue',
          'ruleMessages',
          'transformPayload',
          'hoist',
          'trueValue',
          'falseValue',
          'multiple',
          'default',
          'nested',
          'nullValue',
        ]),
        ...deps,
        ...events,
        cast: config?.cast,
      }) as any
    }
)

/**
 * Data factory for repeatable (list) elements.
 */
export function makeRData() {
  return makeData({ repeatable: true })
}

/**
 * Data factory for translatable elements.
 */
export function makeTData() {
  return makeData({ translatable: true })
}
