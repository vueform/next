import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
// ========= TOKENS =========

import {
  camelToKebab,
  discoverTokenGroups,
  type TokenJsonEntry,
} from '@vueform/utils'

import { requireData, API_EXTRACTOR_HINT } from './ensure-data'

// =============== PATHS ================

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(SCRIPT_DIR, '..', '..')
const ROOT = path.resolve(DOCS_ROOT, '..')
const GENERATED_DIR = path.join(DOCS_ROOT, '..', '.vueform', 'docs')
const API_DIR = path.resolve(DOCS_ROOT, '..', '.vueform/api')

requireData(
  'reference',
  path.join(API_DIR, 'core', 'components.json'),
  API_EXTRACTOR_HINT
)
const COMPONENTS_DIR = path.join(DOCS_ROOT, 'src/components')
const TEMPLATE_PATH = path.join(COMPONENTS_DIR, '_template.md')
const SCSS_DIR = path.join(ROOT, 'packages/core/src/scss')
const CORE_COMPONENTS_DIR = path.join(ROOT, 'packages/core/src/components')

interface TagLinksConfig {
  pattern: string
  overrides: Record<string, string>
}

interface AdapterDef {
  path: string
  typesOutputDir: string
  host: string
  config: string
  displayName?: string
  docsUrl?: string
  tagLinks?: TagLinksConfig
  frameworkProps?: Record<string, Record<string, string>>
}

const DOCS_CONFIG = JSON.parse(
  fs.readFileSync(path.join(DOCS_ROOT, 'config.json'), 'utf-8')
)

const adapters: Record<string, AdapterDef> = DOCS_CONFIG.adapters

const SHARED_COMPONENTS = new Set<string>(DOCS_CONFIG.coreComponents)

// ============ JSON LOADING ============

function loadJSON(name: string): any {
  // Extracted structural jsons live at the monorepo root, docs-own ones
  // (types.json, keywords.json) under .vueform/docs; both use core/ for
  // the shared data and one folder per adapter.
  const apiPath = path.join(API_DIR, 'core', name)
  if (fs.existsSync(apiPath)) {
    return JSON.parse(fs.readFileSync(apiPath, 'utf-8'))
  }
  return JSON.parse(
    fs.readFileSync(path.join(GENERATED_DIR, 'core', name), 'utf-8')
  )
}

function loadAdapterJSON(adapterName: string, name: string): any {
  const apiPath = path.join(API_DIR, adapterName, name)
  const filePath = fs.existsSync(apiPath)
    ? apiPath
    : path.join(GENERATED_DIR, adapterName, name)
  if (!fs.existsSync(filePath)) return {}
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

// ============ STATIC DATA ============

const ORDERS: {
  events: string[]
  slots: string[]
  parts: string[]
  props: {
    id: string
    label: string
    common?: boolean
    members: string[]
  }[]
  contexts: {
    id: string
    label: string
    common?: boolean
    members: string[]
  }[]
} = DOCS_CONFIG.orders

const BASE_SLOT_ORDER = ORDERS.slots
const BASE_PART_ORDER = ORDERS.parts

const CONTEXT_GROUPS = ORDERS.contexts

const COMMON_GROUPS_SET = new Set(
  CONTEXT_GROUPS.filter((g) => g.common).map((g) => g.id)
)

const STANDARD_EXPOSED: Record<string, { type: string; description: string }> =
  {
    props: {
      type: 'object',
      description: 'The resolved component props with defaults applied.',
    },
    parts: {
      type: 'object',
      description:
        'The resolved DOM attribute overrides for internal elements.',
    },
    classes: {
      type: 'object',
      description: 'The resolved CSS class map for the component.',
    },
  }

function getDisplayName(adapterName: string): string {
  return adapters[adapterName]?.displayName ?? adapterName
}

function getTagLinks(adapterName: string): TagLinksConfig | undefined {
  return adapters[adapterName]?.tagLinks
}

const MEMBER_TO_GROUP = new Map<string, string>()
for (const group of CONTEXT_GROUPS) {
  for (const member of group.members) {
    MEMBER_TO_GROUP.set(member, group.id)
  }
}

const PROP_GROUPS = ORDERS.props

const COMMON_PROP_GROUPS_SET = new Set(
  PROP_GROUPS.filter((g) => g.common).map((g) => g.id)
)

const PROP_MEMBER_TO_GROUP = new Map<string, string>()
for (const group of PROP_GROUPS) {
  for (const member of group.members) {
    if (group.id === 'html' && PROP_MEMBER_TO_GROUP.has(member)) continue
    PROP_MEMBER_TO_GROUP.set(member, group.id)
  }
}

// ============ TYPE FORMATTING ============

function escPipe(s: string): string {
  return s.replace(/\|/g, '\\|')
}

function formatTableDesc(s: string): string {
  return escPipe(s).replace(/\n/g, '<br>')
}

function escTitle(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/"/g, '\\"')
}

function splitUnion(typeStr: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''

  for (const ch of typeStr) {
    if (ch === '<' || ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') depth--
    else if (ch === '|' && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ''
      continue
    }
    current += ch
  }

  if (current.trim()) parts.push(current.trim())
  return parts
}

function firstTypeArg(typeStr: string, name: string): string | undefined {
  const prefix = `${name}<`
  if (!typeStr.startsWith(prefix) || !typeStr.endsWith('>')) return undefined

  const inner = typeStr.slice(prefix.length, -1)
  let depth = 0
  let first = ''

  for (const ch of inner) {
    if (ch === '<' || ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === '>' || ch === ')' || ch === ']' || ch === '}') depth--
    else if (ch === ',' && depth === 0) break
    first += ch
  }

  return first.trim() || undefined
}

function unwrapSingleRef(typeStr: string): string {
  let s = typeStr

  const readonly = firstTypeArg(s, 'Readonly')
  if (readonly) s = readonly

  s =
    firstTypeArg(s, 'WritableComputedRef') ??
    firstTypeArg(s, 'Ref') ??
    firstTypeArg(s, 'ComputedRef') ??
    s

  return s.replace(/\bRaw<(\w+)>/g, '$1')
}

function unwrapRefType(typeStr: string): string {
  return splitUnion(typeStr).map(unwrapSingleRef).join(' | ')
}

function formatFunctionType(member: any): string {
  if (member.type !== 'function') return member.type

  const params = member.params
    ? Object.entries(member.params)
        .map(([name, p]: [string, any]) => `${name}: ${p.type}`)
        .join(', ')
    : ''

  const ret = member.returns?.type ?? 'void'
  return `(${params}) => ${ret}`
}

function simplifyType(typeStr: string): string {
  if (typeStr.startsWith('{') || typeStr.includes(';')) return 'object'
  if (/^Record<.+>$/.test(typeStr)) return 'object'
  if (/^Partial<.+>$/.test(typeStr)) return 'object'
  if (/^Map<.+>$/.test(typeStr)) return 'object'
  const parts = splitUnion(typeStr)
  if (parts.length > 4) {
    if (parts.every((p) => p.startsWith('"') || p.startsWith("'")))
      return 'string'
    return 'object'
  }

  return typeStr
}

// ============ ORDERING ============

/**
 * Sorts entries according to an order list that may contain a `---` separator.
 * Items listed before `---` appear first (in order), then unlisted items appear
 * where `---` is (preserving their original order), then items listed after
 * `---` appear last (in order). If no `---` is present, listed items come first
 * and unlisted items are appended in original order.
 */
function sortByOrder(
  obj: Record<string, any>,
  order: string[]
): [string, any][] {
  const dividerIdx = order.indexOf('---')
  const before = dividerIdx >= 0 ? order.slice(0, dividerIdx) : order
  const after = dividerIdx >= 0 ? order.slice(dividerIdx + 1) : []

  const beforeEntries: [string, any][] = []
  const middleEntries: [string, any][] = []
  const afterEntries: [string, any][] = []

  const beforeIndex = new Map(before.map((k, i) => [k, i]))
  const afterIndex = new Map(after.map((k, i) => [k, i]))

  for (const [key, val] of Object.entries(obj)) {
    if (beforeIndex.has(key)) {
      beforeEntries.push([key, val])
    } else if (afterIndex.has(key)) {
      afterEntries.push([key, val])
    } else {
      middleEntries.push([key, val])
    }
  }

  beforeEntries.sort(([a], [b]) => beforeIndex.get(a)! - beforeIndex.get(b)!)
  afterEntries.sort(([a], [b]) => afterIndex.get(a)! - afterIndex.get(b)!)

  return [...beforeEntries, ...middleEntries, ...afterEntries]
}

// ========= CONTEXT RESOLUTION =========

function resolveContext(
  blueprintName: string,
  blueprints: any,
  features: any,
  composables: any,
  adapterFeatureNames?: string[],
  adapterFeatures?: any,
  componentApi?: Record<string, any>
): Array<{ name: string; type: string; description: string }> {
  const blueprint = blueprints[blueprintName]
  if (!blueprint) return []

  const members = new Map<string, { type: string; description: string }>()

  if (blueprint.features) {
    for (const featureName of blueprint.features) {
      const feature = features[featureName]
      if (!feature?.returns) continue

      for (const [memberName, memberData] of Object.entries(
        feature.returns
      ) as [string, any][]) {
        if (members.has(memberName)) continue
        if (memberData.private) continue

        if (memberData.from && !memberData.type) {
          const resolved = resolveFromRef(
            memberData.from,
            features,
            composables
          )
          if (resolved) {
            members.set(memberName, resolved)
          }
          continue
        }

        let typeStr: string
        if (memberData.type === 'function') {
          typeStr = formatFunctionType(memberData)
        } else {
          typeStr = simplifyType(unwrapRefType(memberData.type))
        }

        members.set(memberName, {
          type: typeStr,
          description: memberData.description || '',
        })
      }
    }
  }

  if (adapterFeatureNames && adapterFeatures) {
    for (const featureName of adapterFeatureNames) {
      const feature = adapterFeatures[featureName]
      if (!feature?.returns) continue

      for (const [memberName, memberData] of Object.entries(
        feature.returns
      ) as [string, any][]) {
        if (members.has(memberName)) continue

        let typeStr: string
        if (memberData.type === 'function') {
          typeStr = formatFunctionType(memberData)
        } else {
          typeStr = simplifyType(unwrapRefType(memberData.type))
        }

        members.set(memberName, {
          type: typeStr,
          description: memberData.description || '',
        })
      }
    }
  }

  if (componentApi) {
    for (const [name, data] of Object.entries(componentApi)) {
      if (members.has(name)) continue

      let typeStr: string
      if (data.type === 'function') {
        typeStr = formatFunctionType(data)
      } else {
        typeStr = simplifyType(unwrapRefType(data.type))
      }

      members.set(name, { type: typeStr, description: data.description || '' })
    }
  }

  if (blueprint.api) {
    for (const [name, data] of Object.entries(blueprint.api) as [
      string,
      any,
    ][]) {
      if (members.has(name)) continue

      let typeStr: string
      if (data.type === 'function') {
        typeStr = formatFunctionType(data)
      } else {
        typeStr = simplifyType(unwrapRefType(data.type))
      }

      members.set(name, { type: typeStr, description: data.description || '' })
    }
  }

  for (const [name, data] of Object.entries(STANDARD_EXPOSED)) {
    if (!members.has(name)) {
      members.set(name, data)
    }
  }

  for (const [memberName, memberData] of members) {
    if (memberData.description) continue
    const desc = findComposableDescription(memberName, composables, features)
    if (desc) memberData.description = desc
  }

  return Array.from(members.entries()).map(([name, data]) => ({
    name,
    type: data.type,
    description: data.description,
  }))
}

function findComposableDescription(
  memberName: string,
  composables: any,
  features: any
): string | undefined {
  for (const composable of Object.values(composables) as any[]) {
    const ret = composable?.returns?.members
    if (!ret) continue
    const member = ret[memberName]
    if (!member) continue
    if (member.description) return member.description
    if (member.from && !member.type) {
      const resolved = resolveFromRef(member.from, features, composables)
      if (resolved?.description) return resolved.description
    }
  }
  return undefined
}

function resolveFromRef(
  fromPath: string,
  features: any,
  composables?: any
): { type: string; description: string } | undefined {
  const parts = fromPath.split('.')
  if (parts.length < 3) return undefined

  const namespace = parts[0]
  const entityName = parts[1]
  const memberName = parts[2]

  let source: any
  if (namespace === 'features') source = features
  else if (namespace === 'composables' && composables) source = composables
  else return undefined

  const entity = source[entityName]
  const member =
    namespace === 'features'
      ? entity?.returns?.[memberName]
      : entity?.returns?.members?.[memberName]
  if (!member) return undefined
  if (member.private) return undefined

  if (member.from && !member.type) {
    return resolveFromRef(member.from, features, composables)
  }

  let typeStr: string
  if (member.type === 'function') {
    typeStr = formatFunctionType(member)
  } else {
    typeStr = simplifyType(unwrapRefType(member.type))
  }

  return { type: typeStr, description: member.description || '' }
}

// ========= TABLE GENERATORS =========

function generateContextSections(
  entries: Array<{ name: string; type: string; description: string }>,
  componentName: string
): string {
  const componentGroupId = componentName.replace(/^Vf/, '').toLowerCase()
  const componentGroupLabel = componentName.replace(/^Vf/, '')

  const grouped = new Map<string, typeof entries>()
  const ungrouped: typeof entries = []

  for (const entry of entries) {
    const groupId = MEMBER_TO_GROUP.get(entry.name)
    if (
      groupId &&
      (COMMON_GROUPS_SET.has(groupId) || groupId === componentGroupId)
    ) {
      if (!grouped.has(groupId)) grouped.set(groupId, [])
      grouped.get(groupId)!.push(entry)
    } else {
      ungrouped.push(entry)
    }
  }

  const memberOrder = new Map<string, number>()
  for (const group of CONTEXT_GROUPS) {
    for (let i = 0; i < group.members.length; i++) {
      memberOrder.set(group.members[i], i)
    }
  }
  for (const [, items] of grouped) {
    items.sort(
      (a, b) =>
        (memberOrder.get(a.name) ?? 9999) - (memberOrder.get(b.name) ?? 9999)
    )
  }

  if (ungrouped.length > 0) {
    if (grouped.has(componentGroupId)) {
      grouped.get(componentGroupId)!.push(...ungrouped)
    } else {
      grouped.set(componentGroupId, ungrouped)
    }
  }

  const groupLabels = new Map<string, string>()
  for (const g of CONTEXT_GROUPS) groupLabels.set(g.id, g.label)
  if (!groupLabels.has(componentGroupId)) {
    groupLabels.set(componentGroupId, componentGroupLabel)
  }

  const lines: string[] = ['']

  function appendSection(
    groupId: string,
    label: string,
    items: typeof entries
  ) {
    lines.push(`### ${label} {#section-${groupId}}`, '')
    lines.push(`| Name | Description |`)
    lines.push(`| --- | --- |`)
    for (const item of items) {
      const isMethod = /^\(.*\)\s*=>/.test(item.type)
      const displayName = isMethod ? `${item.name}()` : item.name
      lines.push(
        `| [\`${displayName}\`](!code#context.${item.name} "${escTitle(item.type)}") | ${formatTableDesc(item.description)} |`
      )
    }
    lines.push('')
  }

  const rendered = new Set<string>()

  for (const group of CONTEXT_GROUPS) {
    if (group.id !== 'general') continue
    if (!grouped.has(group.id)) continue
    appendSection(group.id, group.label, grouped.get(group.id)!)
    rendered.add(group.id)
  }

  if (grouped.has(componentGroupId) && !rendered.has(componentGroupId)) {
    appendSection(
      componentGroupId,
      groupLabels.get(componentGroupId)!,
      grouped.get(componentGroupId)!
    )
    rendered.add(componentGroupId)
  }

  for (const group of CONTEXT_GROUPS) {
    if (rendered.has(group.id) || !grouped.has(group.id)) continue
    appendSection(group.id, group.label, grouped.get(group.id)!)
    rendered.add(group.id)
  }

  return lines.join('\n')
}

function formatDefault(value: unknown, prop: Record<string, any>): string {
  if (value === undefined) return '—'
  if (value === null) return '`null`'
  if (typeof value === 'boolean') return `\`${value}\``
  if (typeof value === 'number') return `\`${value}\``
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ')
    if (normalized.includes('=>')) {
      return `[\`function\`](!value#props.${prop._name}.default "${escTitle(normalized)}")`
    }
    return `\`'${escPipe(normalized)}'\``
  }
  if (Array.isArray(value)) {
    const items = value.map((v) =>
      typeof v === 'string' ? `'${escPipe(v)}'` : String(v)
    )
    return `\`[${items.join(', ')}]\``
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([k, v]) =>
        `${k}: ${typeof v === 'string' ? `'${escPipe(v)}'` : String(v)}`
    )
    return `\`{ ${entries.join(', ')} }\``
  }
  return '—'
}

function generatePropsIntro(
  _props: Record<string, any>,
  adapterName?: string
): string | undefined {
  if (!adapterName) return undefined

  return "\nConfigure the component's behavior and appearance with these props.\n"
}

function generateAdapterPropsSections(
  props: Record<string, any>,
  adapterName: string,
  adapterTypeInfo?: {
    omittedProps?: string[]
    unavailableProps?: Record<string, any>
    overwrittenProps?: Record<string, any>
  },
  propsOverrides?: Record<string, Record<string, string>>
): string {
  const adapterGroupLabel = getDisplayName(adapterName)

  const omittedList = adapterTypeInfo?.omittedProps ?? []
  const unavailablePool = adapterTypeInfo?.unavailableProps ?? {}
  const overwrittenPool = adapterTypeInfo?.overwrittenProps ?? {}

  // Build categorized lists from omitted props based on propsOverrides
  const unavailable: Array<[string, { type: string; description: string }]> = []
  const modified: Array<[string, { type: string; description: string }]> = []

  for (const name of omittedList) {
    const info = unavailablePool[name] ||
      overwrittenPool[name] || { type: '', description: '' }
    const unavailableOverride = propsOverrides?.unavailable?.[name]
    const modifiedOverride = propsOverrides?.modified?.[name]

    if (unavailableOverride !== undefined) {
      if (unavailableOverride === '') continue
      unavailable.push([
        name,
        { type: info.type || '', description: unavailableOverride },
      ])
    } else if (modifiedOverride !== undefined) {
      if (modifiedOverride === '') continue
      modified.push([
        name,
        { type: info.type || '', description: modifiedOverride },
      ])
    }
  }

  const adapterProps = Object.entries(props).filter(
    ([, prop]) => !prop.private && prop.source === 'adapter'
  )
  const htmlProps = Object.entries(props).filter(
    ([, prop]) => !prop.private && prop.source === 'html'
  )

  const hasUnavailable = unavailable.length > 0
  const hasModified = modified.length > 0
  const hasUnaffected = adapterProps.length > 0 || htmlProps.length > 0

  if (!hasUnavailable && !hasModified && !hasUnaffected) return ''

  const lines: string[] = []

  lines.push('')
  lines.push(`### ${adapterGroupLabel} {#props-${adapterName}}`)

  // --- Unavailable section ---
  const sortedUnavailable = unavailable.sort(([a], [b]) => a.localeCompare(b))
  if (hasUnavailable) {
    lines.push('')
    lines.push(`<!-- @collapsible -->`)
    lines.push('')
    lines.push(
      `#### Unavailable ${adapterGroupLabel} Props {#props-unavailable}`
    )
    lines.push('')
    lines.push(
      `Props that are unavailable because Vueform covers them differently.`
    )
    lines.push('')
    lines.push(`| Prop | Description |`)
    lines.push(`| --- | --- |`)
    for (const [name, info] of sortedUnavailable) {
      const desc = formatTableDesc(info.description || '')
      const typeStr = escTitle(info.type || '')
      lines.push(
        `| [\`${name}\`](!code#props.${name} "${typeStr}") | ${desc} |`
      )
    }
    lines.push('')
    lines.push(`<!-- @endcollapsible -->`)
  }

  // --- Modified section ---
  const sortedModified = modified.sort(([a], [b]) => a.localeCompare(b))
  if (hasModified) {
    lines.push('')
    lines.push(`<!-- @collapsible -->`)
    lines.push('')
    lines.push(`#### Modified ${adapterGroupLabel} Props {#props-modified}`)
    lines.push('')
    lines.push(
      `Props that are defined by ${adapterGroupLabel} and Vueform as well, and might work differently with Vueform.`
    )
    lines.push('')
    lines.push(`| Prop | Description |`)
    lines.push(`| --- | --- |`)
    for (const [name, info] of sortedModified) {
      const desc = formatTableDesc(info.description || '')
      const typeStr = escTitle(info.type || '')
      lines.push(
        `| [\`${name}\`](!code#props.${name} "${typeStr}") | ${desc} |`
      )
    }
    lines.push('')
    lines.push(`<!-- @endcollapsible -->`)
  }

  // --- Unaffected section ---
  const sortedAdapterProps = [...adapterProps].sort(([a], [b]) =>
    a.localeCompare(b)
  )
  const sortedHtmlProps = [...htmlProps].sort(([a], [b]) => a.localeCompare(b))

  if (hasUnaffected) {
    const formatRow = ([name, prop]: [string, any]) => {
      const typeStr =
        prop.type === 'function' ? formatFunctionType(prop) : prop.type
      const desc = formatTableDesc(prop.description || '')
      return `| [\`${name}\`](!code#props.${name} "${escTitle(typeStr)}") | ${desc} |`
    }

    lines.push('')
    lines.push(`<!-- @collapsible closed -->`)
    lines.push('')
    lines.push(`#### Unaffected ${adapterGroupLabel} Props {#props-unaffected}`)
    lines.push('')
    lines.push(
      `${adapterGroupLabel} props that work exactly the same — Vueform does not modify them.`
    )
    lines.push('')
    lines.push(`| Prop | Description |`)
    lines.push(`| --- | --- |`)
    lines.push(...sortedAdapterProps.map(formatRow))
    lines.push(...sortedHtmlProps.map(formatRow))
    lines.push('')
    lines.push(`<!-- @endcollapsible -->`)
  }

  lines.push('')

  return lines.join('\n')
}

const STATIC_ELEMENTS = new Set(['VfButton', 'VfContent'])
const NON_ELEMENT_COMPONENTS = new Set([
  'VfForm',
  'VfCol',
  'VfRow',
  'VfLayout',
  'VfElements',
  'VfNav',
  'VfSteps',
  'VfTabs',
  'VfLanguages',
  'VfIcon',
  'VfAddon',
  'VfStatic',
])

function getComponentGroupLabel(componentName: string): string {
  if (STATIC_ELEMENTS.has(componentName)) return 'Element'
  if (NON_ELEMENT_COMPONENTS.has(componentName)) return 'Component'
  return 'Input'
}

function generatePropsSections(
  props: Record<string, any>,
  componentName: string,
  adapterName?: string
): string {
  const componentGroupId = componentName.replace(/^Vf/, '').toLowerCase()
  const componentGroupLabel = getComponentGroupLabel(componentName)

  type PropEntry = [string, any]

  const adapterGroupId = adapterName ?? ''
  const adapterGroupLabel = adapterName ? getDisplayName(adapterName) : ''

  const grouped = new Map<string, PropEntry[]>()
  const ungrouped: PropEntry[] = []

  for (const [name, prop] of Object.entries(props)) {
    if (prop.private) continue

    if (adapterName && prop.source === 'adapter') {
      continue
    }

    if (prop.source === 'html') {
      if (adapterName) continue
      if (!grouped.has('html')) grouped.set('html', [])
      grouped.get('html')!.push([name, prop])
      continue
    }

    const groupId = PROP_MEMBER_TO_GROUP.get(name)
    if (
      groupId &&
      groupId !== 'html' &&
      (COMMON_PROP_GROUPS_SET.has(groupId) || groupId === componentGroupId)
    ) {
      if (!grouped.has(groupId)) grouped.set(groupId, [])
      grouped.get(groupId)!.push([name, prop])
    } else {
      ungrouped.push([name, prop])
    }
  }

  const propMemberOrder = new Map<string, number>()
  for (const group of PROP_GROUPS) {
    for (let i = 0; i < group.members.length; i++) {
      if (group.id === 'html' && propMemberOrder.has(group.members[i])) continue
      propMemberOrder.set(group.members[i], i)
    }
  }
  for (const [, items] of grouped) {
    items.sort(
      (a, b) =>
        (propMemberOrder.get(a[0]) ?? 9999) -
        (propMemberOrder.get(b[0]) ?? 9999)
    )
  }

  if (ungrouped.length > 0) {
    if (grouped.has(componentGroupId)) {
      grouped.get(componentGroupId)!.push(...ungrouped)
    } else {
      grouped.set(componentGroupId, ungrouped)
    }
  }

  const groupLabels = new Map<string, string>()
  for (const g of PROP_GROUPS) groupLabels.set(g.id, g.label)
  if (adapterName) groupLabels.set(adapterGroupId, adapterGroupLabel)
  if (!groupLabels.has(componentGroupId)) {
    groupLabels.set(componentGroupId, componentGroupLabel)
  }

  const lines: string[] = ['', '<!-- @collapsible -->', '']

  function appendSection(groupId: string, label: string, items: PropEntry[]) {
    lines.push(`### ${label} {#props-${groupId}}`, '')
    lines.push(`| Prop | Default | Description |`)
    lines.push(`| --- | --- | --- |`)
    for (const [name, prop] of items) {
      const typeStr =
        prop.type === 'function' ? formatFunctionType(prop) : prop.type
      let desc = formatTableDesc(prop.description || '')
      if (prop.required) desc = `**Required.** ${desc}`
      const def = formatDefault(prop.default, { ...prop, _name: name })
      lines.push(
        `| [\`${name}\`](!code#props.${name} "${escTitle(typeStr)}") | ${def} | ${desc} |`
      )
    }
    lines.push('')
  }

  const rendered = new Set<string>()

  for (const group of PROP_GROUPS) {
    if (group.id !== 'general') continue
    if (!grouped.has(group.id)) continue
    appendSection(group.id, group.label, grouped.get(group.id)!)
    rendered.add(group.id)
  }

  if (grouped.has(componentGroupId) && !rendered.has(componentGroupId)) {
    appendSection(
      componentGroupId,
      groupLabels.get(componentGroupId)!,
      grouped.get(componentGroupId)!
    )
    rendered.add(componentGroupId)
  }

  for (const group of PROP_GROUPS) {
    if (rendered.has(group.id) || !grouped.has(group.id)) continue
    appendSection(group.id, group.label, grouped.get(group.id)!)
    rendered.add(group.id)
  }

  lines.push('<!-- @endcollapsible -->', '')

  return lines.join('\n')
}

function generateEventsTable(events: Record<string, any>): string {
  const rows: string[] = []

  for (const [name, event] of sortByOrder(events, ORDERS.events)) {
    let paramStr = '—'
    if (event.params && Object.keys(event.params).length) {
      paramStr = Object.entries(event.params)
        .map(([pName, pData]: [string, any]) => {
          const type =
            pData.type === 'function'
              ? formatFunctionType(pData)
              : pData.type || 'any'
          return `[\`${pName}\`](!code#events.${name}.${pName} "${escTitle(type)}")`
        })
        .join(', ')
    }

    const desc = formatTableDesc(event.description || '')
    rows.push(`| \`${name}\` | ${paramStr} | ${desc} |`)
  }

  return [
    '',
    `| Name | Params | Description |`,
    `| --- | --- | --- |`,
    ...rows,
    '',
  ].join('\n')
}

function generateSlotsTable(slots: Record<string, any>): string {
  const rows: string[] = []

  for (const [name, slot] of sortByOrder(slots, BASE_SLOT_ORDER)) {
    let scope: string
    if (slot.exposes) {
      scope = `[\`Context\`](#context "Full context available. Click to see")`
    } else if (slot.params && Object.keys(slot.params).length) {
      scope = Object.entries(slot.params)
        .map(([pName, pData]: [string, any]) => {
          const type =
            pData.type === 'function'
              ? formatFunctionType(pData)
              : pData.type || 'any'
          return `[\`${pName}\`](!code#slot.${name}.${pName} "${escTitle(type)}")`
        })
        .join(' ')
    } else {
      scope = '—'
    }

    const desc = formatTableDesc(slot.description || '')
    rows.push(`| \`${name}\` | ${scope} | ${desc} |`)
  }

  return [
    '',
    `| Name | Scope | Description |`,
    `| --- | --- | --- |`,
    ...rows,
    '',
  ].join('\n')
}

const IS_PASCAL = /^[A-Z]/

function resolveTagLink(tag: string, adapterName: string): string | undefined {
  if (tag.startsWith('Vf')) {
    return `./${tag}.md`
  }

  const config = getTagLinks(adapterName)
  if (!config) return undefined
  if (!IS_PASCAL.test(tag)) return undefined

  if (config.overrides[tag]) return config.overrides[tag]

  return config.pattern.replace('{tag}', tag.toLowerCase())
}

function formatPartElement(raw: string, adapterName: string): string {
  const tags = raw.split(/\s*\|\s*/)
  return tags
    .map((t) => {
      const link = resolveTagLink(t.trim(), adapterName)
      return link ? `[\`<${t.trim()}>\`](${link})` : `\`<${t.trim()}>\``
    })
    .join(' ')
}

function formatPartClasses(classDefault: string): string {
  return classDefault
    .split(/\s+/)
    .filter(Boolean)
    .map((cls) => `\`.${cls}\``)
    .join(' ')
}

function generatePartsSection(
  parts: Record<string, any>,
  classes: Record<string, any>,
  adapterName: string
): string {
  const sections: string[] = ['']

  for (const [name, part] of sortByOrder(parts, BASE_PART_ORDER)) {
    const desc = part.description || ''
    const element = part.tag ? formatPartElement(part.tag, adapterName) : '—'
    const classDefault = classes[name]?.default || ''
    const classesFormatted = classDefault
      ? formatPartClasses(classDefault)
      : undefined

    const rows: string[] = []
    rows.push(`| **Element** | ${element} |`)
    if (classesFormatted) {
      rows.push(`| **Classes** | ${classesFormatted} |`)
    }

    sections.push(`### \`${name}\``)
    sections.push('')
    sections.push(desc)
    sections.push('')
    sections.push('| | |')
    sections.push('| --- | --- |')
    sections.push(...rows)
    sections.push('')
  }

  return sections.join('\n')
}

const TOKENS_FILE = path.join(ROOT, 'packages/core/src/tokens/index.ts')

/**
 * Derive VfLayout-provided classes by scanning element.scss for top-level
 * `.vf-*` selectors. Covers structural classes, helper classes like
 * `vf-space-top-1`, `vf-line-top`, etc.
 */
function deriveElementClassesFromScss(): string[] {
  const elementScssPath = path.join(SCSS_DIR, 'element.scss')
  if (!fs.existsSync(elementScssPath)) return []
  const content = fs.readFileSync(elementScssPath, 'utf-8')
  const classes = new Set<string>()

  for (const line of content.split('\n')) {
    if (/^\.[a-z]/.test(line)) {
      const matches = line.match(/\.vf-[\w-]+/g)
      if (matches) {
        for (const m of matches) classes.add(m.slice(1))
      }
    }
  }

  return [...classes]
}

/**
 * Parse an adapter's config.ts to extract vf-* class names from
 * baseClasses['*element']. Handles both string values and function return
 * objects with class-name keys.
 */
function deriveElementClassesFromConfig(configPath: string): string[] {
  if (!fs.existsSync(configPath)) return []
  const content = fs.readFileSync(configPath, 'utf-8')

  const elementBlockMatch = content.match(
    /['"]?\*element['"]?\s*:\s*\{([\s\S]*?)\n  \}/
  )
  if (!elementBlockMatch) return []

  const block = elementBlockMatch[1]
  const classes = new Set<string>()

  const vfClassPattern = /['"]?(vf-[\w-]+)['"]?/g
  let m: RegExpExecArray | null
  while ((m = vfClassPattern.exec(block)) !== null) {
    classes.add(m[1])
  }

  return [...classes]
}

/**
 * Derive the full set of VfLayout classes for a given adapter. Uses the
 * adapter's config.ts baseClasses['*element'] as the source of truth. Falls
 * back to SCSS-derived classes only if config parsing fails.
 */
function deriveElementClasses(adapterConfigPath?: string): string[] {
  if (adapterConfigPath) {
    const configClasses = deriveElementClassesFromConfig(adapterConfigPath)
    if (configClasses.length > 0) return configClasses
  }

  return deriveElementClassesFromScss()
}

/**
 * Build a set of CSS variable names that are "shared element tokens" — the
 * tokens used by VfLayout's non-conditional default classes as listed in
 * classes.json.
 */
function buildSharedElementTokenVars(
  classNames: string[],
  classesJson: Record<string, any>
): Set<string> {
  const vars = new Set<string>()
  for (const className of classNames) {
    const entry = classesJson[className]
    if (entry?.tokens) {
      for (const v of entry.tokens) vars.add(v)
    }
  }
  return vars
}

function buildScssClassVarsMap(
  additionalScssDirs?: string[]
): Map<string, Set<string>> {
  const classVars = new Map<string, Set<string>>()
  const dirs = [SCSS_DIR, ...(additionalScssDirs || [])]

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.scss'))

    for (const file of files) {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8')

      const lines = content.split('\n')
      const cleaned = lines
        .map((line) => {
          const commentIdx = line.indexOf('//')
          if (commentIdx === -1) return line
          const before = line.slice(0, commentIdx)
          const sq = (before.split("'").length - 1) % 2
          const dq = (before.split('"').length - 1) % 2
          if (sq === 0 && dq === 0) return before
          return line
        })
        .join('\n')

      parseScssBlock(cleaned, classVars)
    }
  }

  return classVars
}

function parseScssBlock(
  css: string,
  classVars: Map<string, Set<string>>
): void {
  let i = 0
  const len = css.length

  while (i < len) {
    while (i < len && /\s/.test(css[i])) i++
    if (i >= len) break

    if (css[i] === '@') {
      // Non-block at-rules (@use, @import, @forward) end at semicolon
      const semiIdx = css.indexOf(';', i)
      const braceIdx = css.indexOf('{', i)
      if (semiIdx !== -1 && (braceIdx === -1 || semiIdx < braceIdx)) {
        i = semiIdx + 1
        continue
      }
      if (braceIdx === -1) break
      i = skipScssBlock(css, braceIdx)
      continue
    }

    const braceStart = css.indexOf('{', i)
    if (braceStart === -1) break

    const selectorStr = css.slice(i, braceStart).trim()
    const blockEnd = skipScssBlock(css, braceStart)
    const blockContent = css.slice(braceStart + 1, blockEnd - 1)

    const classNames = extractVfClasses(selectorStr)

    if (classNames.length > 0) {
      const vars = new Set<string>()
      const varRegex = /var\((--vf-[\w-]+)/g
      let m
      while ((m = varRegex.exec(blockContent)) !== null) vars.add(m[1])

      for (const cls of classNames) {
        if (!classVars.has(cls)) classVars.set(cls, new Set())
        const set = classVars.get(cls)!
        for (const v of vars) set.add(v)
      }
    }

    i = blockEnd
  }
}

function skipScssBlock(css: string, openBrace: number): number {
  let depth = 1
  let i = openBrace + 1
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') depth--
    i++
  }
  return i
}

function extractVfClasses(selector: string): string[] {
  const parts = selector.split(',')
  const classes: string[] = []

  for (const part of parts) {
    const withoutHas = part.replace(/:has\([^)]*\)/g, '')
    const compounds = withoutHas.split(/\s*[>+~]\s*|\s+/).filter(Boolean)
    const lastCompound = compounds[compounds.length - 1] || ''

    const matches = lastCompound.match(/\.vf-[\w-]+/g)
    if (matches) {
      for (const m of matches) classes.push(m.slice(1))
    }
  }

  return [...new Set(classes)]
}

function extractUseClassesBody(script: string): string | undefined {
  const start = script.indexOf('useClasses(')
  if (start === -1) return undefined

  const arrow = script.indexOf('=>', start)
  if (arrow === -1) return undefined

  const objStart = script.indexOf('{', arrow)
  if (objStart === -1) return undefined

  let depth = 0
  for (let i = objStart; i < script.length; i++) {
    const ch = script[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return script.slice(objStart + 1, i)
    }
  }

  return undefined
}

function findHtmlTagEnd(source: string, from: number): number {
  let quote: '"' | "'" | undefined
  for (let i = from; i < source.length; i++) {
    const ch = source[i]
    if (quote) {
      if (ch === quote) quote = undefined
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '>') return i
  }
  return -1
}

function extractScriptBodies(vueContent: string): string[] {
  const bodies: string[] = []
  let i = 0

  while (i < vueContent.length) {
    const start = vueContent.indexOf('<script', i)
    if (start === -1) break

    const next = vueContent[start + 7]
    if (next && next !== '>' && !/\s/.test(next)) {
      i = start + 7
      continue
    }

    const tagEnd = findHtmlTagEnd(vueContent, start)
    if (tagEnd === -1) break
    const close = vueContent.indexOf('</script>', tagEnd)
    if (close === -1) break
    bodies.push(vueContent.slice(tagEnd + 1, close))
    i = close + 9
  }

  return bodies
}

function extractComponentCssClasses(vueContent: string): string[] {
  const classes: string[] = []

  for (const script of extractScriptBodies(vueContent)) {
    const classesBody = extractUseClassesBody(script)
    if (!classesBody) continue

    let m
    const classRe = /'([^']*vf-[\w-]+[^']*)'/g
    while ((m = classRe.exec(classesBody)) !== null) {
      for (const cls of m[1].split(/\s+/)) {
        if (cls.startsWith('vf-')) classes.push(cls)
      }
    }
  }

  return [...new Set(classes)]
}

function componentUsesVfLayout(vueContent: string): boolean {
  const tpl = vueContent.match(/<template>([\s\S]*)<\/template>/)
  if (!tpl) return false
  return tpl[1].includes('<VfLayout')
}

function appendTokensBySubgroup(
  cssVars: string[],
  tokens: Record<string, TokenJsonEntry>,
  cssLines: string[],
  jsLines: string[]
): void {
  const subGroups = new Map<string, string[]>()
  for (const cssVar of cssVars) {
    const sg = tokens[cssVar]?.subgroup ?? ''
    if (!subGroups.has(sg)) subGroups.set(sg, [])
    subGroups.get(sg)!.push(cssVar)
  }

  let firstCss = true
  let firstJs = true
  for (const [, vars] of subGroups) {
    let cssGroupHasEntries = false
    let jsGroupHasEntries = false
    for (const cssVar of vars.sort()) {
      const entry = tokens[cssVar]!
      if (!entry.key) continue
      const def = entry.default ?? ''
      const cssVal = def
        .replace(/\$([a-zA-Z]\w*)/g, (_, k) => `var(--vf-${camelToKebab(k)})`)
        .replace(/\\"/g, '"')

      if (!cssGroupHasEntries && !firstCss) cssLines.push('')
      cssGroupHasEntries = true
      cssLines.push(`  ${cssVar}: ${cssVal};`)

      if (!jsGroupHasEntries && !firstJs) jsLines.push('')
      jsGroupHasEntries = true
      const jsVal = def.replace(/\\"/g, '"')
      const quoted = jsVal.includes("'") ? JSON.stringify(jsVal) : `'${jsVal}'`
      jsLines.push(`  ${entry.key}: ${quoted},`)
    }
    if (cssGroupHasEntries) firstCss = false
    if (jsGroupHasEntries) firstJs = false
  }
}

function generateTokensSection(
  componentName: string,
  scssClassVars: Map<string, Set<string>>,
  tokensJson: Record<string, TokenJsonEntry>,
  tokenGroupOrder: string[],
  elementClasses: string[],
  elementTokenVars: Set<string>,
  adapterPackagePath?: string,
  adapterTokensJson?: Record<string, TokenJsonEntry>
): string {
  // Resolve .vue file: adapter package first, then core
  let vuePath: string | undefined
  if (adapterPackagePath) {
    const adapterVue = path.join(
      ROOT,
      adapterPackagePath,
      'src/components',
      componentName,
      `${componentName}.vue`
    )
    if (fs.existsSync(adapterVue)) vuePath = adapterVue
  }
  if (!vuePath) {
    vuePath = path.join(
      CORE_COMPONENTS_DIR,
      componentName,
      `${componentName}.vue`
    )
  }

  if (!fs.existsSync(vuePath)) return '\n*No tokens used by this component.*\n'

  const vueContent = fs.readFileSync(vuePath, 'utf-8')
  let cssClasses = extractComponentCssClasses(vueContent)

  if (componentName === 'VfLayout' || componentUsesVfLayout(vueContent)) {
    cssClasses = [...cssClasses, ...elementClasses]
  }

  // Only keep classes that exist as top-level selectors in SCSS
  cssClasses = cssClasses.filter((cls) => scssClassVars.has(cls))

  if (cssClasses.length === 0) return '\n*No tokens used by this component.*\n'

  const allVars = new Set<string>()
  for (const cls of cssClasses) {
    const vars = scssClassVars.get(cls)!
    for (const v of vars) allVars.add(v)
  }

  if (allVars.size === 0) return '\n*No tokens used by this component.*\n'

  const mergedTokens = adapterTokensJson
    ? { ...tokensJson, ...adapterTokensJson }
    : tokensJson

  const usesElement =
    componentName === 'VfLayout' || componentUsesVfLayout(vueContent)

  const TOKEN_DISPLAY_ORDER = [
    'component',
    'element',
    'semantic',
    'primitives',
  ] as const
  const buckets = new Map<string, Set<string>>()
  for (const b of TOKEN_DISPLAY_ORDER) buckets.set(b, new Set())

  for (const cssVar of allVars) {
    const entry = mergedTokens[cssVar]
    if (!entry) continue

    let bucket: string
    if (entry.group === 'primitives' || entry.group === 'semantic') {
      bucket = entry.group
    } else if (usesElement && elementTokenVars.has(cssVar)) {
      bucket = 'element'
    } else {
      bucket = 'component'
    }
    buckets.get(bucket)!.add(cssVar)
  }

  const hasTokens = [...buckets.values()].some((s) => s.size > 0)
  if (!hasTokens) return '\n*No tokens used by this component.*\n'

  const BUCKET_LABELS: Record<string, string> = {
    component: usesElement ? 'Element' : 'Component',
    element: 'Shared element layout',
    semantic: 'Semantic',
    primitives: 'Primitives',
  }

  const cssLines: string[] = []
  const jsLines: string[] = []

  for (const bucket of TOKEN_DISPLAY_ORDER) {
    const vars = buckets.get(bucket)!
    if (vars.size === 0) continue

    if (cssLines.length > 0) {
      cssLines.push('')
      jsLines.push('')
    }
    cssLines.push(`  /**`)
    cssLines.push(`   * ${BUCKET_LABELS[bucket]} tokens`)
    cssLines.push(`   * ${'-'.repeat(74)} */`)
    jsLines.push(`  /**`)
    jsLines.push(`   * ${BUCKET_LABELS[bucket]} tokens`)
    jsLines.push(`   * ${'-'.repeat(74)} */`)

    if (bucket === 'component' || bucket === 'element') {
      const groups = new Map<string, string[]>()
      for (const cssVar of vars) {
        const group = mergedTokens[cssVar]!.group
        if (!groups.has(group)) groups.set(group, [])
        groups.get(group)!.push(cssVar)
      }

      const sortedGroups = [...groups.entries()].sort((a, b) => {
        const ai = tokenGroupOrder.indexOf(a[0])
        const bi = tokenGroupOrder.indexOf(b[0])
        return ai - bi
      })

      let firstGroup = true
      for (const [, groupVars] of sortedGroups) {
        if (!firstGroup) {
          cssLines.push('')
          jsLines.push('')
        }
        firstGroup = false
        appendTokensBySubgroup(groupVars, mergedTokens, cssLines, jsLines)
      }
    } else {
      appendTokensBySubgroup([...vars], mergedTokens, cssLines, jsLines)
    }
  }

  const lines: string[] = [
    '',
    '<!-- @subtabs -->',
    '<!-- @subtab CSS -->',
    '',
    '```css',
    ':root {',
    ...cssLines,
    '}',
    '```',
    '',
    '<!-- @endsubtab -->',
    '<!-- @subtab JS -->',
    '',
    '```ts',
    '{',
    ...jsLines,
    '}',
    '```',
    '',
    '<!-- @endsubtab -->',
    '<!-- @endsubtabs -->',
    '',
  ]

  return lines.join('\n')
}

// ========= SCAFFOLD & SECTION REPLACEMENT =========

function generateScaffold(componentName: string): string {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template not found: ${TEMPLATE_PATH}`)
  }

  return fs
    .readFileSync(TEMPLATE_PATH, 'utf-8')
    .replace(/ComponentName/g, componentName)
}

function replaceSection(
  content: string,
  marker: string,
  newContent: string
): string {
  const startTag = `<!-- @${marker}-start -->`
  const endTag = `<!-- @${marker}-end -->`

  const startIdx = content.indexOf(startTag)
  const endIdx = content.indexOf(endTag)

  if (startIdx === -1 || endIdx === -1) return content

  return (
    content.slice(0, startIdx + startTag.length) +
    newContent +
    content.slice(endIdx)
  )
}

function removeTab(content: string, tabName: string): string {
  const escapedName = tabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `\\n*<!-- @tab ${escapedName} -->[\\s\\S]*?<!-- @endtab -->\\n?`
  )
  return content.replace(regex, '\n')
}

const DOC_TABS = [
  'Usage',
  'Props',
  'Context',
  'Events',
  'Slots',
  'Parts',
  'Tokens',
] as const

function extractTabFromTemplate(tabName: string): string {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
  const escapedName = tabName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = template.match(
    new RegExp(`<!-- @tab ${escapedName} -->[\\s\\S]*?<!-- @endtab -->`)
  )
  if (!match) {
    throw new Error(`Tab "${tabName}" not found in ${TEMPLATE_PATH}`)
  }
  return match[0]
}

function ensureTab(
  content: string,
  tabName: string,
  componentName: string
): string {
  if (content.includes(`<!-- @tab ${tabName} -->`)) return content

  const tab = extractTabFromTemplate(tabName).replace(
    /ComponentName/g,
    componentName
  )
  const idx = DOC_TABS.indexOf(tabName as (typeof DOC_TABS)[number])

  for (let i = idx + 1; i < DOC_TABS.length; i++) {
    const next = content.indexOf(`<!-- @tab ${DOC_TABS[i]} -->`)
    if (next !== -1) {
      return content.slice(0, next) + tab + '\n' + content.slice(next)
    }
  }

  const endTabs = content.lastIndexOf('<!-- @endtabs -->')
  if (endTabs === -1) return content
  return content.slice(0, endTabs) + tab + '\n' + content.slice(endTabs)
}

// ================ MAIN ================

function processComponents(
  components: Record<string, any>,
  adapterName: string,
  outputDir: string,
  blueprints: any,
  features: any,
  composables: any,
  adapterFeatures: any | undefined,
  isAdapter: boolean,
  scssClassVars: Map<string, Set<string>>,
  tokensJson: Record<string, TokenJsonEntry>,
  tokenGroupOrder: string[],
  elementClasses: string[],
  elementTokenVars: Set<string>,
  adapterPackagePath?: string,
  adapterTokensJson?: Record<string, TokenJsonEntry>
): { created: number; updated: number; skipped: number } {
  fs.mkdirSync(outputDir, { recursive: true })

  const propsOverrides: Record<string, Record<string, string>> | undefined =
    isAdapter ? adapters[adapterName]?.frameworkProps : undefined

  let created = 0
  let updated = 0
  let skipped = 0

  for (const componentName of Object.keys(components)) {
    if (isAdapter && SHARED_COMPONENTS.has(componentName)) {
      skipped++
      continue
    }
    if (!isAdapter && !SHARED_COMPONENTS.has(componentName)) {
      skipped++
      continue
    }

    const comp = components[componentName]
    const outPath = path.join(outputDir, `${componentName}.md`)

    let content: string
    let isNew = false

    if (fs.existsSync(outPath)) {
      content = fs.readFileSync(outPath, 'utf-8')
    } else {
      content = generateScaffold(componentName)
      isNew = true
    }

    const blueprintName = comp.blueprint
    const contextEntries = resolveContext(
      blueprintName,
      blueprints,
      features,
      composables,
      comp.adapterFeatures,
      adapterFeatures,
      comp.api
    )

    content = replaceSection(
      content,
      'context',
      generateContextSections(contextEntries, componentName)
    )
    content = replaceSection(
      content,
      'props',
      generatePropsSections(
        comp.props || {},
        componentName,
        isAdapter ? adapterName : undefined
      )
    )
    const propsIntro = generatePropsIntro(
      comp.props || {},
      isAdapter ? adapterName : undefined
    )
    if (propsIntro) {
      content = replaceSection(content, 'props-intro', propsIntro)
    }
    if (isAdapter) {
      if (!content.includes('<!-- @props-adapter-start -->')) {
        const propsEndTag = '<!-- @props-end -->'
        const propsEndIdx = content.indexOf(propsEndTag)
        if (propsEndIdx !== -1) {
          const insertPos = propsEndIdx + propsEndTag.length
          content =
            content.slice(0, insertPos) +
            '\n\n<!-- @props-adapter-start -->\n<!-- @props-adapter-end -->' +
            content.slice(insertPos)
        }
      }
      const adapterPropsContent = generateAdapterPropsSections(
        comp.props || {},
        adapterName,
        comp.adapterTypeInfo,
        propsOverrides
      )
      content = replaceSection(content, 'props-adapter', adapterPropsContent)
    }
    content = replaceSection(
      content,
      'events',
      generateEventsTable(comp.events || {})
    )
    content = replaceSection(
      content,
      'slots',
      generateSlotsTable(comp.slots || {})
    )
    content = ensureTab(content, 'Parts', componentName)
    content = ensureTab(content, 'Tokens', componentName)
    const partsContent = comp.parts || {}
    const classesContent = comp.classes || {}
    content = replaceSection(
      content,
      'parts',
      generatePartsSection(partsContent, classesContent, adapterName)
    )

    const tokensContent = generateTokensSection(
      componentName,
      scssClassVars,
      tokensJson,
      tokenGroupOrder,
      elementClasses,
      elementTokenVars,
      adapterPackagePath,
      adapterTokensJson
    )
    content = replaceSection(content, 'tokens', tokensContent)

    const hasParts = Object.keys(partsContent).length > 0
    const hasTokens = !tokensContent.includes(
      '*No tokens used by this component.*'
    )

    if (!hasParts) {
      content = removeTab(content, 'Parts')
    }
    if (!hasTokens) {
      content = removeTab(content, 'Tokens')
    }

    fs.writeFileSync(outPath, content)

    if (isNew) {
      created++
    } else {
      updated++
    }
  }

  return { created, updated, skipped }
}

function removeStaleFiles(
  expectedShared: Set<string>,
  expectedAdapters: Map<string, Set<string>>
) {
  let removed = 0

  for (const entry of fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
    if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      entry.name !== '_template.md' &&
      entry.name !== 'index.md'
    ) {
      const componentName = entry.name.replace(/\.md$/, '')
      if (!expectedShared.has(componentName)) {
        fs.unlinkSync(path.join(COMPONENTS_DIR, entry.name))
        console.log(`[reference] removed stale: ${entry.name}`)
        removed++
      }
    }
  }

  for (const [adapterName, expected] of expectedAdapters) {
    const adapterDir = path.join(DOCS_ROOT, 'src/components', `_${adapterName}`)
    if (!fs.existsSync(adapterDir)) continue

    for (const file of fs.readdirSync(adapterDir)) {
      if (!file.endsWith('.md') || file === 'index.md') continue
      const componentName = file.replace(/\.md$/, '')
      if (!expected.has(componentName)) {
        fs.unlinkSync(path.join(adapterDir, file))
        console.log(
          `[reference] removed stale: _${adapterName}/components/${file}`
        )
        removed++
      }
    }
  }

  if (removed > 0) {
    console.log(`[reference] removed ${removed} stale file(s)`)
  }
}

function main() {
  const blueprints = loadJSON('blueprints.json')
  const features = loadJSON('features.json')
  const composables = JSON.parse(
    fs.readFileSync(path.join(API_DIR, 'core', 'composables.json'), 'utf-8')
  )

  // Load tokens.json and build SCSS class→vars map once
  const tokensJsonPath = path.join(API_DIR, 'core', 'tokens.json')
  const tokensJson: Record<string, TokenJsonEntry> = fs.existsSync(
    tokensJsonPath
  )
    ? JSON.parse(fs.readFileSync(tokensJsonPath, 'utf-8'))
    : {}

  // Derive token group order from tokens.ts source
  const tokensSource = fs.readFileSync(TOKENS_FILE, 'utf-8')
  const tokenGroupOrder = discoverTokenGroups(tokensSource)

  // Derive VfLayout-provided classes per-adapter from element.scss + config.ts
  const uiConfigPath = path.join(ROOT, 'packages/ui/src/config.ts')
  const uiElementClasses = deriveElementClasses(uiConfigPath)

  // Collect adapter SCSS dirs for merged scanning
  const adapterScssDirs: string[] = []
  const adapterElementClassesMap = new Map<string, string[]>()
  adapterElementClassesMap.set('ui', uiElementClasses)

  for (const [adapterName, adapterDef] of Object.entries(adapters)) {
    if (adapterName === 'ui') continue
    const themeScssDir = path.join(ROOT, adapterDef.path, 'src/scss')
    if (fs.existsSync(themeScssDir)) adapterScssDirs.push(themeScssDir)
    const srcDir = path.join(ROOT, adapterDef.path, 'src')
    if (fs.existsSync(srcDir)) adapterScssDirs.push(srcDir)

    const configPath = path.join(ROOT, adapterDef.path, 'src/config.ts')
    adapterElementClassesMap.set(adapterName, deriveElementClasses(configPath))
  }
  const scssClassVars = buildScssClassVarsMap(adapterScssDirs)

  if (Object.keys(tokensJson).length === 0) {
    console.warn(
      '[reference] WARNING: tokens.json not found or empty — run gen:tokens first'
    )
  }

  const expectedShared = new Set<string>()
  const expectedAdapters = new Map<string, Set<string>>()

  // --- Shared (core) components → docs/src/components/ ---
  const coreComponents = loadJSON('components.json')

  const classesJson = JSON.parse(
    fs.readFileSync(path.join(API_DIR, 'core', 'classes.json'), 'utf-8')
  )
  const elementTokenVars = buildSharedElementTokenVars(
    uiElementClasses,
    classesJson
  )

  for (const componentName of Object.keys(coreComponents)) {
    if (SHARED_COMPONENTS.has(componentName)) {
      expectedShared.add(componentName)
    }
  }

  const coreResult = processComponents(
    coreComponents,
    'ui',
    COMPONENTS_DIR,
    blueprints,
    features,
    composables,
    undefined,
    false,
    scssClassVars,
    tokensJson,
    tokenGroupOrder,
    uiElementClasses,
    elementTokenVars
  )
  console.log(
    `[reference] shared: ${coreResult.created} created, ${coreResult.updated} updated, ${coreResult.skipped} skipped`
  )

  // --- Adapter-specific components → docs/src/components/<adapter>/ ---
  for (const [adapterName, adapterDef] of Object.entries(adapters)) {
    const adapterComponents = loadAdapterJSON(adapterName, 'components.json')
    if (!adapterComponents || Object.keys(adapterComponents).length === 0)
      continue

    const adapterSet = new Set<string>()
    for (const componentName of Object.keys(adapterComponents)) {
      if (!SHARED_COMPONENTS.has(componentName)) {
        adapterSet.add(componentName)
      }
    }
    expectedAdapters.set(adapterName, adapterSet)

    const adapterFeatures = loadAdapterJSON(adapterName, 'features.json')
    const adapterBlueprints = loadAdapterJSON(adapterName, 'blueprints.json')
    const mergedBlueprints = { ...blueprints, ...adapterBlueprints }

    const outputDir = path.join(DOCS_ROOT, 'src/components', `_${adapterName}`)

    // Load adapter-specific tokens if available
    const adapterTokensPath = path.join(API_DIR, adapterName, 'tokens.json')
    const adapterTokensJson: Record<string, TokenJsonEntry> | undefined =
      fs.existsSync(adapterTokensPath)
        ? JSON.parse(fs.readFileSync(adapterTokensPath, 'utf-8'))
        : undefined

    const adapterPackagePath =
      adapterName !== 'ui' ? adapterDef.path : undefined

    const adapterElementClasses =
      adapterElementClassesMap.get(adapterName) ?? uiElementClasses

    const adapterElementTokenVars = buildSharedElementTokenVars(
      adapterElementClasses,
      classesJson
    )

    const result = processComponents(
      adapterComponents,
      adapterName,
      outputDir,
      mergedBlueprints,
      features,
      composables,
      Object.keys(adapterFeatures).length > 0 ? adapterFeatures : undefined,
      true,
      scssClassVars,
      tokensJson,
      tokenGroupOrder,
      adapterElementClasses,
      adapterElementTokenVars,
      adapterPackagePath,
      adapterTokensJson
    )
    console.log(
      `[reference] ${adapterName}: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`
    )
  }

  removeStaleFiles(expectedShared, expectedAdapters)
}

try {
  main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
