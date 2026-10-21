import { ref } from 'vue'

import type { VueformInstance } from '#src/helpers'
import type { FormSchema, LanguagesProp, VueformComponent } from '#src/types'
import {
  clone,
  get as getByPath,
  isPlainObject,
  kebabToPascal,
  mergeOrReplace,
  schemaEntries,
  set as setByPath,
  unset,
} from '#src/utils'

import type { ModelNode, ModelStore, SchemaIndex } from './types'

type ReconciledNodePrev = Pick<
  ModelNode,
  'dataPath' | 'props' | 'translatable' | 'rules' | 'conditions'
>

export type BuildModelOptions = {
  vueform: VueformInstance

  /**
   * Instance-level language map overriding `config.languages` for translatable
   * expansion (element-level `languages` props still win).
   */
  languages?: LanguagesProp
}

export type SchemaIndexDiff = {
  added: ModelNode[]
  removed: ModelNode[]
  changed: { node: ModelNode; prev: ReconciledNodePrev }[]
  model: Record<string, any>
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
    props.languages ?? options.languages ?? options.vueform.config.languages
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
          ? props.default
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

/**
 * Walks a schema into its index: the node tree describing every data-carrying
 * element, plus the default model and null-value tree.
 */
export function buildSchemaIndex(
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

/**
 * Reconciles an existing index against a changed schema in place. Every
 * identity (index, surviving nodes) is preserved so attaching forms and
 * expression state carry over; the returned diff drives data seeding and
 * engine rebuilds.
 */
export function reconcileSchemaIndex(
  index: SchemaIndex,
  schema: FormSchema | undefined,
  options: BuildModelOptions
): SchemaIndexDiff {
  const fresh = buildSchemaIndex(schema, options)

  const added: ModelNode[] = []
  const removed: ModelNode[] = []
  const changed: { node: ModelNode; prev: ReconciledNodePrev }[] = []

  const reusedOf = new Map<ModelNode, ModelNode>()

  // First pass: reuse or take over each fresh node (parents walk before
  // children).
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

/**
 * Applies an index diff to the store's data: added elements seed their
 * defaults, removed elements drop their slice.
 */
export function reconcileData(store: ModelStore, diff: SchemaIndexDiff) {
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

/**
 * Creates an empty schema index. Used by forms without an attached `useModel`
 * instance: the index starts blank and mounted registration fills it, so the
 * schema walk is never paid for plain forms.
 */
export function makeEmptyIndex(): SchemaIndex {
  return {
    root: new Map(),
    nodes: new Map(),
    model: {},
    nullModel: {},
    version: ref(0),
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
