import {
  computed,
  effectScope,
  getCurrentScope,
  onScopeDispose,
  ref,
  shallowReactive,
  shallowRef,
  toRaw,
  toRef,
  watch,
  type ComputedRef,
  type EffectScope,
  type Ref,
} from 'vue'
import type { VueformInstance } from '~/createVueform'
import type { VueformConfig } from '~/helpers'
import {
  getConditionsModule,
  hasConditionsModule,
  type ConditionalProp,
} from '~/modules/conditions'
import { hasLocaleModule } from '~/modules/locale'
import {
  type FormContext,
  type StandardSchemaV1,
  type StatefulElement,
} from '~/types'
import {
  alwaysFalse,
  alwaysTrue,
  emptyLanguages,
  equals,
  get as getByPath,
  isThenable,
  replaceWildcards,
  isPlainObject,
  isStandardSchema,
  normalize,
  toArray,
  own,
  warn,
} from '~/utils'
import { RULE_BRAND } from './symbols'
import type {
  ConditionalRule,
  Issue,
  RuleAttribute,
  RuleDefinition,
  RulesProp,
  SizeTypes,
  TRulesProp,
  Validator,
  ValidationOwner,
  CheckContext,
  MessageContext,
  MessageParams,
  OwnerView,
  RuleContext,
  ValidationView,
  ValidatorParams,
  RuleChecker,
  RuleOptions,
  TOnlyRulesProp,
} from './types'

type CompileContext = {
  config: VueformConfig
  owner: ValidationOwner
}

type UnitStatus = 'idle' | 'pending' | 'valid' | 'invalid'

type Unit = {
  id: string
  // `'field'` runs against the owner's value; `'model'` against the whole form
  kind: 'field' | 'model'
  owner: ValidationOwner
  language: string
  name: string
  check: RuleChecker<any>
  options?: RuleOptions
  attributes: RuleAttribute[]
  debounce: number
  deps: string[]
  conditions?: ConditionalProp
  schema?: StandardSchemaV1
}

type UnitState = {
  unit: Unit
  status: Ref<UnitStatus>
  raw: Ref<string | undefined>
  /**
   * Whether the current result corresponds to the current model value. Applied
   * by `applyResult` and cleared by the store's write notifications
   * (`markStale`), so no write path can leave a result looking current for a
   * value it never validated.
   */
  validated: Ref<boolean>
  timer: Ref<ReturnType<typeof setTimeout> | undefined>
  active: Ref<boolean>
  runId: number
  scope?: EffectScope
  indexedDeps: string[]
  rejectPending?: (error: Error) => void
}

// Message plus the issue location as a dot-separated element path
// (`undefined` for root-level issues).
type NormalizedStandardSchemaIssue = {
  message: string
  path?: string
}

/**
 * Live bindings used to assemble a `ValidationOwner`.
 */
type MakeValidationOwnerOptions = {
  /**
   * Stable owner identity (units and views are keyed by it).
   */
  id: object

  /**
   * Current element path getter.
   */
  path: () => string

  /**
   * Current data path getter — where the owner's value lives in the model.
   * Store write notifications match owners by it; defaults to `path`.
   */
  dataPath?: () => string

  /**
   * The element (or virtual element) context getter.
   */
  el$: () => StatefulElement

  /**
   * Whether the source is translatable.
   */
  translatable: () => boolean

  /**
   * Available language keys (only read when translatable).
   */
  languages: () => string[]

  /**
   * The raw value getter (full locale object for translatable sources).
   */
  value: () => any

  /**
   * Whether to stop after the first failing unit of a language.
   */
  bail?: () => boolean

  /**
   * Element-level debounce fallback.
   */
  debounce?: () => number

  /**
   * Whether the owner has been touched (gates dependent revalidation).
   */
  touched?: () => boolean

  /**
   * Whether the owner is currently available.
   */
  available?: () => boolean
}

/**
 * Inputs for the element validation view-model. Everything is passed as live
 * bindings (refs / getters) so the view-model tracks the element's state
 * without owning it.
 */
type MakeElementValidationOptions = {
  /**
   * The parent form context, if any.
   */
  form$?: any

  /**
   * Whether the element is the form root (validates the validation schema
   * instead of own rules).
   */
  isRoot: boolean

  /**
   * The root model store, when the element is the form root (validator adoption
   * / attachment).
   */
  store?: object

  /**
   * The element's own rules (`undefined` for the root).
   */
  rules: Ref<TRulesProp | undefined>

  /**
   * The element's current path.
   */
  path: Ref<string>

  /**
   * The element's current data path — where its value lives in the model. Store
   * write notifications match owners by it; defaults to `path`.
   */
  dataPath?: Ref<string>

  /**
   * The element's raw model (full locale object for translatable elements).
   */
  model: Ref<any>

  /**
   * The element's current-language value (validated by `validateCurrent`).
   */
  value: Ref<any>

  /**
   * Available languages keyed by code.
   */
  languages: Ref<Record<string, any>>

  /**
   * Whether the element is translatable.
   */
  translatable: Ref<boolean>

  /**
   * The active language.
   */
  language: Ref<string>

  /**
   * Whether the element has been touched (blurred at least once).
   */
  touched?: Ref<boolean | undefined>

  /**
   * Whether the element is currently available.
   */
  available: Ref<boolean>

  /**
   * Whether the element is a data container (containers with own rules watch
   * their model deeply).
   */
  isContainer: Ref<boolean>

  /**
   * The resolved `validateOn` triggers (element prop with form fallback).
   */
  validateOn: Ref<string[] | undefined>

  /**
   * The element's component context (`context$`), used as the owner's `el$`.
   */
  el$: () => StatefulElement

  /**
   * Whether the element (including children) is invalid — the live-validation
   * policy keeps validating invalid elements so errors clear as they are fixed.
   * Lazy because the aggregate is derived from this view-model.
   */
  invalid: () => boolean

  /**
   * Validates the element including children — what a user-input intent
   * triggers. Lazy for the same reason.
   */
  validate: () => Promise<boolean> | boolean
}

/**
 * Inputs for the form validation view-model.
 */
type MakeFormValidationOptions = {
  /**
   * The form's validator (owned by the root element's view-model).
   */
  validator: Validator

  /**
   * The resolved form-level Standard Schema (prop, `defineSchema` attachment,
   * or adopted model instance — resolution stays with the form).
   */
  validationSchema: Ref<StandardSchemaV1 | undefined>
}

/**
 * Options for creating a validator (`getValidationModule().makeValidator` /
 * `createValidation(config).makeValidator`).
 */
type MakeValidatorOptions = {
  /**
   * The form data object model units validate.
   */
  model: Ref<unknown>

  /**
   * The parent form context, if any.
   */
  form$?: FormContext

  /**
   * The model store backing the validated model, when there is one. The
   * validator subscribes to its write notifications so every model mutation —
   * element input, `update()` / `load()` at any level, server write-backs —
   * dirties the validation schema and revalidates cross-field dependents,
   * without relying on call sites to notify. Duck-typed to avoid a module
   * dependency on the model package.
   */
  store?: {
    onWrite: (cb: (dataPath: string) => void) => () => void
  }

  /**
   * Looks up an element by path (wildcard resolution, `$` params, model-unit
   * issue bucketing).
   *
   * @param path The element path to look up.
   */
  find: (path: string) => any

  /**
   * How many times the form has been submitted (gates dependent revalidation).
   * A boolean `true` is treated as submitted (headless).
   */
  submits: () => number | boolean
}

// Whether `rules` is a language-keyed map rather than a single-language set.
// Standard Schemas and `{ rules, $if }` objects are excluded — they can be
// plain objects too (`createRule` results are callables, already rejected by
// `isPlainObject`).
function isMultilingualRules(
  rules: TRulesProp | undefined
): rules is TOnlyRulesProp {
  return (
    isPlainObject(rules) &&
    !isStandardSchema(rules) &&
    !isConditionalRule(rules)
  )
}

function parseRuleString(rule: string): {
  name: string
  debounce: number
  attributes: RuleAttribute[]
  conditions?: ConditionalProp
} {
  let debounce = 0
  const parts = rule.split(':')
  const name = parts[0]

  if (parts.length === 1) return { name, attributes: [], debounce }

  const attributes: RuleAttribute[] = []
  const params = parts.slice(1).join(':')

  if (name === 'regex' || name === 'not_regex') {
    attributes.push({ value: params.replace(/^pattern=/, '') })
  } else {
    params.split(',').forEach((attribute) => {
      const attrParts = attribute.split('=')

      if (attrParts.length > 1) {
        const attrName = attrParts[0]
        const value = normalize(attrParts[1])

        if (attrName === 'debounce') {
          debounce = value
          return
        }

        attributes.push({ name: attrName, value })
      } else {
        attributes.push({ value: normalize(attrParts[0]) })
      }
    })
  }

  return { name, attributes, debounce }
}

function makeFieldSchemaCheck(schema: StandardSchemaV1): RuleChecker {
  // Vendors like Zod define internals as non-configurable, which breaks
  // behind Vue's reactive proxies — validate against the raw schema.
  const raw = toRaw(schema)
  return (value) => {
    const result = raw['~standard'].validate(value)
    return isThenable(result)
      ? result.then(resolveStandardSchemaResult)
      : resolveStandardSchemaResult(result)
  }
}

// Wildcards are left for the validator to fill at run time via `replaceWildcards`.
function depsOf(
  definition: RuleDefinition,
  attributes = definition.attributes
): string[] {
  const deps: string[] = []
  const params = definition.options?.params

  if (Array.isArray(params)) {
    params.forEach((param, i) => {
      if (!String(param).includes('$')) return
      const paramName = String(param).replace(/(?:\$\?|[$?])$/, '')
      const attr = attributes.find((a) => a.name === paramName) || attributes[i]
      if (typeof attr?.value === 'string') deps.push(attr.value)
    })
  }

  const extra = definition.options?.deps
  if (Array.isArray(extra)) {
    deps.push(...extra)
  }

  return deps
}

function lookupRule(name: string, config: VueformConfig): RuleDefinition {
  const rule = own(config.rules, name)
  if (!rule) {
    throw new Error(`\`${name}\` validation rule does not exist`)
  }
  return rule
}

function isConditionalRule(value: unknown): value is ConditionalRule {
  return isPlainObject(value) && 'rules' in value && '$if' in value
}

function isRuleDefinition(value: unknown): value is RuleDefinition {
  return typeof value === 'function' && RULE_BRAND in value
}

function toRuleEntries(rules: RulesProp | undefined): unknown[] {
  if (rules == null) return []
  if (Array.isArray(rules)) return rules
  if (
    isStandardSchema(rules) ||
    isRuleDefinition(rules) ||
    isConditionalRule(rules)
  ) {
    return [rules]
  }
  if (typeof rules === 'string') return rules.split('|')
  return []
}

function compileLanguage(
  rules: RulesProp | undefined,
  language: string,
  ctx: CompileContext,
  idPrefix: string
): Unit[] {
  if (rules == null) return []

  const units: Unit[] = []
  let index = 0

  const pushFromDefinition = (
    definition: RuleDefinition,
    conditions?: ConditionalProp
  ) => {
    units.push({
      id: `${idPrefix}:${definition.name}:${index++}`,
      kind: 'field',
      owner: ctx.owner,
      language,
      name: definition.name,
      check: definition.check,
      options: definition.options,
      attributes: definition.attributes,
      debounce: definition.debounce,
      deps: depsOf(definition),
      conditions: conditions ?? definition.conditions,
    })
  }

  const addEntry = (entry: unknown, conditions?: ConditionalProp) => {
    if (isStandardSchema(entry)) {
      units.push({
        id: `${idPrefix}:standard_schema:${index++}`,
        kind: 'field',
        owner: ctx.owner,
        language,
        name: 'standard_schema',
        check: makeFieldSchemaCheck(entry),
        attributes: [],
        debounce: 0,
        deps: [],
        conditions,
        schema: entry,
      })
      return
    }

    if (isRuleDefinition(entry)) {
      pushFromDefinition(entry, conditions)
      return
    }

    if (typeof entry === 'string') {
      const parsed = parseRuleString(entry)
      const definition = lookupRule(parsed.name, ctx.config)
      units.push({
        id: `${idPrefix}:${parsed.name}:${index++}`,
        kind: 'field',
        owner: ctx.owner,
        language,
        name: parsed.name,
        check: definition.check,
        options: definition.options,
        attributes: parsed.attributes,
        debounce: parsed.debounce || definition.debounce,
        deps: depsOf(definition, parsed.attributes),
        conditions: conditions ?? parsed.conditions,
      })
      return
    }

    if (isConditionalRule(entry)) {
      for (const inner of toRuleEntries(entry.rules)) {
        addEntry(inner, entry.$if)
      }
      return
    }

    throw new Error(
      'A rule must be a string, a rule definition, a Standard Schema, or a `{ rules, $if }` object'
    )
  }

  for (const entry of toRuleEntries(rules)) {
    addEntry(entry)
  }

  return units
}

function resolveStandardSchemaResult(result: StandardSchemaV1.Result<unknown>) {
  return result.issues?.length ? result.issues[0].message : true
}

// Compiles a `rules` prop (string, array, Standard Schema, rule definition,
// `{ rules, $if }`, or multilingual map) into field units for the owner.
function compileRules(
  rules: TRulesProp | undefined,
  ctx: CompileContext
): Unit[] {
  if (rules == null) return []

  const prefix = String(ctx.owner.path() || 'root')

  if (isMultilingualRules(rules)) {
    const units: Unit[] = []
    for (const [language, langRules] of Object.entries(rules)) {
      units.push(
        ...compileLanguage(langRules, language, ctx, `${prefix}:${language}`)
      )
    }
    return units
  }

  const languages = ctx.owner.languages()
  if (languages.length > 1) {
    const units: Unit[] = []
    for (const language of languages) {
      units.push(
        ...compileLanguage(
          rules as RulesProp,
          language,
          ctx,
          `${prefix}:${language}`
        )
      )
    }
    return units
  }

  return compileLanguage(
    rules as RulesProp,
    languages[0] ?? 'default',
    ctx,
    `${prefix}:default`
  )
}

function getElementType(el$: StatefulElement): SizeTypes {
  const value = el$.model
  return Array.isArray(value)
    ? 'array'
    : value instanceof File
      ? 'file'
      : typeof value === 'number'
        ? 'number'
        : isPlainObject(value)
          ? undefined
          : 'string'
}

function sizeOf(value: any, type: SizeTypes): number | undefined {
  if (value === undefined || value === null) return 0
  switch (type) {
    case 'array':
      return Array.isArray(value) ? value.length : 0
    case 'number':
      return Number(value)
    case 'file':
      return Number(value?.size || 0) / 1000
    case 'string':
      return String(value).length
    default:
      return undefined
  }
}

// Returns a `(unit, el$) => CheckContext` builder closed over the environment,
// shared by the live engine and the Standard Schema export.
function makeRuleContext(options: {
  vueform: VueformInstance
  form$?: {
    find: (path: string) => any
    [key: string]: any
  }
}) {
  const { vueform, form$ } = options

  const buildParams = (
    unit: Unit,
    el$: StatefulElement
  ): ValidatorParams<any> => {
    const ruleOptions = unit.options
    const declared = ruleOptions?.params as readonly string[] | true | undefined
    if (declared === undefined) return {} as ValidatorParams<any>
    if (declared === true) {
      return (unit.attributes?.map((a) => a.value) ||
        []) as ValidatorParams<any>
    }

    const params = declared.reduce<
      Record<string, string | StatefulElement | undefined>
    >((acc, param, i) => {
      const paramName = String(param).replace(/(?:\$\?|[$?])$/, '')
      acc[paramName] = (
        unit.attributes.find((a) => a.name === paramName) ||
        unit.attributes[i] ||
        {}
      ).value

      if (acc[paramName] === undefined && !String(param).endsWith('?')) {
        warn(
          `Param \`${paramName}\` is not provided in \`${unit.name}\` rule of \`${el$.path}\``
        )
      }

      if (
        (String(param).endsWith('$') || String(param).endsWith('$?')) &&
        form$ &&
        typeof acc[paramName] === 'string'
      ) {
        acc[`${paramName}$`] = form$.find(
          replaceWildcards(acc[paramName] as string, unit.owner.path() || '')
        )
      }

      return acc
    }, {})

    return (typeof ruleOptions?.transformParams === 'function'
      ? ruleOptions.transformParams({ params: params as any })
      : params) as unknown as ValidatorParams<any>
  }

  return (unit: Unit, el$: StatefulElement): CheckContext<any> => {
    const type = getElementType(el$)
    const params = buildParams(unit, el$)
    const base: RuleContext = {
      el$,
      form$: form$ as RuleContext['form$'],
      vueform,
      type,
      attribute: el$.genericName,
      filled: (value) => el$.filled(value),
      size: (value, other$) => sizeOf(value, getElementType(other$ ?? el$)),
      getType: getElementType,
      getOther$: (path) =>
        form$?.find(replaceWildcards(path, unit.owner.path() || '')) as
          StatefulElement | undefined,
    }
    return { ...base, params }
  }
}

// Called at read time so a locale switch re-renders without re-running the
// check — and so the locale module doorway resolves the instance current at
// read time, not the one present when the validator was created.
function resolveMessage(options: {
  unit: Unit
  raw?: string
  ctx: CheckContext<any>
  params: ValidatorParams<any>
  type: SizeTypes
  vueform: VueformInstance
  el$: StatefulElement
  form$?: FormContext
}): string {
  const { unit, raw, ctx, params, type, vueform, el$, form$ } = options
  const config = vueform.config
  const locale = vueform.$locale
  const ruleOptions = unit.options as RuleOptions<any> | undefined

  const messageParams = {
    ...(Array.isArray(params) ? {} : params),
    attribute: el$.genericName,
  } as MessageParams<any>

  const messageContext = {
    ...ctx,
    params: messageParams,
  } as MessageContext<any>

  const ruleTag = config.ruleMessageTag(
    unit.name,
    ruleOptions?.typed ? type : undefined
  )

  const msg =
    raw !== undefined
      ? raw
      : typeof ruleOptions?.message === 'function'
        ? ruleOptions.message(messageContext)
        : typeof ruleOptions?.message === 'string'
          ? ruleOptions.message
          : el$.ruleMessages?.[unit.name] ||
            form$?.ruleMessages?.[unit.name] ||
            (locale.tags[ruleTag] ? ruleTag : config.ruleMessageTag('default'))

  const extras =
    typeof ruleOptions?.messageParams === 'function'
      ? ruleOptions.messageParams(messageContext)
      : undefined

  const replacements = { ...messageParams } as Record<string, string | number>
  if (extras) {
    for (const key in extras) {
      const value = extras[key]
      if (value !== undefined) replacements[key] = value
    }
  }

  return locale.replaceParams(locale.t(locale.localize(msg)), replacements)
}

// Cross-field dependency index: changed path → unit states to revalidate.
function makeDepIndex() {
  const index = new Map<string, Set<UnitState>>()

  const add = (state: UnitState, deps: string[]) => {
    state.indexedDeps = deps
    for (const path of deps) {
      let set = index.get(path)
      if (!set) {
        set = new Set()
        index.set(path, set)
      }
      set.add(state)
    }
  }

  const remove = (state: UnitState) => {
    for (const path of state.indexedDeps) {
      const set = index.get(path)
      if (!set) continue
      set.delete(state)
      if (!set.size) index.delete(path)
    }
    state.indexedDeps = []
  }

  const get = (path: string) => index.get(path)

  // Path-relation match for store-level write notifications: a write at
  // `address` covers a dep on `address.city` (subtree replaced) and a write at
  // `address.city` covers a dep on `address` (aggregate changed). The index
  // only holds paths that appear as rule dependencies, so the scan stays tiny.
  const matching = (path: string) => {
    const result = new Set<UnitState>()
    for (const [key, set] of index) {
      if (
        key === path ||
        key === '' ||
        key.startsWith(`${path}.`) ||
        path.startsWith(`${key}.`)
      ) {
        for (const state of set) result.add(state)
      }
    }
    return result
  }

  return { add, remove, get, matching }
}

// Runs the form-level Standard Schema against the whole model, bucketing
// issues by element path (unmatched paths land in the root '' bucket).
function makeValidationSchemaRunner(options: {
  model: Ref<unknown>
  vueform: VueformInstance
  scope?: EffectScope
  find: (path: string) => any
}) {
  const { model, find, vueform, scope } = options

  let schema: StandardSchemaV1 | undefined

  type IssueBuckets = Record<string, string[]>

  // Shallow — consumers track the map as a whole; buckets are replaced atomically.
  const buckets = shallowRef<IssueBuckets>({})

  const validated = ref(false)
  const pending = ref(false)

  // Reactive so `validated` projections can treat a dirtied-but-not-rerun
  // schema as stale.
  const dirty = ref(true)
  let last: IssueBuckets | Promise<IssueBuckets> | undefined
  let runId = 0
  let watching = false

  const applyResult = (
    result: StandardSchemaV1.Result<unknown>,
    id: number
  ): IssueBuckets => {
    const next: IssueBuckets = {}
    for (const issue of normalizeStandardSchemaIssues(result.issues)) {
      const key = issue.path && find(issue.path) ? issue.path : ''
      ;(next[key] ??= []).push(issue.message)
    }
    if (id === runId && !equals(next, buckets.value)) {
      buckets.value = next
    }
    return next
  }

  const startWatchers = () => {
    if (watching) return
    watching = true

    const start = () => {
      if (hasLocaleModule(vueform)) {
        watch(vueform.$locale.locale, () => {
          dirty.value = true
          run()
        })
      }
    }

    if (scope) scope.run(start)
    else start()
  }

  const run = (): IssueBuckets | Promise<IssueBuckets> => {
    if (!dirty.value && last) return last
    if (!schema) return {}

    dirty.value = false
    const id = ++runId
    startWatchers()

    const rawResult = schema['~standard'].validate(model.value)
    pending.value = isThenable(rawResult)

    return (last = isThenable(rawResult)
      ? rawResult.then((result) => {
          pending.value = false
          validated.value = true
          return applyResult(result, id)
        })
      : (() => {
          pending.value = false
          validated.value = true
          return applyResult(rawResult, id)
        })())
  }

  const setSchema = (next?: StandardSchemaV1) => {
    schema = next && toRaw(next)
    dirty.value = true
    last = undefined
    validated.value = false
    if (!next) {
      buckets.value = {}
    } else if (watching) {
      run()
    }
  }

  const markDirty = () => {
    if (!schema) return
    dirty.value = true
    if (watching) run()
  }

  const hasSchema = () => !!schema

  const getSchema = () => schema

  const messages = (path: string): string[] => buckets.value[path] ?? []

  const issuesFor = (path: string, language?: string): Issue[] => {
    const locale = vueform.$locale
    return messages(path).map((message) => ({
      path,
      language,
      rule: 'validation_schema',
      message: locale.replaceParams(locale.t(locale.localize(message)), {}),
    }))
  }

  return {
    validated,
    pending,
    dirty,
    setSchema,
    hasSchema,
    getSchema,
    run,
    markDirty,
    messages,
    issuesFor,
  }
}

function snapshotFacade(value: unknown, find: (path: string) => any) {
  const model = (value && typeof value === 'object' ? value : {}) as Record<
    string,
    any
  >

  const facade: any = {
    model,
    submits: 1,
    find: (path: string) => {
      const live = find(path)
      return {
        path,
        // Data paths key the exported value object; fall back to the element
        // path for detached lookups (they match for plain forms).
        dataPath: live?.dataPath ?? path,
        genericName: live?.genericName ?? path,
        props: live?.props ?? {},
        ruleMessages: live?.ruleMessages,
        model: getByPath(model, path),
        value: getByPath(model, path),
        empty: getByPath(model, path) == null || getByPath(model, path) === '',
        available: true,
        validated: true,
        get form$() {
          return facade
        },
        filled: live?.filled ?? ((v: any) => v != null && v !== ''),
      }
    },
    get: (path: string) => getByPath(model, path),
  }

  return facade
}

// Exposes a validator's compiled units as a `StandardSchemaV1`. `validate`
// runs field units against slices of the provided value using the same context
// builder as the live engine, so parameterized (`min:3`) and cross-field
// (`same:password`) rules resolve against the snapshot. Unit conditions are
// evaluated one-shot against the snapshot (async conditions resolve to their
// initial state). Messages go through the regular resolution chain.
// Interaction-dependent rules (e.g. `captcha`) are skipped, as are owners that
// are currently unavailable in the live form.
function buildStandardSchema(options: {
  vueform: VueformInstance
  form$?: FormContext
  owners: () => ValidationOwner[]
  unitsOf: (owner: ValidationOwner) => Unit[]
  validationSchema: () => StandardSchemaV1 | undefined
  find: (path: string) => any
}): StandardSchemaV1 {
  const skipped = new Set(['captcha'])

  return {
    '~standard': {
      version: 1,
      vendor: 'vueform',
      validate: (value: unknown) => {
        const facade = snapshotFacade(value, options.find)
        const conditions = getConditionsModule(options.vueform)

        const buildContext = makeRuleContext({
          vueform: options.vueform,
          form$: facade,
        })

        // One-shot: evaluate in a temp scope, read the initial (sync) value, stop.
        const isUnitActive = (unit: Unit, el$: any): boolean => {
          if (!unit.conditions || !hasConditionsModule(options.vueform))
            return true
          const tempScope = effectScope(true)
          const active = tempScope.run(() =>
            conditions.makeConditional(
              unit.conditions!,
              ref(facade.model),
              el$,
              { path: unit.owner.path(), form$: facade }
            )
          )!
          const result = active.value
          tempScope.stop()
          return result
        }

        const issues: StandardSchemaV1.Issue[] = []
        const tasks: Promise<void>[] = []

        for (const owner of options.owners()) {
          if (owner.available && !owner.available()) continue

          const units = options.unitsOf(owner)
          if (!units.length) continue

          const path = owner.path()
          const el$ = facade.find(path)

          const byLanguage = new Map<string, Unit[]>()
          for (const unit of units) {
            let group = byLanguage.get(unit.language)
            if (!group) byLanguage.set(unit.language, (group = []))
            group.push(unit)
          }

          for (const [language, group] of byLanguage) {
            const slice =
              language && language !== 'default'
                ? getByPath(value as Record<string, any>, `${path}.${language}`)
                : getByPath(value as Record<string, any>, path)

            const active = group.filter(
              (unit) => !skipped.has(unit.name) && isUnitActive(unit, el$)
            )

            // `nullable` short-circuits the group when the slice is empty,
            // mirroring the live engine.
            if (
              active.some((unit) => unit.name === 'nullable') &&
              !el$.filled(slice)
            ) {
              continue
            }

            const issuePath = [
              ...(path ? path.split('.') : []),
              ...(language !== 'default' ? [language] : []),
            ]

            for (const unit of active) {
              const ctx = buildContext(unit, el$)
              const finish = (resolved: boolean | string) => {
                if (resolved === true) return
                issues.push({
                  message: resolveMessage({
                    unit,
                    raw: typeof resolved === 'string' ? resolved : undefined,
                    ctx,
                    params: ctx.params,
                    type: ctx.type,
                    vueform: options.vueform,
                    el$,
                    form$: facade,
                  }),
                  path: issuePath.length ? issuePath : undefined,
                })
              }

              const result = unit.check(slice, ctx)
              if (isThenable(result)) {
                tasks.push(result.then(finish))
              } else {
                finish(result as boolean | string)
              }
            }
          }
        }

        const validationSchema = options.validationSchema()
        if (validationSchema) {
          const result = toRaw(validationSchema)['~standard'].validate(value)
          const finish = (resolved: StandardSchemaV1.Result<unknown>) => {
            for (const issue of normalizeStandardSchemaIssues(
              resolved.issues
            )) {
              issues.push({
                message: issue.message,
                path: issue.path ? issue.path.split('.') : undefined,
              })
            }
          }
          if (isThenable(result)) tasks.push(result.then(finish))
          else finish(result)
        }

        if (tasks.length) {
          return Promise.all(tasks).then(() =>
            issues.length ? { issues } : { value }
          )
        }

        return issues.length ? { issues } : { value }
      },
    },
  }
}

// Path segments (plain keys or `{ key }` objects per the spec) are joined into
// dot-separated element paths.
function normalizeStandardSchemaIssues(
  issues: readonly StandardSchemaV1.Issue[] | undefined
): NormalizedStandardSchemaIssue[] {
  return (issues ?? []).map((issue) => ({
    message: issue.message,
    path: issue.path?.length
      ? issue.path
          .map((segment) =>
            String(
              typeof segment === 'object' && segment !== null
                ? segment.key
                : segment
            )
          )
          .join('.')
      : undefined,
  }))
}

// The validator hangs off the model store itself under a private symbol, so a
// form and an adopted `useModel` share one validator per store — even across
// Vueform instances — without any module-scope table.
const VALIDATOR: unique symbol = Symbol('vueform.validator')

// Translatable values are language-keyed objects, everything else passes
// through.
function resolveLanguageValue(
  raw: any,
  translatable: boolean,
  language?: string
): any {
  return translatable &&
    language &&
    language !== 'default' &&
    raw &&
    typeof raw === 'object'
    ? raw[language]
    : raw
}

/**
 * Creates the validation module instance: validator creation, the element /
 * form view-models, owner assembly, store attachment, and the `validateOn`
 * policy.
 *
 * @param appConfig The resolved Vueform configuration (rule registry, message
 *   tags), used as the default config for validators.
 */
export function createValidation(vueform: VueformInstance) {
  const config = vueform.config
  /**
   * Associates a validator with a model store.
   *
   * @param store The model store.
   * @param validator The validator to attach.
   */
  const attachValidator = (store: object, validator: Validator) => {
    Object.defineProperty(store, VALIDATOR, {
      value: validator,
      enumerable: false,
      configurable: true,
    })
  }

  /**
   * Returns the validator attached to a model store, if any.
   *
   * @param store The model store.
   */
  const getAttachedValidator = (store: object): Validator | undefined => {
    return (store as { [VALIDATOR]?: Validator })[VALIDATOR]
  }

  /**
   * Assembles a `ValidationOwner` from live bindings — the single owner shape
   * shared by mounted elements (`makeElementValidation`) and headless nodes
   * (the model engine). Language listing and per-language value slicing are
   * translatable-aware here so neither side re-implements them.
   *
   * @param options Owner bindings.
   */
  const makeValidationOwner = (
    options: MakeValidationOwnerOptions
  ): ValidationOwner => {
    return {
      id: options.id,
      get el$() {
        return options.el$()
      },
      path: options.path,
      dataPath: options.dataPath ?? options.path,
      languages: () =>
        options.translatable() ? options.languages() : ['default'],
      getValue: (language) =>
        resolveLanguageValue(options.value(), options.translatable(), language),
      bail: options.bail,
      debounce: options.debounce,
      touched: options.touched,
      available: options.available,
    }
  }

  /**
   * Exposes a form context or model instance as a Standard Schema. The source
   * must own a validator (`form$.toStandardSchema` /
   * `instance.toStandardSchema`).
   *
   * Interaction-dependent rules (e.g. `captcha`) are skipped. See the
   * validation guide for limitations.
   *
   * @param source A form context or model instance.
   */
  const toStandardSchema = (
    source: { toStandardSchema?: () => StandardSchemaV1 } | undefined
  ): StandardSchemaV1 | undefined => {
    return source?.toStandardSchema?.()
  }

  /**
   * Creates a validator: one per model store, shared by the mounted form and
   * the headless engine. Standalone elements (no `form$`) create a local
   * validator.
   *
   * Owns unit compilation, scheduling, the run loop, the validation-schema run,
   * the dependency index (cross-field revalidation), and the view projections.
   *
   * @param options Validator configuration.
   */
  const makeValidator = (options: MakeValidatorOptions): Validator => {
    const { model, find, submits } = options

    const form$ = options.form$
    const conditions = getConditionsModule(vueform)
    const scope = getCurrentScope()

    const owners = new Map<object, ValidationOwner>()
    const fieldUnits = new Map<object, UnitState[]>()

    // Plain-string index of owner data paths → owner ids, kept in sync on
    // register / unregister / repath. `markStale` resolves store writes
    // against it without touching any reactive getter on the hot path.
    const ownerPathIndex = new Map<string, Set<object>>()
    const indexedOwnerPaths = new Map<object, string>()

    const indexOwnerPath = (owner: ValidationOwner) => {
      const path = owner.dataPath?.() ?? owner.path() ?? ''
      const prev = indexedOwnerPaths.get(owner.id)
      if (prev === path) return

      if (prev !== undefined) {
        const set = ownerPathIndex.get(prev)
        if (set) {
          set.delete(owner.id)
          if (!set.size) ownerPathIndex.delete(prev)
        }
      }

      let set = ownerPathIndex.get(path)
      if (!set) ownerPathIndex.set(path, (set = new Set()))
      set.add(owner.id)
      indexedOwnerPaths.set(owner.id, path)
    }

    const unindexOwnerPath = (ownerId: object) => {
      const prev = indexedOwnerPaths.get(ownerId)
      if (prev === undefined) return
      const set = ownerPathIndex.get(prev)
      if (set) {
        set.delete(ownerId)
        if (!set.size) ownerPathIndex.delete(prev)
      }
      indexedOwnerPaths.delete(ownerId)
    }

    // Topology only (register / unregister / setRules / validation schema). Per-run
    // state lives on the units' own refs, so this stays cold on the value-change
    // hot path.
    const structure = ref(0)

    const buildContext = makeRuleContext({
      vueform,
      form$,
    })

    const schemaRunner = makeValidationSchemaRunner({
      model,
      vueform,
      scope,
      find,
    })

    const depIndex = makeDepIndex()

    const statesOf = (ownerId: object, language?: string): UnitState[] => {
      const states = fieldUnits.get(ownerId) ?? []
      return language
        ? states.filter((s) => s.unit.language === language)
        : states
    }

    // ============== UNIT LIFECYCLE ==============

    const resolveDeps = (unit: Unit): string[] => {
      const from = unit.owner.path() || ''
      const deps = unit.deps.map((path) => replaceWildcards(path, from))
      const extra = unit.options?.deps
      if (typeof extra === 'function') {
        const ctx = buildContext(unit, unit.owner.el$)
        deps.push(
          ...extra(ctx as CheckContext).map((path) =>
            replaceWildcards(path, from)
          )
        )
      }
      return deps
    }

    const wireConditions = (state: UnitState) => {
      const unit = state.unit
      if (!unit.conditions || !hasConditionsModule(vueform)) return

      const unitScope = scope
        ? scope.run(() => effectScope())!
        : effectScope(true)
      state.scope = unitScope

      unitScope.run(() => {
        state.active = conditions.makeConditional(
          unit.conditions!,
          toRef(() => form$?.model ?? model.value),
          unit.owner.el$,
          {
            path: toRef(() => unit.owner.path()),
            trigger: toRef(
              () => (unit.owner.el$ as any).props?.conditionsTrigger
            ),
            debounce: toRef(
              () => (unit.owner.el$ as any).props?.conditionsDebounce
            ),
            valueFormat: toRef(
              () => (unit.owner.el$ as any).props?.valueFormat
            ),
            form$,
          }
        )

        if (!form$) return

        watch(state.active, (isActive) => {
          if (isActive) {
            revalidateOwner(unit.owner)
          } else {
            state.status.value = 'valid'
            state.raw.value = undefined
          }
        })
      })
    }

    const disposeStates = (states: UnitState[]) => {
      for (const state of states) {
        clearTimeout(state.timer.value)
        if (state.rejectPending) {
          state.rejectPending(new Error('cancelled'))
          state.rejectPending = undefined
        }
        state.scope?.stop()
        depIndex.remove(state)
      }
    }

    const compileOwner = (
      owner: ValidationOwner,
      rules: Parameters<Validator['setRules']>[1]
    ) => {
      const prev = fieldUnits.get(owner.id)
      if (prev) disposeStates(prev)

      if (rules != null && isMultilingualRules(rules)) {
        const translatable = owner.languages().length > 1
        if (!translatable) {
          throw new Error(
            'Multilingual rules can only be used when `translatable` is `true`'
          )
        }
      }

      const units = compileRules(rules, { config, owner })
      const states = units.map((unit) => {
        const state: UnitState = {
          unit,
          status: ref('idle'),
          raw: ref(undefined),
          validated: ref(false),
          timer: ref(undefined),
          active: alwaysTrue,
          runId: 0,
          indexedDeps: [],
        }
        wireConditions(state)
        depIndex.add(state, resolveDeps(unit))
        return state
      })

      fieldUnits.set(owner.id, states)
      dropView(owner.id)
      structure.value++
    }

    // ================ RUN LOOP =================

    const ownerHasNullable = (states: UnitState[]) =>
      states.some((s) => s.unit.name === 'nullable' && s.active.value)

    // Gates `markStale`'s owner scan: until a result exists there is nothing
    // to invalidate, so registration-time write storms skip the scan entirely.
    let hasAppliedResults = false

    const applyResult = (state: UnitState, result: boolean | string) => {
      state.status.value = result !== true ? 'invalid' : 'valid'
      state.raw.value = typeof result === 'string' ? result : undefined
      state.validated.value = true
      hasAppliedResults = true
    }

    // Completes synchronously whenever it can (no debounce, sync rule) so a
    // keystroke's validation lands in the same reactive flush as the value
    // write — one render instead of one per awaited unit.
    const runUnit = (
      state: UnitState,
      value: any,
      debounce: boolean
    ): boolean | Promise<boolean> => {
      const unit = state.unit
      const el$ = unit.owner.el$
      const delay = debounce
        ? Number(unit.debounce || unit.owner.debounce?.() || 0)
        : 0

      clearTimeout(state.timer.value)
      state.timer.value = undefined
      if (state.rejectPending) {
        state.rejectPending(new Error('cancelled'))
        state.rejectPending = undefined
      }

      const states = fieldUnits.get(unit.owner.id) ?? []
      if (
        !state.active.value ||
        (ownerHasNullable(states) && !el$.filled(value))
      ) {
        state.status.value = 'valid'
        state.raw.value = undefined
        return true
      }

      const execute = (): boolean | Promise<boolean> => {
        state.runId++
        const runId = state.runId
        const ctx = buildContext(unit, el$)
        const rawResult = unit.check(value, ctx)

        if (!isThenable(rawResult)) {
          applyResult(state, rawResult)
          return rawResult === true
        }

        state.status.value = 'pending'
        return rawResult.then((result) => {
          if (runId !== state.runId) throw new Error('cancelled')
          applyResult(state, result)
          return result === true
        })
      }

      if (delay <= 0) {
        return execute()
      }

      return new Promise((resolve, reject) => {
        state.rejectPending = reject
        state.timer.value = setTimeout(() => {
          state.rejectPending = undefined
          state.timer.value = undefined
          try {
            const result = execute()
            if (isThenable(result)) result.then(resolve, reject)
            else resolve(result)
          } catch (error) {
            reject(error)
          }
        }, delay)
      })
    }

    // `bail` stops remaining rules of the same language only; each language is
    // an independent rule set.
    const validateOwner = async (
      owner: ValidationOwner,
      language?: string,
      value?: any
    ) => {
      const states = statesOf(owner.id, language)

      if (schemaRunner.hasSchema()) {
        const result = schemaRunner.run()
        if (isThenable(result)) await result
      }

      const bail = owner.bail?.() ?? false

      const byLanguage = new Map<string, UnitState[]>()
      for (const state of states) {
        let group = byLanguage.get(state.unit.language)
        if (!group) byLanguage.set(state.unit.language, (group = []))
        group.push(state)
      }

      let valid = true

      for (const [lang, group] of byLanguage) {
        const langValue = value !== undefined ? value : owner.getValue(lang)
        let languageValid = true

        for (const state of group) {
          if (!languageValid && bail) continue
          try {
            // Await only actual promises: fully synchronous units complete in
            // the caller's tick, keeping single-flush validation on input.
            const result = runUnit(state, langValue, true)
            const ok = isThenable(result) ? await result : result
            if (!ok) {
              languageValid = false
              valid = false
            }
          } catch (error) {
            if (error instanceof Error && error.message === 'cancelled') {
              languageValid = false
              valid = false
            } else {
              throw error
            }
          }
        }
      }

      return valid && schemaRunner.messages(owner.path()).length === 0
    }

    // Skip untouched, never-validated owners unless the form has submitted.
    // `touched === undefined` (no binding) does not skip.
    const shouldRevalidate = (owner: ValidationOwner) => {
      if (owner.touched && owner.touched() === false) {
        const validated = statesOf(owner.id).some((s) => s.validated.value)
        if (!validated && !submits()) return false
      }
      return true
    }

    const revalidateOwner = async (owner: ValidationOwner) => {
      if (!shouldRevalidate(owner)) return
      const states = statesOf(owner.id)
      for (const state of states) {
        if (!state.active.value) {
          state.status.value = 'valid'
          state.raw.value = undefined
          continue
        }
        const value = owner.getValue(state.unit.language)
        if (ownerHasNullable(states) && !owner.el$.filled(value)) {
          state.raw.value = undefined
        }
        try {
          const result = runUnit(state, value, false)
          if (isThenable(result)) await result
        } catch (error) {
          if (!(error instanceof Error) || error.message !== 'cancelled')
            throw error
        }
      }
    }

    // ============ ISSUE RESOLUTION =============

    // Messages resolve at read time inside cached view computeds, so locale
    // switches re-render without re-running checks.
    const unitIssues = (state: UnitState): Issue[] => {
      if (state.status.value !== 'invalid' || !state.active.value) return []
      const el$ = state.unit.owner.el$
      const ctx = buildContext(state.unit, el$)
      const message = resolveMessage({
        unit: state.unit,
        raw: state.raw.value,
        ctx,
        params: ctx.params,
        type: ctx.type,
        vueform,
        el$,
        form$,
      })
      return [
        {
          path: state.unit.owner.path(),
          language:
            state.unit.language === 'default' ? undefined : state.unit.language,
          rule: state.unit.name,
          message,
        },
      ]
    }

    // ================= VIEWS ==================

    const views = new Map<object, OwnerView>()
    const viewScopes = new Map<object, EffectScope>()

    const makeLanguageView = (
      owner: ValidationOwner,
      language: string
    ): ValidationView => {
      // `structure` is tracked by the calling computeds so they re-collect when
      // units are (re)compiled.
      const states = () => {
        void structure.value
        return statesOf(owner.id, language)
      }

      const invalid = computed(
        () =>
          states().some(
            (s) => s.status.value === 'invalid' && s.active.value
          ) || schemaRunner.messages(owner.path()).length > 0
      )

      const pending = computed(
        () =>
          states().some((s) => s.status.value === 'pending') ||
          (owner.path() === '' && schemaRunner.pending.value)
      )

      const debouncing = computed(() => states().some((s) => s.timer.value))

      // A unit counts as validated only while the model still holds the value
      // its result ran against: `markStale` clears the flag for every write
      // that goes through the model store — element input, store-level
      // `update()` / `load()`, server write-backs — without call sites having
      // to invalidate anything.
      const validated = computed(() => {
        const fields = states().every(
          (s) => s.validated.value || !s.active.value
        )
        // The root owner participates in the validation-schema run; field owners
        // count as validated on their own units (bucketed issues surface
        // through `invalid` / `errors` regardless). A dirtied or re-running
        // schema is stale until its fresh result lands.
        if (schemaRunner.hasSchema() && owner.path() === '') {
          return (
            fields &&
            schemaRunner.validated.value &&
            !schemaRunner.dirty.value &&
            !schemaRunner.pending.value
          )
        }
        return fields
      })

      const required = computed(() =>
        states().some(
          (s) =>
            (s.unit.name === 'required' || s.unit.name === 'accepted') &&
            s.active.value
        )
      )

      const issues = computed(() => {
        const all: Issue[] = []
        for (const state of states()) all.push(...unitIssues(state))
        all.push(
          ...schemaRunner.issuesFor(
            owner.path(),
            language === 'default' ? undefined : language
          )
        )
        return all
      })

      const errors = computed(() => issues.value.map((issue) => issue.message))

      return {
        language: language === 'default' ? undefined : language,
        invalid,
        pending,
        debouncing,
        busy: computed(() => pending.value || debouncing.value),
        required,
        errors,
        issues,
        validated,
        validate: (value) => validateOwner(owner, language, value),
        invalidate: () => {
          for (const state of states()) state.validated.value = false
        },
        reset: () => {
          for (const state of states()) {
            clearTimeout(state.timer.value)
            state.raw.value = undefined
            state.status.value = 'idle'
            state.validated.value = false
          }
        },
      }
    }

    const view = (owner: ValidationOwner): OwnerView => {
      const cached = views.get(owner.id)
      if (cached) return cached

      const viewScope = scope
        ? scope.run(() => effectScope())!
        : effectScope(true)

      const ownerView = viewScope.run(() => {
        const languages: Record<string, ValidationView> = {}
        for (const key of owner.languages()) {
          languages[key] = makeLanguageView(owner, key)
        }

        const all = Object.values(languages)

        return {
          languages,
          invalid: computed(() => all.some((v) => v.invalid.value)),
          pending: computed(() => all.some((v) => v.pending.value)),
          debouncing: computed(() => all.some((v) => v.debouncing.value)),
          validated: computed(() => all.every((v) => v.validated.value)),
          errors: computed(() => all.flatMap((v) => v.errors.value)),
          issues: computed(() => all.flatMap((v) => v.issues.value)),
        } satisfies OwnerView
      })!

      views.set(owner.id, ownerView)
      viewScopes.set(owner.id, viewScope)
      return ownerView
    }

    const dropView = (ownerId: object) => {
      viewScopes.get(ownerId)?.stop()
      viewScopes.delete(ownerId)
      views.delete(ownerId)
    }

    // ========= VALIDATOR-LEVEL ROLLUPS =========

    const issues = computed(() => {
      void structure.value
      const all: Issue[] = []
      let hasRoot = false
      for (const owner of owners.values()) {
        if (owner.path() === '') hasRoot = true
        if (owner.available && !owner.available()) continue
        all.push(...view(owner).issues.value)
      }
      // Root-bucket model issues are included via the root owner; if none is
      // registered, surface them here so headless rollups still see them.
      if (!hasRoot) all.push(...schemaRunner.issuesFor(''))
      return all
    })

    const errors = computed(() => issues.value.map((issue) => issue.message))

    const invalid = computed(() => {
      void structure.value
      if (schemaRunner.messages('').length) return true
      for (const owner of owners.values()) {
        if (owner.available && !owner.available()) continue
        if (view(owner).invalid.value) return true
      }
      return false
    })

    const pending = computed(() => {
      void structure.value
      if (schemaRunner.pending.value) return true
      for (const owner of owners.values()) {
        if (view(owner).pending.value) return true
      }
      return false
    })

    const debouncing = computed(() => {
      void structure.value
      for (const owner of owners.values()) {
        if (view(owner).debouncing.value) return true
      }
      return false
    })

    // ============== PUBLIC SURFACE =============

    const register: Validator['register'] = (owner) => {
      if (owners.get(owner.id) === owner) return
      owners.set(owner.id, owner)
      indexOwnerPath(owner)
      structure.value++
    }

    const unregister: Validator['unregister'] = (owner) => {
      const states = fieldUnits.get(owner.id)
      if (states) disposeStates(states)
      fieldUnits.delete(owner.id)
      owners.delete(owner.id)
      unindexOwnerPath(owner.id)
      dropView(owner.id)
      structure.value++
    }

    const setRules: Validator['setRules'] = (owner, rules) => {
      owners.set(owner.id, owner)
      indexOwnerPath(owner)
      compileOwner(owner, rules)
    }

    const setValidationSchema: Validator['setValidationSchema'] = (schema) => {
      schemaRunner.setSchema(schema)
      structure.value++
    }

    const validate: Validator['validate'] = async (owner, language) => {
      if (owner) return validateOwner(owner, language)

      if (schemaRunner.hasSchema()) {
        const result = schemaRunner.run()
        if (isThenable(result)) await result
      }

      let valid = true
      for (const registered of owners.values()) {
        if (registered.available && !registered.available()) continue
        const ok = await validateOwner(registered, language)
        if (!ok) valid = false
      }
      return valid && schemaRunner.messages('').length === 0
    }

    const invalidate: Validator['invalidate'] = (owner) => {
      for (const state of statesOf(owner.id)) {
        state.validated.value = false
      }
    }

    const reset: Validator['reset'] = (owner) => {
      for (const state of statesOf(owner.id)) {
        clearTimeout(state.timer.value)
        if (state.rejectPending) {
          state.rejectPending(new Error('cancelled'))
          state.rejectPending = undefined
        }
        state.raw.value = undefined
        state.status.value = 'idle'
        state.validated.value = false
      }
    }

    const onChange: Validator['onChange'] = (path) => {
      schemaRunner.markDirty()

      const dependents = depIndex.get(path)
      if (!dependents) return

      // Dedupe by owner — several units of the same owner may depend on the
      // changed path, but revalidation always runs the whole owner.
      const dependentOwners = new Set<ValidationOwner>()
      for (const state of dependents) dependentOwners.add(state.unit.owner)
      for (const owner of dependentOwners) revalidateOwner(owner)
    }

    const markOwnersAt = (path: string) => {
      const ids = ownerPathIndex.get(path)
      if (!ids) return
      for (const id of ids) {
        for (const state of statesOf(id)) {
          state.validated.value = false
        }
      }
    }

    // Clears the `validated` flags of every owner whose data lives at, above,
    // or below the written path: an owner above holds the written value inside
    // its aggregate, an owner below sits inside the replaced subtree. Ancestors
    // resolve via an O(depth) prefix walk over the plain-string path index (no
    // reactive reads); descendants via a key scan that only exists for subtree
    // writes to match. Skipped entirely until any result exists, so
    // registration-time write storms cost nothing.
    const markStale = (dataPath: string) => {
      if (!hasAppliedResults) return

      markOwnersAt('')

      if (!dataPath) return

      const parts = dataPath.split('.')
      let prefix = ''
      for (const part of parts) {
        prefix = prefix ? `${prefix}.${part}` : part
        markOwnersAt(prefix)
      }

      const childPrefix = `${dataPath}.`
      for (const key of ownerPathIndex.keys()) {
        if (key.startsWith(childPrefix)) markOwnersAt(key)
      }
    }

    // Store-driven counterpart of `onChange`: fired for every write that goes
    // through the model store, so external mutations (`update()` / `load()` /
    // server write-backs) invalidate affected results, dirty the schema, and
    // revalidate cross-field dependents exactly like element input does.
    const onModelWrite = (dataPath: string) => {
      markStale(dataPath)
      schemaRunner.markDirty()

      const dependents = depIndex.matching(dataPath)
      if (!dependents.size) return

      const dependentOwners = new Set<ValidationOwner>()
      for (const state of dependents) dependentOwners.add(state.unit.owner)
      for (const owner of dependentOwners) revalidateOwner(owner)
    }

    const wired = !!options.store
    if (options.store) {
      const unsubscribe = options.store.onWrite(onModelWrite)
      if (scope) scope.run(() => onScopeDispose(unsubscribe))
    }

    const repath: Validator['repath'] = (owner) => {
      indexOwnerPath(owner)
      for (const state of statesOf(owner.id)) {
        depIndex.remove(state)
        depIndex.add(state, resolveDeps(state.unit))
      }
    }

    const toStandardSchema = () =>
      buildStandardSchema({
        vueform,
        form$,
        owners: () => [...owners.values()],
        unitsOf: (owner) => statesOf(owner.id).map((s) => s.unit),
        validationSchema: () => schemaRunner.getSchema(),
        find,
      })

    return {
      issues,
      errors,
      invalid,
      pending,
      debouncing,
      wired,
      register,
      unregister,
      setRules,
      setValidationSchema,
      validate,
      invalidate,
      reset,
      onChange,
      repath,
      view,
      toStandardSchema,
    }
  }

  /**
   * The form-side validation view-model: installs the resolved form-level
   * Standard Schema on the validator and exposes the form's structured issues
   * and Standard Schema export.
   *
   * Must be called inside component setup — the schema watcher binds to the
   * component scope.
   *
   * @param options Form bindings.
   */
  const makeFormValidation = (options: MakeFormValidationOptions) => {
    const { validator, validationSchema } = options

    watch(
      validationSchema,
      (schema) => {
        validator.setValidationSchema(schema)
      },
      { immediate: true }
    )

    const issues = computed<Issue[]>(() => validator.issues.value)

    const exportStandardSchema = () => validator.toStandardSchema()

    return {
      issues,
      toStandardSchema: exportStandardSchema,
    }
  }

  /**
   * Whether a `validateOn` trigger list includes any of the given events.
   *
   * @param validateOn The resolved trigger list.
   * @param events One or more trigger events to test.
   */
  const hasValidateOnTrigger = (
    validateOn: string[] | undefined,
    events: string | string[]
  ): boolean => {
    if (!validateOn) return false
    return toArray(events).some((event) => validateOn.includes(event))
  }

  /**
   * The single interpretation of when an element validates as the user
   * interacts (typing / changing values):
   *
   * - never without rules, or when the form suppresses validation
   * - always once the form has been submitted
   * - when already invalid (so errors clear as they are fixed)
   * - on the `change` trigger
   * - on the `blur` trigger once the element has been touched
   *
   * Standalone elements (no form) validate live whenever they have rules.
   *
   * @param input Policy inputs.
   */
  const shouldValidateLive = (input: {
    hasRules: boolean
    validateOn: string[] | undefined
    invalid: boolean
    touched: boolean | undefined
    form?: {
      validationDisabled: boolean
      submitted: boolean
    }
  }): boolean => {
    const { hasRules, validateOn, invalid, touched, form } = input

    if (!hasRules) return false
    if (!form) return true
    if (form.validationDisabled) return false
    if (form.submitted) return true

    return (
      !!validateOn?.length &&
      (invalid ||
        hasValidateOnTrigger(validateOn, 'change') ||
        (hasValidateOnTrigger(validateOn, 'blur') && !!touched))
    )
  }

  /**
   * Whether a blur event should trigger validation of the current language:
   * only before the first submit (afterwards live validation covers it), and
   * only when `blur` is among the triggers.
   *
   * @param input Blur policy inputs.
   */
  const shouldValidateOnBlur = (input: {
    validateOn: string[] | undefined
    submitted: boolean
  }): boolean => {
    return !input.submitted && hasValidateOnTrigger(input.validateOn, 'blur')
  }

  /**
   * The element validation view-model: owns the element's relationship with the
   * validator (owner identity, registration, rule compilation, per-language
   * views) and interprets validation policy (`validateOn`, blur / input
   * intents). `useData` composes its projections with children-aggregation;
   * components fire intents instead of re-implementing policy.
   *
   * Must be called inside component setup — its watchers bind to the component
   * scope.
   *
   * @param options Live element bindings.
   */
  const makeElementValidation = (options: MakeElementValidationOptions) => {
    const {
      form$,
      isRoot,
      store,
      rules,
      path,
      model,
      value,
      languages,
      translatable,
      language,
      touched,
      available,
      isContainer,
      validateOn,
      el$,
    } = options

    const validation = shallowReactive<Record<string, ValidationView>>({})

    // Units are keyed by this object so list reorders keep validation state.
    const owner: ValidationOwner = makeValidationOwner({
      id: {},
      path: () => path.value,
      dataPath: options.dataPath
        ? () => options.dataPath!.value
        : () => path.value,
      el$,
      translatable: () => translatable.value,
      languages: () => Object.keys(languages.value || {}),
      value: () => model.value,
      bail: () => !!(el$() as any).props?.bail,
      debounce: () => Number((el$() as any).props?.debounce || 0),
      touched: () => touched?.value as boolean,
      available: () => available.value,
    })

    const validator: Validator = (() => {
      if (form$?.validator) return form$.validator
      if (store) {
        const existing = getAttachedValidator(store)
        if (existing) return existing
      }
      const created = makeValidator({
        model: toRef(() =>
          isRoot ? model.value : (form$?.model ?? model.value)
        ),
        form$,
        store:
          store && 'onWrite' in store
            ? (store as MakeValidatorOptions['store'])
            : undefined,
        find: (p) => form$?.find?.(p),
        submits: () => form$?.submits ?? false,
      })
      if (store) attachValidator(store, created)
      return created
    })()

    const hasOwnValidation = computed(() => !!rules.value || isRoot)

    const shouldValidate = computed(() =>
      shouldValidateLive({
        hasRules: hasOwnValidation.value,
        validateOn: validateOn.value,
        invalid: options.invalid(),
        touched: touched?.value,
        form: form$
          ? {
              validationDisabled: !!form$.validationDisabled,
              submitted: !!form$.submits,
            }
          : undefined,
      })
    )

    const currentValidation = toRef(
      () =>
        validation[
          translatable.value && language.value ? language.value : 'default'
        ] || ({} as Partial<ValidationView>)
    )

    const success = computed(
      () =>
        touched?.value !== false &&
        (!hasOwnValidation.value ||
          (!!currentValidation.value.validated?.value &&
            !currentValidation.value.invalid?.value))
    )

    const required = computed(() => !!currentValidation.value.required?.value)

    const invalidLanguages =
      translatable === alwaysFalse
        ? emptyLanguages
        : computed(() => {
            const result = new Set<string>()
            if (!translatable.value) return result
            for (const [lang, view] of Object.entries(validation)) {
              if (lang !== 'default' && view.invalid.value) result.add(lang)
            }
            return result
          })

    const ownInvalid = computed(() =>
      Object.values(validation).some(({ invalid }) => invalid.value)
    )

    const ownPending = computed(() =>
      Object.values(validation).some(({ pending }) => pending.value)
    )

    const ownDebouncing = computed(() =>
      Object.values(validation).some(({ debouncing }) => debouncing.value)
    )

    const ownValidated = computed(() =>
      Object.values(validation).every(({ validated }) => validated.value)
    )

    const ownRuleErrors: ComputedRef<string[]> = computed(() =>
      Object.keys(validation).reduce<string[]>(
        (all, key) => [
          ...all,
          ...validation[key].errors.value.map((e: string) =>
            translatable.value ? `${e} (${languages.value?.[key] || key})` : e
          ),
        ],
        []
      )
    )

    const validateSelf = async () => {
      if (!hasOwnValidation.value) return true
      return validator.validate(owner)
    }

    const validateCurrent = async () =>
      !hasOwnValidation.value ||
      !currentValidation.value.validate ||
      (await currentValidation.value.validate(value.value))

    const invalidateSelf = () => validator.invalidate(owner)

    const unvalidateSelf = () => validator.reset(owner)

    const notifyChange = () => validator.onChange(path.value)

    const onUserInput = () => {
      if (shouldValidate.value) options.validate()
    }

    const onBlur = () => {
      if (
        shouldValidateOnBlur({
          validateOn: validateOn.value,
          submitted: !!form$?.submits,
        })
      ) {
        validateCurrent()
      }
    }

    const syncViews = () => {
      const ownerView = validator.view(owner)
      for (const key of Object.keys(validation)) {
        if (!(key in ownerView.languages)) delete validation[key]
      }
      for (const [key, view] of Object.entries(ownerView.languages)) {
        validation[key] = view
      }
    }

    const initValidation = () => {
      if (
        !isContainer.value &&
        !translatable.value &&
        isMultilingualRules(rules.value)
      ) {
        throw new Error(
          'Multilingual rules can only be used when `translatable` is `true`'
        )
      }

      validator.register(owner)
      validator.setRules(owner, rules.value as TRulesProp | undefined)
      syncViews()
    }

    const destroyValidation = () => {
      validator.unregister(owner)
      Object.keys(validation).forEach((key) => delete validation[key])
    }

    watch(rules, () => {
      destroyValidation()
      initValidation()
    })

    // Recompile when the language set changes so translatable elements pick up
    // newly available languages (and drop removed ones) without a rules change.
    watch(
      () =>
        translatable.value
          ? Object.keys(languages.value || {}).join('\0')
          : 'default',
      (next, prev) => {
        if (next === prev) return
        destroyValidation()
        initValidation()
      }
    )

    // Keep the validator's dependency index aligned with the element's path
    // (list reorders re-path elements without re-registering them).
    watch(path, () => validator.repath(owner))

    if (isContainer.value) {
      let unwatchModel: (() => void) | null = null

      // Keyed to the element's own rules: form-level schema revalidation is
      // notification-driven (`onChange`), so containers without own rules don't
      // each need a deep model watcher.
      watch(
        rules,
        (newRules) => {
          if (newRules && !unwatchModel) {
            unwatchModel = watch(
              model,
              () => {
                // Store-wired validators hear about writes from the store
                // itself; only unwired (standalone) ones need the manual nudge.
                if (!validator.wired) notifyChange()
                if (shouldValidate.value) validateSelf()
              },
              { deep: true }
            )
          } else if (!newRules && unwatchModel) {
            unwatchModel()
            unwatchModel = null
          }
        },
        { immediate: true }
      )
    }

    return {
      validator,
      owner,
      validation,
      currentValidation,
      hasOwnValidation,
      shouldValidate,
      success,
      required,
      invalidLanguages,
      ownInvalid,
      ownPending,
      ownDebouncing,
      ownValidated,
      ownRuleErrors,
      validateSelf,
      validateCurrent,
      invalidateSelf,
      unvalidateSelf,
      notifyChange,
      onUserInput,
      onBlur,
      initValidation,
      destroyValidation,
    }
  }

  return {
    makeValidator,
    makeFormValidation,
    makeElementValidation,
    makeValidationOwner,
    attachValidator,
    getAttachedValidator,
    toStandardSchema,
    hasValidateOnTrigger,
    shouldValidateLive,
    shouldValidateOnBlur,
  }
}
