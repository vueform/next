import {
  computed,
  effectScope,
  isRef,
  markRaw,
  ref,
  toRef,
  unref,
  watch,
  type ComputedRef,
  type EffectScope,
  type Ref,
  type WatchStopHandle,
} from 'vue'
import {
  type VueformInstance,
  getAttachedValidationSchema,
} from '@core/helpers'
import {
  getConditionsModule,
  hasConditionsModule,
} from '@core/modules/conditions'
import { getExpressionModule } from '@core/modules/expression'
import {
  getValidationModule,
  hasValidationModule,
  type TRulesProp,
  type Validator,
  type ValidationOwner,
} from '@core/modules/validation'
import {
  type ElementName,
  type FormSchema,
  type LanguagesProp,
  type StatefulElement,
  type VueformComponent,
  type StandardSchemaV1,
} from '@core/types'
import {
  alwaysTrue,
  clone,
  equals,
  get as getByPath,
  isEmptyValue,
  isPlainObject,
  kebabToPascal,
  mergeOrReplace,
  schemaEntries,
  set as setByPath,
  unset,
  warn,
  isDev,
} from '@core/utils'
import {
  getModelStore,
  hasModelStore,
  makeModelStore,
  setModelStore,
} from './modelStore'
import type {
  ModelInstance,
  ModelModule,
  ModelNode,
  ModelStore,
  RootModel,
  SchemaIndex,
} from './types'

type ReconciledNodePrev = Pick<
  ModelNode,
  'dataPath' | 'props' | 'translatable' | 'rules' | 'conditions'
>

type BuildModelOptions = {
  vueform: VueformInstance
}

type SchemaIndexDiff = {
  added: ModelNode[]
  removed: ModelNode[]
  changed: { node: ModelNode; prev: ReconciledNodePrev }[]
  model: Record<string, any>
}

// ============ SCHEMA INDEX ============

/**
 * Configuration options for `makeRootModel`.
 */
type MakeRootModelOptions = {
  /**
   * The reactive ref bound to the form's `v-model`, used as the initial source
   * of truth for the root model. When it holds a `useModel` instance, its store
   * is adopted directly (shared data, no clone or v-model sync).
   */
  modelValue: Ref<any>

  /**
   * Whether the component has an active `v-model` binding (raw prop detection,
   * supplied by the component adapter). Adopted stores override it to `false`
   * internally — the store is the single source of truth, so no v-model
   * emission happens.
   */
  hasVModel: Ref<boolean>

  /**
   * The form's component context, recorded on adopted stores (backing
   * `instance.submit()`) and passed to `change` events. Opaque to the module.
   */
  context$: any

  /**
   * Whether any callback is registered for the given event. When provided, the
   * notify watcher skips the model snapshot (a deep clone of the whole model)
   * on flushes where neither a `v-model` nor a `change` listener would consume
   * it. When omitted, a snapshot is taken on every flush.
   */
  hasListeners?: (e: 'change') => boolean

  /**
   * Applies an inbound external `modelValue` change to the root model (e.g. the
   * form context's `update`).
   *
   * @param data The new (cloned) model value from outside.
   */
  applyInbound: (data: any) => void

  /**
   * Event emitter for firing model change events during synchronization: the
   * `change` event on value changes and `update:modelValue` for v-model sync.
   */
  fire: {
    (e: 'change', newValue: any, oldValue: any, context$: any): any
    (e: 'update:modelValue', value: any): any
  }
}

/**
 * Configuration options for `makeChildModel`.
 */
type MakeChildModelOptions = {
  /**
   * The parent model surface the element reads from and writes to — typed
   * structurally so the module never learns component container semantics.
   */
  parent: {
    /**
     * The parent's model object holding this element's slice.
     */
    model: Ref<any>

    /**
     * Writes a value at an absolute data path within the root model.
     *
     * @param path The absolute dot-notation data path.
     * @param value The value to set.
     */
    update: (path: string, value: any) => void

    /**
     * Subscribes to changes at an absolute data path (and its descendants),
     * returning an unsubscribe function.
     *
     * @param path The absolute dot-notation data path.
     * @param cb The callback invoked when the path's subtree changes.
     */
    subscribe: (path: string, cb: () => void) => () => void
  }

  /**
   * The element's name, used as the key into the parent's model.
   */
  name: Ref<ElementName>

  /**
   * The element's absolute data path within the root model, used to subscribe
   * to changes of its slice (and its descendants).
   */
  dataPath: Ref<string>

  /**
   * The external `v-model` ref bound by the parent, if any.
   */
  modelValue?: Ref<any>

  /**
   * Whether the element is currently available (visible). Unavailable elements
   * skip outbound model synchronization.
   */
  available?: Ref<boolean>

  /**
   * Whether the element's data is flattened into the parent rather than nested
   * under its own `name` key. Flat containers project a scoped model from their
   * own children's keys and subscribe to those keys individually instead of
   * their own data path (which equals the parent's).
   */
  flat: Ref<boolean>

  /**
   * The element's registered child contexts. Required for flat containers,
   * whose scoped model is built from these children's keys within the parent's
   * model. Opaque to the module beyond `isFlatContainer` / `name` / `model`.
   */
  children?: Ref<any[]>

  /**
   * Whether the component has an active `v-model` binding (raw prop detection,
   * supplied by the component adapter).
   */
  hasVModel: Ref<boolean>

  /**
   * The element's component context passed to `change` events. Opaque to the
   * module.
   */
  context$: any

  /**
   * Event emitter for firing model change events during synchronization: the
   * `change` event on value changes and `update:modelValue` for v-model sync.
   */
  fire: {
    (e: 'change', newValue: any, oldValue: any, context$: any): any
    (e: 'update:modelValue', value: any): any
  }

  /**
   * Writes the given value back to the parent's model for this element
   * (typically the element's own `update` method), also used to apply inbound
   * `v-model` changes.
   *
   * @param data The new value to set.
   */
  update: (data: any) => void

  /**
   * Whether any callback is registered for the given event. When provided and
   * neither a `v-model` nor a `change` listener would consume the notification,
   * the notify watcher skips firing events and skips the model snapshot (a deep
   * clone of the element's slice) on flushes where the value did not change.
   * When omitted, the full notify path runs on every flush.
   */
  hasListeners?: (e: 'change') => boolean
}

function resolveComponentDef(
  props: Record<string, any>,
  vueform: VueformInstance
): VueformComponent | undefined {
  if (props.component) {
    return typeof props.component === 'string'
      ? vueform.config.components?.[props.component]
      : (props.component as VueformComponent)
  }

  if (!props.type) return undefined

  return vueform.config.components?.[`Vf${kebabToPascal(props.type)}`]
}

function hasModelProp(def: VueformComponent | undefined): boolean {
  const props = (def as any)?.props
  if (!props) return false
  return Array.isArray(props)
    ? props.includes('modelValue')
    : 'modelValue' in props
}

function resolveLanguageKeys(
  props: Record<string, any>,
  options: BuildModelOptions
): string[] {
  const languages: LanguagesProp | undefined =
    props.languages ?? options.vueform.config.languages
  return Object.keys(languages || {})
}

function expandTranslatable(value: any, languages: string[]) {
  const result: Record<string, any> = {}
  for (const lang of languages) {
    result[lang] = isPlainObject(value)
      ? (value[lang] ?? null)
      : (value ?? null)
  }
  return result
}

// Mirrors the mounted displayName → label → floating → … → name chain for
// statically resolvable props (functions fall through to the next candidate).
function genericNameOf(
  props: Record<string, any>,
  vueform: VueformInstance
): string {
  for (const key of [
    'displayName',
    'label',
    'floating',
    'floatLabel',
    'ifta',
    'placeholder',
  ]) {
    const value = props[key]

    if (typeof value === 'string' && value) return value

    if (isPlainObject(value)) {
      // Locale-keyed prop objects resolve through the locale module; without
      // it the inert surface falls back to the first entry.
      const localized = vueform.$locale.localize(
        value as Record<string, string>
      )
      if (typeof localized === 'string' && localized) return localized
    }
  }

  return String(props.name)
}

function makeNode(
  props: Record<string, any>,
  facts: Pick<
    ModelNode,
    'path' | 'dataPath' | 'parent' | 'flat' | 'array' | 'nullValue'
  > & { translatable?: boolean; expressionable?: boolean },
  vueform: VueformInstance
): ModelNode {
  return {
    path: facts.path,
    dataPath: facts.dataPath,
    parent: facts.parent,
    flat: facts.flat,
    array: facts.array,
    type: props.type,
    props,
    nullValue: facts.nullValue,
    translatable: facts.translatable === true,
    submit: props.submit !== false,
    expressionable: facts.expressionable === true,
    genericName: genericNameOf(props, vueform),
    rules: props.rules,
    conditions: props.conditions,
  }
}

function joinPath(parent: string, segment: string): string {
  return parent ? `${parent}.${segment}` : segment
}

function buildEntry(
  props: Record<string, any>,
  options: BuildModelOptions,
  parentPath: string,
  parentDataPath: string,
  parent: ModelNode | undefined,
  register: (node: ModelNode) => void
): { node: ModelNode; value: any; nullValue: any; flat: boolean } | undefined {
  const name = String(props.name)
  const path = joinPath(parentPath, name)

  const def = resolveComponentDef(props, options.vueform)
  const childrenMeta = def?.children?.(props)

  if (childrenMeta) {
    const array = !!childrenMeta.array
    const flat = !array && !!childrenMeta.flat
    const dataPath = flat ? parentDataPath : joinPath(parentDataPath, name)

    const valueAcc: any = array ? [] : {}
    const nullAcc: any = array ? [] : {}

    const node = makeNode(
      props,
      {
        path,
        dataPath,
        parent,
        flat,
        array,
        nullValue: nullAcc,
      },
      options.vueform
    )
    node.children = new Map()
    register(node)

    for (const [childName, childProps] of Object.entries(
      childrenMeta.entries
    )) {
      const child = buildEntry(
        { ...childProps, name: childName },
        options,
        path,
        dataPath,
        node,
        register
      )
      if (!child) continue

      node.children.set(childName, child.node)

      if (array) {
        valueAcc.push(child.value)
        nullAcc.push(child.nullValue)
      } else if (child.flat) {
        Object.assign(valueAcc, child.value)
        Object.assign(nullAcc, child.nullValue)
      } else {
        valueAcc[childName] = child.value
        nullAcc[childName] = child.nullValue
      }
    }

    const value =
      props.modelValue !== undefined
        ? mergeOrReplace(valueAcc, clone(props.modelValue))
        : valueAcc

    return { node, value, nullValue: nullAcc, flat }
  }

  // Leaves without metadata are only data-carrying when they declare a
  // `modelValue` prop (skips buttons, content, and other static elements).
  if (!def?.nullValue && !hasModelProp(def)) return undefined

  const translate = props.translate === true
  const languages = translate ? resolveLanguageKeys(props, options) : []

  const rawNull = def?.nullValue ? def.nullValue(props) : null
  const nullValue = translate ? expandTranslatable(rawNull, languages) : rawNull

  let value: any

  if (props.modelValue !== undefined) {
    value = translate
      ? { ...clone(nullValue), ...clone(props.modelValue) }
      : clone(props.modelValue)
  } else if (props.default !== undefined) {
    if (translate) {
      const defaults: Record<string, any> = {}
      for (const lang of languages) {
        defaults[lang] =
          clone(
            isPlainObject(props.default) ? props.default[lang] : props.default
          ) ?? nullValue[lang]
      }
      value = defaults
    } else {
      value =
        typeof props.default === 'number'
          ? props.default // is this branch needed?
          : (clone(props.default) ?? clone(nullValue))
    }
  } else {
    value = clone(nullValue)
  }

  const node = makeNode(
    props,
    {
      path,
      dataPath: joinPath(parentDataPath, name),
      parent,
      flat: false,
      array: false,
      nullValue,
      translatable: translate,
      expressionable: def?.expressionable === true,
    },
    options.vueform
  )
  register(node)

  return { node, value, nullValue, flat: false }
}

// ============== ENGINE ===============

function buildSchemaIndex(
  schema: FormSchema | undefined,
  options: BuildModelOptions
): SchemaIndex {
  const root = new Map<string, ModelNode>()
  const nodes = new Map<string, ModelNode>()
  const model: Record<string, any> = {}
  const nullModel: Record<string, any> = {}

  const register = (node: ModelNode) => {
    nodes.set(node.path, node)
  }

  for (const [name, props] of schemaEntries(schema)) {
    const entry = buildEntry(
      { ...props, name },
      options,
      '',
      '',
      undefined,
      register
    )
    if (!entry) continue

    root.set(name, entry.node)

    if (entry.flat) {
      Object.assign(model, entry.value)
      Object.assign(nullModel, entry.nullValue)
    } else {
      model[name] = entry.value
      nullModel[name] = entry.nullValue
    }
  }

  return { root, nodes, model, nullModel, version: ref(0) }
}

function reconcileSchemaIndex(
  index: SchemaIndex,
  schema: FormSchema | undefined,
  options: BuildModelOptions
): SchemaIndexDiff {
  const fresh = buildSchemaIndex(schema, options)

  const added: ModelNode[] = []
  const removed: ModelNode[] = []
  const changed: { node: ModelNode; prev: ReconciledNodePrev }[] = []

  const reusedOf = new Map<ModelNode, ModelNode>()

  // First pass: reuse or adopt each fresh node (parents walk before children).
  for (const [path, freshNode] of fresh.nodes) {
    const existing = index.nodes.get(path)

    if (!existing) {
      reusedOf.set(freshNode, freshNode)
      added.push(freshNode)
      continue
    }

    changed.push({
      node: existing,
      prev: {
        dataPath: existing.dataPath,
        props: existing.props,
        translatable: existing.translatable,
        rules: existing.rules,
        conditions: existing.conditions,
      },
    })

    existing.dataPath = freshNode.dataPath
    existing.flat = freshNode.flat
    existing.array = freshNode.array
    existing.type = freshNode.type
    existing.props = freshNode.props
    existing.nullValue = freshNode.nullValue
    existing.translatable = freshNode.translatable
    existing.submit = freshNode.submit
    existing.expressionable = freshNode.expressionable
    existing.genericName = freshNode.genericName
    existing.rules = freshNode.rules
    existing.conditions = freshNode.conditions

    existing.available = undefined

    reusedOf.set(freshNode, existing)
  }

  // Second pass: rewire parent/children references to the reused objects.
  for (const freshNode of fresh.nodes.values()) {
    const target = reusedOf.get(freshNode)!

    target.parent = freshNode.parent
      ? reusedOf.get(freshNode.parent)
      : undefined

    if (freshNode.children) {
      const children = new Map<string, ModelNode>()
      for (const [name, child] of freshNode.children) {
        children.set(name, reusedOf.get(child)!)
      }
      target.children = children
    } else {
      target.children = undefined
    }
  }

  // Walk-created nodes the new schema no longer produces. Mounted-created
  // nodes survive — registration adds and removes them.
  const mountedSurvivors: ModelNode[] = []

  for (const [path, node] of index.nodes) {
    if (fresh.nodes.has(path)) continue
    if (node.mounted) {
      mountedSurvivors.push(node)
    } else {
      removed.push(node)
    }
  }

  index.nodes.clear()
  for (const [path, freshNode] of fresh.nodes) {
    index.nodes.set(path, reusedOf.get(freshNode)!)
  }
  for (const node of mountedSurvivors) {
    index.nodes.set(node.path, node)
  }

  index.root.clear()
  for (const [name, freshNode] of fresh.root) {
    index.root.set(name, reusedOf.get(freshNode)!)
  }

  // Swap nullModel contents in place — the store holds the same object.
  for (const key of Object.keys(index.nullModel)) {
    delete index.nullModel[key]
  }
  Object.assign(index.nullModel, fresh.nullModel)

  index.version.value++

  return { added, removed, changed, model: fresh.model }
}

// ============= INSTANCE ===============

function reconcileData(store: ModelStore, diff: SchemaIndexDiff) {
  const seed = (node: ModelNode) => {
    // Flat containers own no slice — their children live at the parent level.
    if (node.flat) {
      for (const child of node.children?.values() ?? []) seed(child)
      return
    }

    if (store.get(node.dataPath) !== undefined) return

    const value = getByPath(diff.model, node.dataPath)
    store.set(node.dataPath, value)
    setByPath(store.initialModel.value, node.dataPath, clone(value))
  }

  const drop = (node: ModelNode) => {
    if (node.flat) {
      for (const child of node.children?.values() ?? []) drop(child)
      return
    }

    store.unregister(node.dataPath)
    unset(store.initialModel.value, node.dataPath)
  }

  // Only top-most added/removed nodes are processed — their subtree values
  // travel with them.
  const added = new Set(diff.added)
  for (const node of diff.added) {
    if (node.parent && added.has(node.parent)) continue
    seed(node)
  }

  const removed = new Set(diff.removed)
  for (const node of diff.removed) {
    if (node.parent && removed.has(node.parent)) continue
    drop(node)
  }
}

// Must run inside the instance's effect scope so availability computeds and
// async condition watchers are disposed by `destroy()`.
function makeModelEngine(options: {
  index: SchemaIndex
  store: ModelStore
  vueform: VueformInstance
  validationSchema?: StandardSchemaV1
  scope: EffectScope
}) {
  const { index, store, vueform, scope } = options
  const config = vueform.config

  const languages: LanguagesProp = config.languages ?? {}

  // Headless models read translatable values in the first language; the
  // mounted form owns language switching.
  const language = Object.keys(languages)[0]

  const conditionsModule = getConditionsModule(vueform)

  const availability = new Map<ModelNode, Ref<boolean> | ComputedRef<boolean>>()
  const contexts = new Map<ModelNode, StatefulElement>()
  const submits = ref(false)
  const version = index.version

  const nodeOwners = new Map<ModelNode, ValidationOwner>()

  const {
    makeValidator,
    makeValidationOwner,
    attachValidator,
    getAttachedValidator,
  } = getValidationModule(vueform)

  // Assigned after the facade exists; context getters read it lazily so
  // `contextOf` can be defined first.
  let validator: Validator

  const readValue = (node: ModelNode): any => {
    if (node.flat) {
      const result: Record<string, any> = {}
      for (const [name, child] of node.children ?? []) {
        if (child.flat) {
          Object.assign(result, readValue(child))
        } else {
          result[name] = store.get(child.dataPath)
        }
      }
      return result
    }

    return node.dataPath ? store.get(node.dataPath) : store.model.value
  }

  const makeFilled = (node: ModelNode) => {
    if (node.children && !node.array) {
      return (value: any) => {
        for (const [name, child] of node.children!) {
          if (!isAvailable(child)) continue
          if (!(contextOf(child) as any).filled(value?.[name])) return false
        }
        return true
      }
    }

    return (value: any) => {
      if (node.props.falseValue !== undefined) {
        return node.props.falseValue !== value
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
  }

  const availabilityOf = (node: ModelNode): Ref<boolean> => {
    return (availability.get(node) as Ref<boolean>) ?? alwaysTrue
  }

  const isAvailable = (node: ModelNode): boolean => {
    const el$ = node.el$ as any
    if (el$) return el$.available !== false
    return availabilityOf(node).value
  }

  const contextOf = (node: ModelNode): StatefulElement => {
    let context = contexts.get(node)
    if (context) return context

    const touched = ref(false)
    const filled = makeFilled(node)

    const el$: any = {
      path: node.path,
      dataPath: node.dataPath,
      genericName: node.genericName,
      props: node.props,
      ruleMessages: node.props.ruleMessages,
      filled,
      // Language-scoped for translatable nodes, mirroring the mounted update
      // (plain-object writes replace every language at once).
      update: (value: any) =>
        store.set(
          node.translatable && language && !isPlainObject(value)
            ? `${node.dataPath}.${language}`
            : node.dataPath,
          value
        ),
      get model() {
        return readValue(node)
      },
      // Like the mounted `value`, scoped to the active language for
      // translatable nodes (`model` stays the full locale object).
      get value() {
        const raw = readValue(node)
        return node.translatable && language && raw && typeof raw === 'object'
          ? raw[language]
          : raw
      },
      // The virtual form$ — expression resolution binds `context$.form$` so
      // `PROP()` / `SELF()` element lookups work headlessly.
      get form$() {
        return facade
      },
      get available() {
        return availabilityOf(node).value
      },
      get touched() {
        return touched.value
      },
      set touched(v: boolean) {
        touched.value = v
      },
      get validated() {
        const owner = nodeOwners.get(node)
        return owner ? validator.view(owner).validated.value : true
      },
      get invalid() {
        const owner = nodeOwners.get(node)
        return owner ? validator.view(owner).invalid.value : false
      },
      get errors() {
        const owner = nodeOwners.get(node)
        return owner ? validator.view(owner).errors.value : []
      },
    }

    context = markRaw(el$) as StatefulElement
    contexts.set(node, context)
    return context
  }

  // Reads `version` so reactive consumers re-resolve when claims change.
  const find = (path: string): StatefulElement | undefined => {
    void version.value

    const node = index.nodes.get(path)
    if (!node) return undefined

    return (node.el$ as StatefulElement | undefined) ?? contextOf(node)
  }

  const facade: any = markRaw({
    find,
    get: store.get,
    get model() {
      return store.model.value
    },
    get submits() {
      return submits.value
    },
  })

  // ============ CONDITIONS ==============

  let availabilityScope: EffectScope | undefined

  const wireAvailability = () => {
    availabilityScope?.stop()
    availability.clear()

    availabilityScope = scope.run(() => effectScope())!

    availabilityScope.run(() => {
      for (const node of index.nodes.values()) {
        const parentRef: Ref<boolean> = node.parent
          ? (availability.get(node.parent) as Ref<boolean>)
          : alwaysTrue

        let chained: Ref<boolean> | ComputedRef<boolean> = parentRef

        if (hasConditionsModule(vueform) && node.conditions != null) {
          const own = conditionsModule.makeConditional(
            node.conditions,
            store.model,
            contextOf(node),
            {
              path: node.path,
              form$: facade,
              trigger: node.props.conditionsTrigger,
              debounce: node.props.conditionsDebounce,
              valueFormat: node.props.valueFormat,
            }
          )
          chained = computed(() => parentRef.value && own.value)
        }

        availability.set(node, chained)
        node.available = chained
      }
    })
  }

  wireAvailability()

  // ============ EXPRESSIONS =============

  const expressionTracking =
    getExpressionModule(vueform).makeExpressionTracking(index)

  const trackingExpressions = expressionTracking.activate({
    store,
    config,
    languages: () => languages,
  })

  if (trackingExpressions) {
    for (const node of index.nodes.values()) {
      expressionTracking.init(node, () => contextOf(node))
    }
  }

  // ============ VALIDATION ==============

  const ensureValidator = (): Validator => {
    const existing = getAttachedValidator(store)
    if (existing) return existing

    const created = makeValidator({
      model: store.model,
      form$: facade,
      store,
      find: (path) => find(path),
      submits: () => store.adoptingContext.value?.submits ?? submits.value,
    })
    attachValidator(store, created)
    return created
  }

  validator = ensureValidator()

  if (options.validationSchema) {
    validator.setValidationSchema(options.validationSchema)
  }

  // No root owner is registered for the headless engine: root-bucket
  // validation-schema issues surface through the validator's rollup fallback.
  // Registering one here would duplicate them once a form adopts the store —
  // the mounted form root registers its own path-`''` owner on the same
  // validator.

  const ensureOwner = (node: ModelNode): ValidationOwner => {
    let owner = nodeOwners.get(node)
    if (owner) return owner

    owner = makeValidationOwner({
      id: node,
      path: () => node.path,
      dataPath: () => node.dataPath,
      el$: () => (node.el$ as StatefulElement | undefined) ?? contextOf(node),
      translatable: () => !!node.translatable,
      languages: () => Object.keys(languages),
      value: () => readValue(node),
      bail: () => !!node.props.bail,
      debounce: () => Number(node.props.debounce || 0),
      available: () => isAvailable(node),
    })

    nodeOwners.set(node, owner)
    validator.register(owner)
    validator.setRules(owner, node.rules as TRulesProp | undefined)
    version.value++
    return owner
  }

  // Mounted elements are the single authority for claimed nodes: drop the
  // engine's owner once its node gets claimed, so the validator never holds a
  // second owner for the same path. Sync flush — claims bump `version` right
  // after setting `node.el$`, so the drop lands in the same tick and no read
  // can observe both owners. After the claim is released, `validate()` lazily
  // re-creates a fresh owner.
  scope.run(() => {
    watch(
      version,
      () => {
        for (const [node, owner] of nodeOwners) {
          if (!node.el$) continue
          validator.unregister(owner)
          nodeOwners.delete(node)
        }
      },
      { flush: 'sync' }
    )
  })

  const validate = async (): Promise<boolean> => {
    submits.value = true

    if (!hasValidationModule(vueform)) {
      if (isDev()) {
        if (options.validationSchema) {
          warn(
            '`validate()` found a `validationSchema` but the `validation` module is not registered; treating the model as valid.'
          )
        } else {
          for (const node of index.nodes.values()) {
            if (node.rules != null) {
              warn(
                '`validate()` found rules but the `validation` module is not registered; treating the model as valid.'
              )
              break
            }
          }
        }
      }

      return !validator.invalid.value
    }

    for (const node of index.nodes.values()) {
      if (node.rules == null && !options.validationSchema) continue
      // Claimed nodes are validated through their mounted element's owner.
      if (node.el$) continue
      if (!isAvailable(node)) continue
      ensureOwner(node)
    }

    return validator.validate()
  }

  const invalid = computed(() => {
    void version.value
    return validator.invalid.value
  })

  const errors = computed(() => {
    void version.value
    return validator.errors.value
  })

  // =============== DATA =================

  const collectPayload = (node: ModelNode, acc: Record<string, any>) => {
    if (!node.submit || !isAvailable(node)) return

    const name = String(node.props.name)

    if (node.array) {
      acc[name] = clone(store.get(node.dataPath))
      return
    }

    if (node.children) {
      const target = node.flat ? acc : (acc[name] = {})
      for (const child of node.children.values()) {
        collectPayload(child, target)
      }
      return
    }

    acc[name] = clone(store.get(node.dataPath))
  }

  const payload = computed(() => {
    void version.value

    const result: Record<string, any> = {}
    for (const node of index.root.values()) {
      collectPayload(node, result)
    }
    return result
  })

  const nodeEmpty = (node: ModelNode): boolean => {
    if (!isAvailable(node)) return true

    if (node.children && !node.array) {
      for (const child of node.children.values()) {
        if (!nodeEmpty(child)) return false
      }
      return true
    }

    return isEmptyValue(store.get(node.dataPath), node.nullValue)
  }

  const empty = computed(() => {
    void version.value

    for (const node of index.root.values()) {
      if (!nodeEmpty(node)) return false
    }
    return true
  })

  // ============== REBUILD ===============

  const rebuild = (diff: SchemaIndexDiff) => {
    for (const node of diff.removed) {
      expressionTracking.release(node)
      contexts.delete(node)
      const owner = nodeOwners.get(node)
      if (owner) {
        validator.unregister(owner)
        nodeOwners.delete(node)
      }
    }

    for (const { node, prev } of diff.changed) {
      // Cached contexts captured the previous walk facts (props, genericName,
      // dataPath); drop them and recompile rules against the new facts.
      contexts.delete(node)
      const owner = nodeOwners.get(node)
      if (owner) {
        validator.unregister(owner)
        nodeOwners.delete(node)
      }

      if (!trackingExpressions) continue

      const inputsChanged =
        prev.dataPath !== node.dataPath ||
        prev.translatable !== node.translatable ||
        !equals(prev.props, node.props)

      if (!inputsChanged) continue

      // Re-init tracking against the new facts, preserving a user's earlier
      // untrack and carrying template sources the store no longer holds
      // (already resolved). Claimed nodes bind their mounted context.
      scope.run(() => {
        expressionTracking.reinit(node, () => node.el$ ?? contextOf(node))
      })
    }

    wireAvailability()

    if (trackingExpressions) {
      scope.run(() => {
        for (const node of diff.added) {
          expressionTracking.init(node, () => node.el$ ?? contextOf(node))
        }
      })
    }

    version.value++
  }

  return {
    find,
    facade,
    submits,
    validate,
    invalid,
    errors,
    issues: validator.issues,
    payload,
    empty,
    rebuild,
    validationSchema: options.validationSchema,
    validator,
    toStandardSchema: validator.toStandardSchema,
  }
}

// ============= MODEL KIT ==============

// Marked raw so passing the instance through props never proxies the store.
function makeModelInstance<TSchema = FormSchema>(
  store: ModelStore,
  options: {
    index: SchemaIndex
    scope: EffectScope
    engine: ReturnType<typeof makeModelEngine>
    vueform: VueformInstance
  }
): ModelInstance<TSchema> {
  const { index, scope, engine, vueform } = options

  const instance = {
    get: store.get,
    set: store.set,
    update: store.update,
    input: (data: Record<string, any>) => {
      getExpressionModule(vueform)
        .makeExpressionTracking(index)
        .notifyInputData(data)
      store.update(data)
    },
    load: store.load,
    clear: store.clear,
    reset: store.reset,
    clean: store.clean,
    toJSON: store.toJSON,
    toFormData: store.toFormData,
    on: store.on,
    submit: store.submit,
    index,
    find: engine.find,
    validate: engine.validate,
    validationSchema: engine.validationSchema,
    toStandardSchema: engine.toStandardSchema,
    destroy: () => {
      scope.stop()
      store.destroy()
    },
    get model() {
      return store.model.value
    },
    get initialModel() {
      return store.initialModel.value
    },
    get dirty() {
      return store.dirty.value
    },
    get empty() {
      return engine.empty.value
    },
    get adopted() {
      return store.adopted.value
    },
    get data() {
      return store.model.value
    },
    get payload() {
      return engine.payload.value
    },
    get invalid() {
      return engine.invalid.value
    },
    get errors() {
      return engine.errors.value
    },
    get issues() {
      return engine.issues.value
    },
  }

  setModelStore(instance, store)

  return markRaw(instance) as unknown as ModelInstance<TSchema>
}

function makeModelBinding(options: {
  model: Ref<any>
  modelValue: Ref<any>
  notifyTrigger: Ref<number>
  hasVModel: Ref<boolean>
  lastModel: Ref<any>
  context$: any
  consumeValueChanged: () => boolean
  hasListeners?: (e: 'change') => boolean
  fire: {
    (e: 'change', newValue: any, oldValue: any, context$: any): any
    (e: 'update:modelValue', value: any): any
  }
  applyInbound: (data: any) => void
  shouldNotify?: () => boolean
  onSkippedFlush?: (changed: boolean) => void
}) {
  let lastEmitted: any = undefined
  let unwatchNotify: WatchStopHandle | undefined
  let unwatchModelValue: WatchStopHandle | undefined

  const emitInitial = () => {
    if (
      options.hasVModel.value &&
      !equals(options.modelValue.value, options.model.value)
    ) {
      const snapshot = clone(options.model.value)
      lastEmitted = snapshot
      options.fire('update:modelValue', snapshot)
    }
  }

  const initNotify = () => {
    unwatchNotify = watch(
      options.notifyTrigger,
      () => {
        const changed = options.consumeValueChanged()

        if (options.shouldNotify && !options.shouldNotify()) return

        // Skip the snapshot — an O(N) deep clone of the bound slice — when
        // nothing consumes it: no v-model bound and no change listeners.
        // Checked on every flush, so a listener added later via `on('change')`
        // resumes snapshotting immediately; its first event then reports the
        // old value as of the last observed flush.
        if (
          !options.hasVModel.value &&
          options.hasListeners &&
          !options.hasListeners('change')
        ) {
          options.onSkippedFlush?.(changed)
          return
        }

        const snapshot = clone(options.model.value)

        if (
          !changed &&
          options.lastModel.value !== undefined &&
          equals(snapshot, options.lastModel.value)
        ) {
          return
        }

        if (options.hasVModel.value) {
          lastEmitted = snapshot
          options.fire('update:modelValue', snapshot)
        }

        if (options.lastModel.value !== undefined) {
          options.fire(
            'change',
            snapshot,
            options.lastModel.value,
            options.context$
          )
        }

        options.lastModel.value = snapshot
      },
      { flush: 'post' }
    )
  }

  // Values just emitted outbound (`lastEmitted`) are ignored to prevent echo
  // loops.
  const initInbound = () => {
    unwatchModelValue = watch(
      () => options.modelValue.value,
      (n) => {
        if (n === undefined) return
        if (n === lastEmitted) return
        if (equals(options.model.value, n)) return

        options.applyInbound(clone(n))
      },
      { deep: true }
    )
  }

  const destroy = () => {
    unwatchNotify?.()
    unwatchModelValue?.()
    unwatchNotify = undefined
    unwatchModelValue = undefined
  }

  return {
    emitInitial,
    initNotify,
    initInbound,
    destroy,
  }
}

/**
 * Creates an empty schema index. Used by forms without an adopted `useModel`
 * instance: the index starts blank and mounted registration fills it, so the
 * schema walk is never paid for plain forms.
 */
function makeEmptyIndex(): SchemaIndex {
  return {
    root: new Map(),
    nodes: new Map(),
    model: {},
    nullModel: {},
    version: ref(0),
  }
}

/**
 * Creates the model module instance from the app config. The module is a
 * stateless factory: `make` builds standalone form models from schemas using
 * the component definitions registered in the config, while per-form state
 * lives in the produced instances.
 *
 * The returned instances own their data and expose the familiar data API
 * (`update` / `load` / `clear` / `reset` / `clean`, `dirty` / `empty`,
 * path-based `get` / `set`, `toJSON` / `toFormData`). Passing one to a form's
 * `v-model` (or `useForm`) makes the form adopt it — the same store is shared
 * without cloning, and `submit()` becomes available.
 *
 * ```ts
 * const model$ = createModel(config).make(schema, { name: 'John' })
 *
 * model$.model.name // 'John'
 * model$.set('email', 'john@example.com')
 * model$.dirty // true
 * ```
 *
 * @param vueform The owning instance, whose config the model shape depends on
 *   via the registered component definitions.
 */
export function createModel(vueform: VueformInstance): ModelModule {
  const make = (
    schema: FormSchema | Ref<FormSchema>,
    model?: Record<string, any>,
    explicitValidationSchema?: StandardSchemaV1
  ) => {
    const buildOptions = { vueform }

    const validationSchema =
      explicitValidationSchema ?? getAttachedValidationSchema(schema)

    if (isDev() && explicitValidationSchema) {
      const attached = getAttachedValidationSchema(schema)
      if (attached && attached !== explicitValidationSchema) {
        warn(
          'The `validationSchema` option overrides the ' +
            "Standard Schema attached via `defineSchema`'s second argument"
        )
      }
    }

    const index = buildSchemaIndex(unref(schema), buildOptions)

    // A Vue ref is not unwrapped: clone would copy RefImpl internals.
    let seed = model
    if (isRef(model)) {
      if (isDev()) {
        warn(
          'A Vue ref was passed as the model seed. The seed ' +
            'is a cloned snapshot — pass a plain or reactive object, not a ref.'
        )
      }
      seed = undefined
    }

    const initial =
      seed !== undefined
        ? mergeOrReplace(index.model, clone(seed))
        : index.model

    const store = makeModelStore({
      model: initial,
      nullModel: index.nullModel,
    })

    // Detached scope: the instance must work outside component setup and its
    // effects (engines, change watcher) must not leak into a caller's scope.
    const scope = effectScope(true)

    const engine = scope.run(() =>
      makeModelEngine({
        index,
        store,
        vueform,
        validationSchema,
        scope,
      })
    )!

    // Reactive schemas: reconcile the index, data, and engines in place on
    // change — every identity (instance, store, index, surviving nodes) is
    // preserved, so adopting forms and expression state carry over.
    if (isRef(schema)) {
      scope.run(() => {
        watch(schema as Ref<FormSchema>, (newSchema, oldSchema) => {
          // Recomputes can yield structurally identical schemas (function
          // props defeat the guard by identity — rebuilds stay correct, just
          // unskipped).
          if (equals(newSchema, oldSchema)) return

          const diff = reconcileSchemaIndex(index, newSchema, buildOptions)
          reconcileData(store, diff)
          engine.rebuild(diff)
        })
      })
    }

    return makeModelInstance(store, { index, scope, engine, vueform })
  }

  return {
    make,
    makeRootModel,
    makeChildModel,
    makeModelStore,
    makeMountedNode,
    hasModelStore,
  } as ModelModule
}

/**
 * Creates the root-level reactive model for a form, providing model sync,
 * registration, and lifecycle methods.
 *
 * Always backed by a model store and schema index: when `modelValue` holds a
 * `useModel` instance the form adopts its store and index (the store stays the
 * single source of truth — no v-model emission or inbound watcher), otherwise a
 * store is created internally from the plain `modelValue` and kept in sync with
 * it, with an empty index filled by mounted registration.
 *
 * @param options Root model configuration object.
 */
export function makeRootModel(options: MakeRootModelOptions): RootModel {
  const { context$ } = options

  const initialModelValue = unref(options.modelValue)

  const adopted = hasModelStore(initialModelValue)

  const store: ModelStore = adopted
    ? getModelStore(initialModelValue)
    : makeModelStore({ model: clone(initialModelValue) || {} })

  const index: SchemaIndex = adopted
    ? initialModelValue.index
    : makeEmptyIndex()

  const modelFind = adopted ? initialModelValue.find : undefined

  const model = store.model
  const lastModel = ref()
  const initialModel = store.initialModel

  if (adopted) {
    store.adopt(context$)
  }

  // Adopted stores skip v-model emission — the store is the single source of
  // truth.
  const hasVModel = computed(() => !adopted && options.hasVModel.value)

  // The form's teardown runs before its children; this keeps an adopted
  // store's data from being wiped by child unregistration.
  let destroyed = false

  const binding = makeModelBinding({
    model,
    modelValue: options.modelValue,
    notifyTrigger: store.notifyTrigger,
    hasVModel,
    lastModel,
    context$,
    consumeValueChanged: store.consumeValueChanged,
    hasListeners: options.hasListeners,
    fire: options.fire,
    applyInbound: options.applyInbound,
  })

  const unregister = (dataPath: string) => {
    if (destroyed && adopted) return
    store.unregister(dataPath)
  }

  const init = () => {
    lastModel.value = clone(model.value)

    if (adopted) {
      // Child registration may have seeded keys the schema walk missed —
      // re-snapshot so they don't read as dirty, but never wipe changes the
      // user made before adoption.
      if (!store.dirty.value) store.clean()
    } else {
      initialModel.value = clone(model.value)
    }

    binding.emitInitial()
    binding.initNotify()

    // An adopted store is the single source of truth — no inbound watcher.
    if (!adopted) {
      binding.initInbound()
    }
  }

  const destroy = () => {
    destroyed = true

    binding.destroy()

    if (adopted) {
      store.release()
    } else {
      store.destroy()
    }
  }

  return {
    store,
    adopted,
    index,
    modelFind,
    model,
    lastModel,
    initialModel,
    set: store.set,
    register: store.register,
    unregister,
    subscribe: store.subscribe,
    init,
    destroy,
  }
}

/**
 * Creates the reactive model for a child element by reading from its parent
 * container's model and keeping it in sync with the element's `v-model`,
 * mirroring the lifecycle interface of `makeRootModel`.
 *
 * @param options Child model configuration object.
 */
export function makeChildModel(options: MakeChildModelOptions) {
  const { context$ } = options

  const lastModel = ref()
  const initialModel = ref()
  const childModelValue = toRef(() => unref(options.modelValue))
  const childAvailable = toRef(() => options.available?.value !== false)

  const model = computed(() => {
    if (!options.flat.value) {
      return options.parent.model.value?.[options.name.value!]
    }

    const parent = options.parent.model.value
    const result: Record<string, any> = {}

    for (const child$ of options.children?.value ?? []) {
      if (child$.isFlatContainer) {
        Object.assign(result, child$.model)
      } else if (parent && child$.name in parent) {
        result[child$.name] = parent[child$.name]
      }
    }

    return result
  })

  // Seed the parent's level with the initial external model value while the
  // children haven't registered yet (this runs during the container's setup,
  // before the children's), mirroring how nested containers seed their slice
  // via `startupModel` registration. Children registering afterwards find the
  // seeded values in the model and adopt them over their own defaults, so no
  // change events fire at startup. Written per key directly (not via
  // `update`) because key ownership can't be established before the children
  // exist.
  if (options.flat.value && isPlainObject(unref(options.modelValue))) {
    const prefix = options.dataPath.value ? `${options.dataPath.value}.` : ''
    const seed = clone(unref(options.modelValue))

    for (const key of Object.keys(seed)) {
      options.parent.update(`${prefix}${key}`, seed[key])
    }
  }

  // ================ SYNC ================

  const notifyTrigger = ref(0)

  let valueChanged = false
  let unsubscribe: (() => void) | undefined
  let keySubscriptions: (() => void)[] = []
  let unwatchKeys: WatchStopHandle | undefined
  let unwatchModel: WatchStopHandle | undefined

  // Captured at init — fixed for one init/destroy cycle (toggling `nested`
  // re-inits). Backs the skipped-flush `lastModel` tracking exemption.
  let flat = false

  // `lastModel` must still track changed values on skipped flushes: it backs
  // reorder re-path detection and the dirty baseline. Flat containers are
  // exempt — their data path never changes, so no re-path can occur.
  const binding = makeModelBinding({
    model,
    modelValue: childModelValue,
    notifyTrigger,
    hasVModel: options.hasVModel,
    lastModel,
    context$,
    consumeValueChanged: () => {
      const changed = valueChanged
      valueChanged = false
      return changed
    },
    hasListeners: options.hasListeners,
    fire: options.fire,
    // For flat containers the inbound value flows through `update`, which
    // merges per owned key — keys no child owns (same-level siblings) are
    // dropped instead of written.
    applyInbound: (data) => options.update(data),
    shouldNotify: () => childAvailable.value && model.value !== undefined,
    onSkippedFlush: (changed) => {
      if (changed && !flat) lastModel.value = clone(model.value)
    },
  })

  // =========== INITIALIZATION ===========

  const init = () => {
    // Drop any stale "value changed" signal left over from a previous binding
    // so the first notify after a re-path can't be forced to fire for a value
    // that didn't actually change (e.g. a pure reorder).
    valueChanged = false

    flat = options.flat.value

    const nextModel = clone(model.value)

    // Preserve the dirty baseline across a reorder-driven re-path: when the
    // slice value is unchanged (the item moved to a new slot but carries the
    // same data), keep the existing snapshots so `dirty` and change detection
    // travel with the item instead of resetting to the new slot's data.
    const preserveBaseline =
      lastModel.value !== undefined && equals(lastModel.value, nextModel)

    if (!preserveBaseline) {
      lastModel.value = nextModel
      initialModel.value = clone(model.value)
    }

    binding.emitInitial()
    binding.initNotify()

    if (flat) {
      // A flat container's own data path equals its parent's, so a single
      // subscription there would wake it for every same-level sibling change.
      // Subscribe to each owned top-level key instead, re-subscribing when the
      // key set changes (children register/unregister) or the path prefix
      // moves (an ancestor list reorder).
      unwatchKeys = watch(
        () => {
          const prefix = options.dataPath.value
            ? `${options.dataPath.value}.`
            : ''
          return Object.keys(model.value ?? {})
            .map((key) => `${prefix}${key}`)
            .join('\u001f')
        },
        (paths) => {
          keySubscriptions.forEach((unsub) => unsub())
          keySubscriptions = paths
            ? paths.split('\u001f').map((path) =>
                options.parent.subscribe(path, () => {
                  valueChanged = true
                  notifyTrigger.value++
                })
              )
            : []
        },
        { immediate: true }
      )
    } else {
      // In-place mutations of this element's slice or any of its descendants
      // don't change object references up the chain, so a non-deep watcher
      // can't see them. The root model dispatches to this path's subscribers
      // instead.
      unsubscribe = options.parent.subscribe(options.dataPath.value, () => {
        valueChanged = true
        notifyTrigger.value++
      })
    }

    // Catches wholesale replacements from above (e.g. an ancestor object being
    // replaced, or the external model-value changing) where the slice's
    // reference changes.
    unwatchModel = watch(model, () => {
      notifyTrigger.value++
    })

    binding.initInbound()
  }

  const destroy = () => {
    unsubscribe?.()
    keySubscriptions.forEach((unsub) => unsub())
    keySubscriptions = []
    binding.destroy()
    unwatchKeys?.()
    unwatchModel?.()
    unsubscribe = undefined
    unwatchKeys = undefined
    unwatchModel = undefined
  }

  return {
    model,
    lastModel,
    initialModel,
    init,
    destroy,
  }
}

/**
 * Creates an index node for a mounted element the schema walk didn't produce
 * (template-driven elements, or list rows added beyond the initial count). Only
 * identity facts are known up front — the claimed component context carries the
 * live state.
 *
 * @param facts The element's path and data path.
 */
export function makeMountedNode(facts: {
  path: string
  dataPath?: string
}): ModelNode {
  const name = facts.path.split('.').pop() ?? facts.path

  return {
    path: facts.path,
    dataPath: facts.dataPath ?? '',
    flat: false,
    array: false,
    props: {},
    nullValue: null,
    translatable: false,
    submit: true,
    genericName: name,
    mounted: true,
  }
}
