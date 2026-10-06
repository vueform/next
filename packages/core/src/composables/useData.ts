import {
  computed,
  getCurrentScope,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  toRef,
  unref,
  watch,
  type ComputedRef,
  type MaybeRef,
  type Ref,
} from 'vue'

import {
  useComponentContext,
  useFormContext,
  type ContainerContext,
} from '#core/contexts'
import type { FeatureEvents } from '#core/helpers'
import { getExpressionModule } from '#core/modules/expression'
import { getModelModule, type ModelNode } from '#core/modules/model'
import { getValidationModule, type TRulesProp } from '#core/modules/validation'
import type {
  ElementName,
  RuleMessagesProp,
  ResolvedLanguagesProp,
  StatefulElement,
  ValidateOnProp,
  Booleanish,
} from '#core/types'
import {
  reactiveComputed,
  alwaysFalse,
  asyncForEach,
  clone,
  coalesce,
  equals,
  hasInstanceRawPropLoose,
  isPlainObject,
  mergeOrReplace,
  move,
  normalize,
  warn,
} from '#core/utils'

import {
  useCurrentInstance,
  useFallbackProp,
  useDynamicPropFactory,
  type VueformChildren,
} from './'
import { useExpression } from './useExpression'
import { useMessageBag } from './useMessageBag'

/**
 * Configuration options for the useData composable.
 */
type UseDataOptions = {
  /**
   * The element's own children registry. Children with the `hoist` prop have
   * their errors surfaced by this element.
   */
  children: VueformChildren

  /**
   * The element's name, used as the key in the parent model and for
   * registration.
   */
  name?: Ref<ElementName>

  /**
   * Whether the element is currently available (visible). Unavailable elements
   * are excluded from form data.
   */
  available?: Ref<boolean>

  /**
   * The element's path in the form tree (e.g. `address.city`).
   */
  path?: Ref<string>

  /**
   * The element's dot-notation data path in the root model.
   */
  dataPath?: Ref<string>

  /**
   * The parent container context that owns the model this element reads from
   * and writes to.
   */
  container?: ContainerContext

  /**
   * The external `v-model` ref bound by the parent, if any.
   */
  modelValue?: Ref<any>

  /**
   * Validation rules to apply to this element. Can be multilingual when
   * `translatable` is `true`.
   */
  rules?: Ref<TRulesProp | undefined>

  /**
   * Maximum number of error messages to display at once.
   */
  maxErrors?: Ref<number | undefined>

  /**
   * Whether this element pushes its errors to its nearest ancestor element.
   */
  hoist?: Ref<boolean | undefined>

  /**
   * Whether the value is included in form submission data.
   */
  submit?: Ref<boolean | undefined>

  /**
   * Whether the element holds sensitive data, excluded from locally stored
   * autosave drafts.
   */
  sensitive?: Ref<boolean | undefined>

  /**
   * The element-specific null value override. When translatable, this is
   * expanded into a per-language object.
   */
  nullValue?: Ref<any>

  /**
   * The value representing the "on" / checked state. Used by checkbox-style
   * inputs to determine the model value when checked.
   */
  trueValue?: MaybeRef<any>

  /**
   * The value representing the "off" / unchecked state. When defined, it is
   * used as the default null value and the element is considered empty when its
   * model equals this value.
   */
  falseValue?: MaybeRef<any>

  /**
   * Whether the element accepts multiple values. When true, the default null
   * value is an empty array instead of `null`.
   */
  multiple?: MaybeRef<Booleanish | undefined>

  /**
   * A ref tracking whether the user has interacted with this element.
   */
  touched?: Ref<boolean>

  /**
   * An explicit initial model value, bypassing the default coalescing logic.
   */
  startupModel?: Ref<any>

  /**
   * The raw default value or expression for the element. When translatable,
   * expanded to a per-language object with expression resolution.
   */
  default?: Ref<any>

  /**
   * Custom validation messages keyed by rule name, resolved as text props.
   */
  ruleMessages?: Ref<RuleMessagesProp | undefined>

  /**
   * A function to transform outgoing data when reading the element's `payload`
   * computed.
   */
  transformPayload?: Ref<((value: any, context$: any) => any) | undefined>

  /**
   * The element's unique DOM id, used to derive sub-region ids like
   * `languageId`.
   */
  id?: Ref<string>

  /**
   * Pre-resolved translatable flag from makeMultilingual. When provided,
   * useData uses it instead of computing its own.
   */
  translatable?: ComputedRef<boolean>

  /**
   * Pre-resolved active language ref from makeMultilingual. When provided,
   * useData uses it instead of creating its own.
   */
  language?: Ref<string>

  /**
   * Pre-resolved languages map from makeMultilingual. When provided, useData
   * uses it instead of computing its own.
   */
  languages?: Ref<ResolvedLanguagesProp>

  /**
   * Pre-resolved language indicator DOM id from makeMultilingual. When
   * provided, useData uses it instead of computing its own.
   */
  languageId?: ComputedRef<string | undefined>

  /**
   * Whether this element aggregates children's data as a nested container
   * (group, list, grid, matrix, form).
   */
  nested?: MaybeRef<boolean | undefined>

  /**
   * The items definition for dynamic list containers (array of schemas or a
   * count). Only relevant when `nested` is `true`.
   */
  rows?: Ref<any[] | number | undefined>

  /**
   * Whether this element operates as the form root, owning the root model:
   * adopting a `useModel` instance passed via `modelValue`, or creating an
   * internal store from the plain `modelValue`. Mutually exclusive with
   * `container`.
   */
  root?: boolean

  /**
   * When set, the model value is cast to the specified type before being stored
   * or read. Values that are `null` or `undefined` are not cast.
   */
  cast?: CastOption
} & FeatureEvents<{
  reset: [context$: any]
  clear: [context$: any]
  load: [value: any, context$: any]
  change: [newValue: any, oldValue: any, context$: any]
  'update:modelValue': [value: any]
  valid: [context$: any]
  invalid: [context$: any]
}>

/**
 * Optional cast applied to the element's model value (`string` or `number`).
 */
export type CastOption = MaybeRef<'string' | 'number' | undefined>

/**
 * Monotonic counter backing `nextListItemId`. Module-scoped so every dynamic
 * list item receives a process-unique key, which is all the template's `v-for`
 * needs to keep instances stable across reorders.
 */
let listItemIdCounter = 0

/**
 * Generates a stable, unique id for a dynamic list item (e.g. `i0`, `i1`).
 * These ids key the list's `v-for` so component instances follow their data
 * item across reorders instead of staying pinned to an array slot.
 */
function nextListItemId() {
  return `i${listItemIdCounter++}`
}

/**
 * Manages element-level data, validation state, error handling, and lifecycle
 * for all stateful form elements — leaf inputs, containers, and the form root.
 *
 * Behavior is configured via options:
 *
 * - `nested` activates children aggregation (groups, lists, grids, matrices)
 * - `flat` skips data path registration and payload wrapping
 * - `items` enables dynamic list operations (add/remove/sort)
 * - `translatable` enables per-language validation
 * - `root` designates the form root
 *
 * @private
 * @param options Element data configuration object.
 */
export function useData(options: UseDataOptions) {
  const { children, fire } = options
  const { statefulChildren$, availableStatefulChildren$, hoistedChildren$ } =
    children

  const form$ = useFormContext() as any
  const expression = useExpression()
  const expressionTracking = getExpressionModule().makeExpressionTracking(
    form$?.index
  )
  const modelModule = getModelModule()
  const context$ = useComponentContext()
  const instance = useCurrentInstance()
  const componentScope = getCurrentScope()
  const { makeElementValidation } = getValidationModule()
  const makeDynamicProp = useDynamicPropFactory()
  const clearCustomErrors = useFallbackProp<boolean>('clearCustomErrors')
  const validateOn = useFallbackProp<ValidateOnProp>('validateOn')

  /**
   * Whether the component has an active `v-model` binding, detected via the raw
   * `onUpdate:modelValue` prop on the instance.
   */
  const hasVModel = computed(() =>
    hasInstanceRawPropLoose(instance, 'onUpdate:modelValue')
  )

  /**
   * The root model backing the form when this element operates as the form root
   * (adopting a `useModel` instance from `modelValue` or creating an internal
   * store), `undefined` for every other element.
   */
  const rootModel = options.root
    ? modelModule.makeRootModel({
        modelValue: options.modelValue!,
        hasVModel,
        context$,
        hasListeners: options.hasListeners,
        applyInbound: (data) => context$.update(data),
        fire,
      })
    : undefined

  /**
   * Whether this element acts as a data container (group, list, grid, or root).
   *
   * @private
   */
  const isContainer = toRef(
    () =>
      typeof unref(options.nested) === 'boolean' ||
      !!rootModel ||
      unref(options.rows) !== undefined
  )

  const languages: Ref<ResolvedLanguagesProp> =
    options.languages ?? computed(() => ({}))

  const translatable = options.translatable ?? alwaysFalse

  if (!rootModel && !options.container) {
    throw new Error('Container context does not exist')
  }

  if (!rootModel && options.name?.value === undefined) {
    throw new Error('`name` must be provided for `useData()`')
  }

  /**
   * Casts a value to the configured type. Returns the value unchanged when it
   * is `null`, `undefined`, or no `cast` option is set.
   */
  const castValue = (value: any): any => {
    const cast = unref(options.cast)

    if (value === null || value === undefined) return value

    return cast === 'string'
      ? String(value)
      : cast === 'number'
        ? Number(value || 0)
        : value
  }

  /**
   * The element's message bag for managing custom errors, messages, and
   * prepended/appended messages.
   */
  const messageBag = useMessageBag()

  // =============== SETUP ================

  /**
   * Whether the element's data is flattened into the parent container rather
   * than nested under its own `name` key.
   */
  const isFlatContainer = computed(
    () => unref(options.nested) === false || !!rootModel
  )

  /**
   * The dot-notation path to this element's value within the form data object
   * (e.g. `"address.city"`). Empty string for the root model. Flat containers
   * inherit their parent's data path.
   */
  const dataPath = toRef(() => {
    if (rootModel) return ''
    if (options.dataPath?.value !== undefined) return options.dataPath.value
    if (isFlatContainer.value) return options.container!.dataPath.value || ''
    return options.container!.dataPath.value
      ? `${options.container!.dataPath.value}.${options.name!.value}`
      : String(options.name!.value)
  })

  /**
   * The element's model provider: the pre-built root model when this element is
   * the form root, otherwise a child model bound to its parent container.
   */
  const dataModel =
    rootModel ??
    modelModule.makeChildModel({
      parent: options.container!,
      name: options.name!,
      dataPath,
      modelValue: options.modelValue,
      available: options.available,
      flat: isFlatContainer,
      children: statefulChildren$,
      hasVModel,
      context$,
      // Goes through `context$.update` instead of the local `update` so a
      // plugin that customizes the context's `update` stays in the loop —
      // this is the customization point.
      update: (data: any) => context$.update(data), // @todo: should this really be context$'s update? I mean I don't use it anywhere else, so if this really wants to be a customization point it should be used consistently everywhere else.
      hasListeners: options.hasListeners,
      fire,
    })

  const { model, initialModel, lastModel } = dataModel

  /**
   * The model ref the element provides to its children via the container
   * context. For flat containers this is the parent's model — children's data
   * lives merged at the parent level, while the public `model` is a scoped
   * projection. For every other element it is the element's own `model`.
   */
  const containerModel = computed<unknown>(() =>
    !rootModel && isFlatContainer.value
      ? options.container!.model.value
      : model.value
  )

  /**
   * Registers the element's model key in its parent container.
   *
   * @private
   */
  const initModel = dataModel.init

  /**
   * Removes the element's model key from its parent container.
   *
   * @private
   */
  const destroyModel = dataModel.destroy

  // ================ REFS ================

  const language = options.language ?? ref('default')

  /**
   * The element's own rules. Form-level Standard Schema issues are projected
   * onto this owner by the validator (no merge into `rules`).
   */
  const rules = computed(() => (rootModel ? undefined : options.rules?.value))

  const path = toRef(() => (rootModel ? '' : (options.path?.value ?? '')))

  const available = toRef(() =>
    rootModel ? true : (options.available?.value ?? true)
  )

  const registerDataPath = toRef(() => {
    if (rootModel) return undefined
    if (isFlatContainer.value) return undefined
    return dataPath.value
  })

  const dynamic = toRef(
    () =>
      isContainer.value && !rootModel && typeof options.rows?.value === 'number'
  )

  const repeatable = options.rows !== undefined

  /**
   * Stable per-item ids for a dynamic container (list or matrix), kept the same
   * length and order as the data. These key the container's `v-for` so
   * component instances (and the validation / message-bag state stored on them)
   * follow their data item across reorders instead of being pinned to an array
   * slot.
   */
  const ids = ref<string[]>([])

  /**
   * Suppresses the fallback length-reconciliation watcher while `add` is
   * extending the id list ahead of the model growing through child
   * registration, so a transient length mismatch does not truncate fresh ids.
   */
  let suppressIdLengthSync = false

  /**
   * The index of the item currently being dragged in a sortable list. This is a
   * data index (position in the canonical order), so it stays stable during a
   * drag preview and only the display order changes.
   */
  const dragIndex = ref()

  /**
   * The data index where the dragged item will be dropped.
   */
  const dropIndex = ref()

  /**
   * Resolved rule-specific validation messages, keyed by rule name.
   *
   * @private
   */
  const ruleMessages = reactiveComputed(() => {
    const ruleMessages: Record<string, ComputedRef<string | undefined>> = {}

    for (const rule in options.ruleMessages?.value) {
      ruleMessages[rule] = makeDynamicProp(
        'rule',
        toRef(() => options.ruleMessages?.value?.[rule]),
        {
          context$,
          localize: true,
          string: true,
        }
      )
    }

    return ruleMessages
  })

  /**
   * The value the element holds when it is considered empty. Determined by
   * `nullValue` / `falseValue` props, element type (container, multiple), and
   * translatable state. For translatable elements a per-language object is
   * returned.
   */
  const nullValue = toRef(() => {
    let nv: any

    if (unref(options.nullValue) !== undefined) {
      nv = unref(options.nullValue)
    } else if (unref(options.falseValue) !== undefined) {
      nv = unref(options.falseValue)
    } else if (isContainer.value) {
      nv = dynamic.value
        ? new Array(Number(options.rows?.value || 0)).fill(undefined)
        : {}
    } else if (unref(options.multiple)) {
      nv = []
    } else {
      nv = null
    }

    if (!translatable.value) return nv

    // For translatable elements `nullValue` describes one language's empty
    // value (never a locale-keyed map), so it is applied to every language.
    const defaults: Record<string, any> = {}
    for (const lang of Object.keys(languages.value)) {
      defaults[lang] = nv ?? null
    }
    return defaults
  })

  const defaultValue = toRef<any>(() => {
    if (!options.default) return nullValue.value

    const rawDefault = options.default.value

    if (!translatable.value) {
      const value =
        typeof rawDefault === 'number'
          ? rawDefault
          : (rawDefault ?? nullValue.value)
      return expression.resolveIfAllowed('default', value)
    }

    const defaults: Record<string, any> = {}
    for (const lang of Object.keys(languages.value)) {
      const value =
        ((isPlainObject(rawDefault) ? rawDefault[lang] : rawDefault) as
          | string
          | undefined) ?? nullValue.value[lang]
      defaults[lang] = expression.resolveIfAllowed('default', value)
    }
    return defaults
  })

  const startupModel = toRef(() => {
    if (options.startupModel?.value !== undefined)
      return options.startupModel.value
    if (rootModel) return undefined
    if (isFlatContainer.value) return undefined
    if (isContainer.value) {
      return (
        clone(model.value) ??
        clone(options.modelValue?.value) ??
        clone(nullValue.value)
      )
    }
    return coalesce(
      model.value,
      options.modelValue?.value,
      defaultValue.value,
      options.nullValue?.value,
      null
    )
  })

  /**
   * The current language-aware value of the element. For translatable elements,
   * returns the value for the active language.
   */
  const value = computed({
    get: () => {
      const raw =
        translatable.value &&
        model.value &&
        typeof model.value === 'object' &&
        language.value
          ? model.value[language.value]
          : model.value
      return castValue(raw)
    },
    set: (value: any) => update(value),
  })

  // ============= VALIDATION =============

  /**
   * The element's validation view-model: owner identity, validator adoption,
   * rule compilation, per-language views, and validation policy (see
   * `makeElementValidation`). `invalid` / `validate` are lazy because the
   * children-aggregated versions below derive from this view-model.
   */
  const dataValidation = makeElementValidation({
    form$,
    isRoot: !!rootModel,
    store: rootModel?.store,
    rules: rules as Ref<TRulesProp | undefined>,
    path,
    dataPath,
    model,
    value,
    languages,
    translatable,
    language,
    touched: options.touched,
    available,
    isContainer,
    validateOn: validateOn as Ref<string[] | undefined>,
    el$: () => context$ as StatefulElement,
    invalid: () => invalid.value,
    validate: () => validate(),
  })

  const {
    validator,
    validation,
    currentValidation,
    hasOwnValidation,
    shouldValidate,
    success,
    required,
    invalidLanguages,
    validateSelf,
    validateCurrent,
    onUserInput,
    initValidation,
    destroyValidation,
  } = dataValidation

  // ============== COMPUTED ==============

  /**
   * Lookup from stable item id to its canonical data index. Recomputes only
   * when the id list changes, so a drag (which only changes the display order)
   * doesn't rebuild it on every `dragenter`.
   *
   * @private
   */
  const idIndexMap = repeatable
    ? computed(() => new Map(ids.value.map((id, index) => [id, index])))
    : undefined

  /**
   * The resolved, display-ordered items for dynamic container elements. Each
   * entry pairs the stable item `id` (the `v-for` key) with its canonical
   * `index` (its position in the data model). Only created when `rows` is
   * passed.
   */
  const items = repeatable
    ? computed(() => {
        if (!isContainer.value || rootModel) return []
        if (Array.isArray(options.rows?.value)) return options.rows!.value

        if (!dynamic.value) return []

        const indexOf = idIndexMap!.value
        return move([...ids.value], dragIndex.value, dropIndex.value).map(
          (id) => ({
            id,
            index: indexOf.get(id)!,
          })
        )
      })
    : undefined

  /**
   * Whether this element pushes its errors to its nearest ancestor element
   * instead of displaying and reporting them itself.
   */
  const hoisted = computed(() => unref(options.hoist))

  /**
   * Whether any of the element's validations (across all languages) are
   * currently invalid, including children.
   */
  const invalid = computed(
    () =>
      dataValidation.ownInvalid.value ||
      availableStatefulChildren$.value.some(({ invalid }) => invalid)
  )

  /**
   * Whether any of the element's validations are currently pending an async
   * check, including children.
   */
  const pending = computed(
    () =>
      dataValidation.ownPending.value ||
      availableStatefulChildren$.value.some(({ pending }) => pending)
  )

  /**
   * Whether any of the element's validations are currently debouncing,
   * including children.
   */
  const debouncing = computed(
    () =>
      dataValidation.ownDebouncing.value ||
      availableStatefulChildren$.value.some(({ debouncing }) => debouncing)
  )

  /**
   * Whether the element is busy, meaning it is either debouncing or has pending
   * async validation.
   */
  const busy = computed(() => debouncing.value || pending.value)

  /**
   * Whether all of the element's validations (across all languages) have been
   * executed, including children.
   */
  const validated = computed(
    () =>
      dataValidation.ownValidated.value &&
      availableStatefulChildren$.value.every(({ validated }) => validated)
  )

  /**
   * Whether the current model value differs from the initial model value.
   */
  const dirty = computed(
    () =>
      !equals(initialModel.value, model.value) ||
      availableStatefulChildren$.value.some(({ dirty }) => dirty)
  )

  /**
   * Whether the element's current value is empty. For isContainer.value
   * containers, checks whether all children are empty. For leaf elements,
   * checks whether the value is blank or equals the falseValue.
   */
  const empty = computed(() => {
    if (isContainer.value) {
      return availableStatefulChildren$.value.every(({ empty }) => empty)
    }

    if (unref(options.falseValue) !== undefined) {
      return (
        String(value.value ?? '').trim() === '' ||
        value.value === unref(options.falseValue)
      )
    }

    return String(value.value ?? '').trim() === ''
  })

  /**
   * Whether the element is completed, meaning it either has no rules or has
   * been validated without errors.
   */
  const completed = computed(
    () =>
      (!hasOwnValidation.value &&
        availableStatefulChildren$.value.every(({ completed }) => completed)) ||
      (validated.value && !invalid.value)
  )

  /**
   * The list of custom messages from the message bag, including messages from
   * hoisted children.
   */
  const messages = computed<string[]>(() => [
    ...messageBag.messages.value,
    ...hoistedChildren$.value.reduce(
      (msgs: string[], { messageBag }: any) => [
        ...msgs,
        ...messageBag.messages.value,
      ],
      []
    ),
  ])

  /**
   * The element's own error messages across all languages (validation rules
   * plus custom message bag entries).
   */
  const ownErrors = computed(() => [
    ...messageBag.prepends.errors,
    ...dataValidation.ownRuleErrors.value,
    ...messageBag.appends.errors,
  ])

  /**
   * Errors collected from children that push their errors to this element
   * (children with the `hoist` prop).
   */
  const hoistedErrors = computed(() =>
    hoistedChildren$.value.flatMap((child: any) => child.errors ?? [])
  )

  /**
   * All error messages for this element: its own plus any pushed up by hoisted
   * children.
   */
  const errors = computed(() =>
    isContainer.value
      ? [...hoistedErrors.value, ...ownErrors.value]
      : [...ownErrors.value, ...hoistedErrors.value]
  )

  /**
   * Whether the element has any active error messages.
   */
  const hasError = computed(() => !!errors.value.length)

  /**
   * The error messages rendered for this element. Empty when the element pushes
   * its errors to its parent; otherwise errors capped by `maxErrors`.
   */
  const displayErrors = computed(() => {
    if (hoisted.value) return []

    const base = [
      ...hoistedErrors.value,
      ...messageBag.prepends.errors,
      ...currentValidation.value.errors.value,
      ...messageBag.appends.errors,
    ]

    return options.maxErrors?.value !== undefined &&
      options.maxErrors?.value >= 1
      ? base.slice(0, options.maxErrors.value)
      : base
  })

  /**
   * Error messages propagated to the form, keyed by element path. Empty when
   * the element pushes its errors to its parent.
   */
  const formErrors = computed<Record<string, string[]>>(() => {
    if (hoisted.value) return {}

    const reporting = [...ownErrors.value, ...hoistedErrors.value]
    if (!reporting.length) return {}
    return { [path.value]: reporting }
  })

  /**
   * The element's submission payload. For isContainer.value containers,
   * aggregates from children. For leaf elements, returns own value.
   */
  const payload = computed<Record<ElementName, any>>(() => {
    if (!available.value || options.submit?.value === false) return {}

    if (isContainer.value) {
      let aggregated: any = dynamic.value ? [] : {}
      for (const child of availableStatefulChildren$.value) {
        if (dynamic.value) {
          aggregated.push(...Object.values(child.payload))
        } else {
          Object.assign(aggregated, child.payload)
        }
      }

      if (options.transformPayload?.value) {
        aggregated = options.transformPayload.value(aggregated, context$)
      }

      return isFlatContainer.value
        ? aggregated
        : { [options.name!.value!]: aggregated }
    }

    const val = options.transformPayload?.value
      ? options.transformPayload.value(model.value, context$)
      : model.value
    return { [options.name!.value!]: val }
  })

  /**
   * The root data paths of the model subtree this element's data occupies: its
   * own `dataPath`, or — for flat containers, whose data lives merged at the
   * parent level — each child's subtree paths.
   *
   * @private
   */
  const ownDataPaths = computed<string[]>(() => {
    if (isFlatContainer.value) {
      const aggregated: string[] = []
      for (const child of statefulChildren$.value) {
        aggregated.push(...(child.ownDataPaths ?? []))
      }
      return aggregated
    }

    return dataPath.value ? [dataPath.value] : []
  })

  /**
   * Data paths holding sensitive data (`sensitive: true`) within this element's
   * subtree — excluded from locally stored autosave drafts. A sensitive element
   * marks its whole subtree; containers otherwise aggregate from children.
   * Unavailable elements are included: their data may still linger in the
   * model, and stripping an absent path is harmless.
   */
  const sensitivePaths = computed<string[]>(() => {
    if (options.sensitive?.value) return ownDataPaths.value

    if (isContainer.value) {
      const aggregated: string[] = []
      for (const child of statefulChildren$.value) {
        aggregated.push(...(child.sensitivePaths ?? []))
      }
      return aggregated
    }

    return []
  })

  // ============== METHODS ===============

  /**
   * Updates the element's model value. For isContainer.value containers,
   * performs a deep merge. For leaf elements, sets the value directly and
   * invalidates validation.
   *
   * @param data The new value or data to merge.
   */
  const update = (data: any) => {
    if (isContainer.value) {
      if (data === undefined) return

      // The root writes through the store, which owns the identical
      // merge-per-key semantics.
      if (rootModel) {
        rootModel.store.update(data)
        return
      }

      // Merge from the raw model so the O(N) read doesn't go through the
      // reactive proxy. Keys untouched by the merge keep their raw identity,
      // so they can be skipped here without writing anything back.
      const current = toRaw(model.value)
      const merged = mergeOrReplace(current, normalize(data))

      if (isFlatContainer.value) {
        // A flat container's data lives at the parent's level, so the merged
        // result is written per owned key — writing the whole object at the
        // parent's path would wipe same-level siblings. Keys the container's
        // children don't own (siblings) are dropped instead of written.
        const prefix = dataPath.value ? `${dataPath.value}.` : ''
        Object.keys(merged).forEach((key) => {
          if (!current || !(key in current)) return
          if (merged[key] !== current[key]) {
            options.container!.update(`${prefix}${key}`, merged[key])
          }
        })
        return
      }

      options.container!.update(dataPath.value, merged)
    } else {
      data = castValue(data)

      if (equals(model.value, data)) return

      if (data !== undefined) {
        options.container!.update(
          `${dataPath.value}${!isPlainObject(data) && translatable.value ? `.${language.value}` : ''}`,
          options?.cast ? data : normalize(data)
        )
      }

      if (clearCustomErrors?.value) clearErrors()

      // Store-wired validators hear about the write from the store itself
      // (staleness marking, schema dirtying, cross-field revalidation); only
      // unwired (standalone) elements need the manual nudge.
      if (!validator.wired) {
        invalidate()
        dataValidation.notifyChange()
      }
    }
  }

  /**
   * Handles a native input event and updates the model from the event target.
   * Text and select inputs use `target.value`. Checkboxes and radios use the
   * `checked` state with `trueValue` / `falseValue` when available.
   *
   * @param data The native DOM event from the input.
   */
  const handleModelUpdate = (data: Event) => {
    if (!data.target || !('value' in data.target)) {
      return
    }

    const target = data.target as HTMLInputElement

    if (target.type === 'checkbox' || target.type === 'radio') {
      if (target.type === 'radio' && !target.checked) {
        return
      }

      const trueValue = unref(options.trueValue)
      const falseValue = unref(options.falseValue)

      update(
        target.checked
          ? trueValue !== undefined
            ? trueValue
            : target.value
          : falseValue !== undefined
            ? falseValue
            : false
      )
      return
    }

    update(target.value)
  }

  /**
   * Resets the element to its initial model state and fires the `reset` event.
   * For isContainer.value containers, delegates to children or resets the model
   * directly for dynamic lists.
   */
  const reset = () => {
    if (isContainer.value) {
      if (dynamic.value && !rootModel) {
        options.container!.update(dataPath.value, clone(initialModel.value))
      } else {
        statefulChildren$.value.forEach(({ reset }) => reset())
      }
    } else {
      update(clone(initialModel.value))
    }

    fire('reset', model.value, context$)
  }

  /**
   * Clears the element to its null value and fires the `clear` event. For
   * isContainer.value containers, delegates to children or clears the model for
   * dynamic lists.
   */
  const clear = () => {
    if (isContainer.value) {
      if (dynamic.value && !rootModel) {
        options.container!.update(dataPath.value, [])
      } else {
        statefulChildren$.value.forEach(({ clear }) => clear())
      }
    } else {
      update(clone(nullValue.value))
    }

    fire('clear', model.value, context$)
  }

  /**
   * Loads data into the element and fires the `load` event, cascading to all
   * children so expression tracking can be stopped per-element.
   *
   * @param data The new value or data to load.
   */
  const load = (data: any) => {
    update(data)

    if (isContainer.value) {
      statefulChildren$.value.forEach((child) => child.load?.(child.model))
    }

    fire('load', model.value, context$)
  }

  /**
   * Validates stateful children, returning whether all are valid. By default
   * only incomplete children run — never-validated, stale, or invalid ones;
   * children validated without errors against their current value keep their
   * result. `force: true` runs every child regardless of prior results.
   *
   * @param options Pass `force: true` to re-validate all children, ignoring
   *   current results.
   */
  const validateChildren = async (options?: { force?: boolean }) => {
    await asyncForEach(
      options?.force
        ? statefulChildren$.value
        : statefulChildren$.value.filter(({ completed }) => !completed),
      async ({ validate }) => await validate(options)
    )

    return !availableStatefulChildren$.value.some(({ invalid }) => invalid)
  }

  /**
   * Runs validation on the element's own rules and all children, returning
   * whether everything is valid. Elements already validated without errors
   * against their current value are skipped unless `force: true` re-runs
   * everything — for rules whose outcome can change without the value changing
   * (async server checks, date boundaries).
   *
   * @param options Pass `force: true` to re-validate every element, ignoring
   *   current results.
   */
  const validate = async (options?: { force?: boolean }) => {
    await validateSelf()
    if (isContainer.value) await validateChildren(options)

    return !invalid.value
  }

  /**
   * Resets all validation state. For isContainer.value containers, also
   * delegates to children.
   */
  const unvalidate = () => {
    dataValidation.unvalidateSelf()

    if (isContainer.value) {
      statefulChildren$.value.forEach(({ unvalidate }) => unvalidate())
    }
  }

  /**
   * Marks all validation instances as invalidated, requiring revalidation. For
   * isContainer.value containers, also delegates to children.
   */
  const invalidate = () => {
    dataValidation.invalidateSelf()

    if (isContainer.value) {
      statefulChildren$.value.forEach(({ invalidate }) => invalidate())
    }
  }

  /**
   * Checks whether a value is considered filled. For isContainer.value
   * containers, delegates to children. For leaf elements, checks the scalar
   * value.
   *
   * @param value The value to check.
   */
  const filled = isContainer.value
    ? (value: any) =>
        availableStatefulChildren$.value.every(({ filled, name }) =>
          filled(value?.[name])
        )
    : (value: any) => {
        if (unref(options.falseValue) !== undefined) {
          return unref(options.falseValue) !== value
        }

        return (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          value !== false &&
          (!Array.isArray(value) || !!value.length) &&
          (!isPlainObject(value) || !!Object.keys(value).length)
        )
      }

  /**
   * Marks the element as clean by updating the initial model snapshot. For
   * isContainer.value containers, delegates to children.
   */
  const clean = () => {
    if (isContainer.value) {
      statefulChildren$.value.forEach(({ clean }) => clean())
    } else {
      initialModel.value = clone(model.value)
    }
  }

  /**
   * Clears all error messages from the message bag.
   */
  const clearErrors = () => messageBag.clear('errors')

  /**
   * Clears all custom messages from the message bag.
   */
  const clearMessages = () => messageBag.clear('messages')

  /**
   * Clears the entire message bag, removing both errors and messages.
   */
  const clearMessageBag = () => messageBag.clear()

  /**
   * Adds one or more items to a dynamic list.
   *
   * @param count The number of items to add.
   */
  const add = async (count = 1) => {
    if (!dynamic.value) return
    if (isNaN(count)) count = 1

    suppressIdLengthSync = true

    // Reconcile the id list with the current model length before appending. A
    // synchronous model change just before this `add` (e.g. `clear()` in the
    // matrix mode watcher) can leave `ids` stale, since the length watcher that
    // normally keeps them aligned runs asynchronously.
    const current = Array.isArray(model.value) ? model.value.length : 0
    if (ids.value.length > current) ids.value.splice(current)
    while (ids.value.length < current) ids.value.push(nextListItemId())

    // Extend the id list so the template renders `count` extra rows; the freshly
    // mounted children then register and grow the model to match. The length
    // watcher is suppressed for this window so it can't truncate the new ids
    // before the model catches up.
    for (let i = 0; i < count; i++) ids.value.push(nextListItemId())
    await nextTick()
    suppressIdLengthSync = false
  }

  /**
   * Removes an item from a dynamic list by index.
   *
   * @param index The index of the item to remove. Defaults to the last item.
   */
  const remove = (index?: number) => {
    if (!dynamic.value || rootModel) return
    if (!model.value.length) return
    if (index === undefined) index = model.value.length - 1
    if (model.value[index] === undefined) return

    if (index < 0 || index >= model.value.length) {
      warn(`Invalid index ${index} for removal at \`${dataPath.value}\``)
      return
    }

    // Drop a key from the end and let the data shift down through the surviving
    // slots. Removing the requested item's own id (and unmounting that exact
    // instance) would make the unmount's `unregister` splice the model array a
    // second time — corrupting it — because the model is already filtered here.
    ids.value.splice(ids.value.length - 1, 1)

    options.container!.update(
      dataPath.value,
      model.value.filter((_v: string, i: number) => i !== index)
    )
  }

  /**
   * Sorts a dynamic list by moving an item from one data index to another.
   *
   * The stable ids move in lockstep with the model, so the item's component
   * instance follows it: its validation state and message bag (stored on the
   * instance) travel automatically. No snapshot/restore of per-child state is
   * needed — the child re-points to its new slot via a non-destructive
   * re-path.
   *
   * @param fromIndex The source data index of the item to move.
   * @param toIndex The destination data index for the item.
   */
  const sort = async (fromIndex: number, toIndex: number) => {
    if (!dynamic.value || fromIndex === toIndex) return

    // Move the stable ids and the model together so display keys and data stay
    // aligned. Reassigning `ids` re-keys the `v-for`; Vue moves the matching
    // instances and their on-instance state with them.
    ids.value = move([...ids.value], fromIndex, toIndex)

    update(move(clone(model.value), fromIndex, toIndex))

    // Reset the drag indices in the same flush as the model update so the
    // preview reorder collapses into the committed order without a blink.
    dragIndex.value = undefined
    dropIndex.value = undefined

    await nextTick()
  }

  /**
   * Initializes the element's model and validation.
   *
   * @private
   */
  const init = () => {
    initModel()
    initValidation()
  }

  /**
   * Reinitializes the element by rebuilding both its model registration and
   * validation instances.
   */
  const reinit = () => {
    reinitModel()
    destroyValidation()
    initValidation()
  }

  /**
   * Destroys the element by tearing down validation, model, and unregistering
   * from the container.
   *
   * @private
   */
  const destroy = () => {
    releaseIndexNode()
    destroyValidation()
    destroyModel()
    unregister()
  }

  /**
   * Reinitializes the model by destroying and re-registering it with the
   * container.
   *
   * @private
   * @param unregisterDataPath The data path to unregister before
   *   re-registering.
   */
  const reinitModel = (unregisterDataPath?: string) => {
    const dp =
      unregisterDataPath ??
      (isContainer.value ? registerDataPath.value : dataPath.value)
    destroyModel()
    unregister(dp)
    register()
    initModel()
  }

  /**
   * Re-points the element's model binding to a new data path without touching
   * the registered data. Used when the path changes because the element (or an
   * ancestor) was reordered within a dynamic list: the list already moved the
   * data, so the element only needs to re-subscribe to its new slice. Going
   * through `reinitModel` here would `unregister` the old path and splice the
   * model array, corrupting the just-reordered data.
   *
   * @private
   */
  const repathModel = () => {
    destroyModel()
    initModel()
  }

  /**
   * Whether a data-path change is a reorder (the slice value moved with the
   * element) rather than a rename to a different field. On a reorder the value
   * at the new path equals the value the element already held, so the binding
   * can be re-pointed non-destructively.
   *
   * @private
   */
  const isReorderRepath = () =>
    lastModel.value !== undefined && equals(lastModel.value, clone(model.value))

  /**
   * Registers the element with its parent container context using its path and
   * initial model.
   *
   * @private
   */
  const register = () => {
    if (rootModel) return

    options.container!.register(
      context$,
      path.value,
      isContainer.value ? registerDataPath.value : dataPath.value,
      startupModel.value
    )
  }

  /**
   * Unregisters the element from its parent container context.
   *
   * @private
   * @param unregisterDataPath The data path to unregister.
   */
  const unregister = (unregisterDataPath?: string) => {
    if (rootModel) return

    const dp =
      unregisterDataPath ??
      (isContainer.value ? registerDataPath.value : dataPath.value)
    options.container!.unregister(path.value, dp, context$)
  }

  /**
   * The form's schema-index node claimed by this element.
   *
   * @private
   */
  let claimedNode: ModelNode | undefined

  /**
   * Claims this element's schema-index node, making the mounted state the
   * single authority the headless model engine reads for adopted `useModel`
   * instances (availability, validation, errors).
   *
   * @private
   */
  const claimIndexNode = () => {
    if (rootModel) return

    const node: ModelNode | undefined = form$?.index?.nodes?.get(path.value)
    if (!node || node === claimedNode) return

    claimedNode = node
    form$.index.version.value++
  }

  /**
   * Releases this element's claimed index node so the headless engine rebuilds
   * its own state once the element is gone.
   *
   * @private
   */
  const releaseIndexNode = () => {
    if (claimedNode) {
      if (form$?.index) form$.index.version.value++
    }
    claimedNode = undefined
  }

  /**
   * Wires `default`-value expression tracking for this element's claimed index
   * node when its component opted in (`defineOptions({ expressionable: true
   * })`). Registration-created nodes (plain forms, template-driven elements,
   * list rows beyond the initial count) first receive the element facts the
   * schema walk would have provided. Idempotent per node — an adopted
   * instance's walk nodes are typically already tracked by the headless engine
   * and are left untouched.
   *
   * @private
   */
  const attachExpressionNode = () => {
    if (rootModel || !claimedNode || !instance) return

    if (!expressionTracking.trackable(instance)) return

    const node = claimedNode

    if (node.mounted) {
      node.expressionable = true
      node.translatable = translatable.value
      node.props = {
        ...node.props,
        default: options.default?.value,
        untrackOn: (context$.props as any)?.untrackOn,
        expressions: (context$.props as any)?.expressions,
      }
    }

    // Run inside the component scope: path-change re-claims invoke this from a
    // watcher callback, where created effects would otherwise be unowned.
    if (componentScope) {
      componentScope.run(() => expressionTracking.init(node, () => context$))
    } else {
      expressionTracking.init(node, () => context$)
    }
  }

  /**
   * Whether the element's `default` expression is currently tracked and
   * auto-updating the value.
   */
  const tracking = computed(() => {
    void form$?.index?.version?.value
    return expressionTracking.isTracking(claimedNode)
  })

  /**
   * Resumes expression tracking after an untrack, immediately re-writing the
   * resolved value.
   */
  const track = () => {
    expressionTracking.track(claimedNode)
  }

  /**
   * Stops expression tracking, leaving the current value in place.
   */
  const untrack = () => {
    expressionTracking.untrack(claimedNode)
  }

  // ================ HOOKS ===============

  onMounted(init)
  onBeforeUnmount(destroy)

  if (!isContainer.value && translatable.value) {
    if (
      (model.value && !isPlainObject(model.value)) ||
      (options.modelValue?.value && !isPlainObject(options.modelValue.value))
    ) {
      throw new Error('Multilingual model must be an object')
    }
  }

  register()
  claimIndexNode()
  attachExpressionNode()
  initValidation()

  if (!rootModel) {
    // Forward user-driven element events to the node's expression tracker
    // (untracking per `untrackOn`). `input` fires from `handleInput` (user input only), so
    // programmatic updates never untrack; `load` covers `form$.load` cascades
    // (headless `instance.load` untracks through the store's own event).
    ;(options.on as any)('input', () =>
      expressionTracking.notify(claimedNode, 'input')
    )
    options.on('load', () => expressionTracking.notify(claimedNode, 'load'))
  }

  // ============== WATCHERS ==============

  // Re-key the children/element registries when the lookup path changes (e.g.
  // the element or an ancestor was reordered within a list) so `find()` keeps
  // resolving paths to the right instances. Model bindings are handled by the
  // dataPath watchers; registering without a dataPath leaves them untouched.
  // The old key is deleted identity-guarded because a sibling involved in the
  // same reorder may have already claimed it.
  if (!rootModel) {
    watch(path, (newPath, oldPath) => {
      options.container!.register(context$, newPath)
      if (oldPath) options.container!.unregister(oldPath, undefined, context$)
      claimIndexNode()
      attachExpressionNode()
    })
  }

  if (isContainer.value) {
    watch(registerDataPath, (_n, o) =>
      isReorderRepath() ? repathModel() : reinitModel(o)
    )

    if (repeatable) {
      // Keep the stable id list aligned with the model length while dynamic.
      // `add` / `remove` adjust ids in lockstep so this is a no-op for them;
      // it exists to extend or truncate ids when the array is replaced
      // wholesale from outside (an external `modelValue` set, `reset`, or
      // `clear`). Identity cannot be preserved for a wholesale replacement, so
      // extend / truncate is the accepted behavior there. The source follows
      // `dynamic` so a matrix that mounts on static rows and later becomes a
      // numeric list still starts syncing.
      watch(
        () =>
          dynamic.value && Array.isArray(model.value) ? model.value.length : -1,
        (len) => {
          if (len < 0 || suppressIdLengthSync) return
          while (ids.value.length < len) ids.value.push(nextListItemId())
          if (ids.value.length > len) ids.value.splice(len)
        },
        { immediate: true }
      )
    }
  } else {
    watch(dataPath, (_n, o) =>
      isReorderRepath() ? repathModel() : reinitModel(o)
    )
    watch(() => translatable.value, reinit, { flush: 'pre' })
  }

  if (options.multiple !== undefined) {
    watch(
      () => unref(options.multiple),
      () => reinit(),
      { immediate: false }
    )
  }

  watch(invalid, (isInvalid, wasInvalid) => {
    if (isInvalid) {
      fire('invalid', context$)
    } else if (wasInvalid) {
      fire('valid', context$)
    }
  })

  watch(
    () => options.default,
    () => {
      const newDefault = normalize(defaultValue.value)

      if (!dirty.value) {
        update(clone(newDefault))
      }

      initialModel.value = clone(newDefault)
    }
  )
  ;(options.on as any)('blur', dataValidation.onBlur)

  return {
    value,
    /**
     * The element's reactive model value within the form data tree.
     */
    model,
    /**
     * A snapshot of the model at initialization time, used for dirty checking
     * and reset.
     */
    initialModel,
    /**
     * The root model backing the form (store, index, registration, adoption
     * state). Only present when the `root` option is set.
     */
    rootModel,
    payload,
    dataPath,
    ownDataPaths,
    sensitivePaths,
    nullValue,

    invalid,
    required,
    dirty,
    pending,
    debouncing,
    busy,
    validated,
    completed,
    success,
    empty,
    hoisted,

    errors,
    hasError,
    displayErrors,
    ownErrors,
    formErrors,
    messages,
    messageBag,
    ruleMessages,

    ...(items ? { items } : {}),
    dragIndex,
    dropIndex,

    ...(options.translatable ? { invalidLanguages } : {}),

    validation,
    currentValidation,
    validator,
    shouldValidate,
    onUserInput,
    isContainer,
    isFlatContainer,
    containerModel,

    update,
    handleModelUpdate,
    reset,
    clear,
    load,
    validate,
    validateSelf,
    validateChildren,
    validateCurrent,
    unvalidate,
    invalidate,
    clean,
    clearErrors,
    clearMessages,
    clearMessageBag,

    add,
    remove,
    sort,

    filled,

    tracking,
    track,
    untrack,

    init,
    reinit,
    destroy,
    register,
    unregister,

    initModel,
    reinitModel,
    destroyModel,
    initValidation,
    destroyValidation,
  }
}
