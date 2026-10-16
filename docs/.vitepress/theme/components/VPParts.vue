<script setup lang="ts">
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'

import { initKeywordPopovers } from '../composables/usePopovers'
import shikiDark from '../style/shiki-dark.json'
import shikiLight from '../style/shiki-light.json'
import VPKeywordCode from './VPKeywordCode.vue'

function shikiColor(
  theme: typeof shikiLight,
  scope: string
): string | undefined {
  for (const rule of theme.tokenColors) {
    const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope]
    if (scopes.includes(scope)) return rule.settings.foreground
  }
  return undefined
}

const shikiVars = {
  light: {
    '--html-fg': shikiLight.colors['editor.foreground'],
    '--html-tag': shikiColor(shikiLight, 'entity.name.tag'),
    '--html-attr': shikiColor(shikiLight, 'entity.name'),
    '--html-string': shikiColor(shikiLight, 'string'),
  },
  dark: {
    '--html-fg': shikiDark.colors['editor.foreground'],
    '--html-tag': shikiColor(shikiDark, 'entity.name.tag'),
    '--html-attr': shikiColor(shikiDark, 'entity.name'),
    '--html-string': shikiColor(shikiDark, 'string'),
  },
} as Record<string, Record<string, string | undefined>>

interface KeywordEntry {
  link?: string
  popover?: Array<string | { type: string; content: string }>
}

const componentsData = ref<Record<string, any>>({})
const classesData = ref<Record<string, any>>({})
const clientKeywordMap = ref<Record<string, KeywordEntry>>({})

async function loadGeneratedData() {
  const [compMod, classesMod, kwMod, typesMod] = await Promise.all([
    // The active adapter's generated data: components/classes come from the
    // api extractor tree at the monorepo root (.vueform/api); keywords/types
    // are docs-generated. The `virtual:vf-generated/*` ids are aliased in
    // config.mts to the active adapter's files, so each build lazily bundles
    // exactly one chunk per file.
    import('virtual:vf-generated/components'),
    import('virtual:vf-generated/classes'),
    import('virtual:vf-generated/keywords'),
    import('virtual:vf-generated/types'),
  ])

  componentsData.value = compMod.default
  classesData.value = classesMod.default

  const map: Record<string, KeywordEntry> = {}
  for (const name of typesMod.default as string[]) {
    map[name] = { popover: [{ type: '$type', content: name }] }
  }
  for (const [k, v] of Object.entries(
    kwMod.default as Record<string, KeywordEntry>
  )) {
    map[k] = map[k] ? { ...map[k], ...v } : v
  }
  for (const [k, v] of Object.entries(map)) {
    if (k.startsWith('.')) {
      const bare = k.slice(1)
      if (!map[bare]) map[bare] = v
    }
  }
  clientKeywordMap.value = map
}

interface TreeNode {
  key: string
  children?: TreeNode[]
  repeatable?: boolean
  callable?: boolean
  count?: number
  description?: string
}

interface ClassItem {
  value: string
  context?: string
}

interface PartParam {
  name: string
  type: string
  description?: string
}

interface PartInfo {
  tag?: string
  description?: string
  classList: ClassItem[]
  tokens: string[]
  params?: PartParam[]
}

const props = defineProps<{
  component?: string
  examples: Record<string, string>
  schema?: Record<string, any>
}>()

const highlightedKey = ref<string | null>(null)
const lockedKey = ref<string | null>(null)
const tooltipAnchor = ref<HTMLElement | null>(null)
const tooltipFromHtml = ref(false)
provide('highlightedKey', highlightedKey)
provide('lockedKey', lockedKey)
provide('keywordMap', clientKeywordMap)
provide('tooltipAnchor', tooltipAnchor)
provide('tooltipFromHtml', tooltipFromHtml)

const activeKey = computed(() => highlightedKey.value ?? lockedKey.value)

const sectionsRef = ref<HTMLElement>()
const previewRef = ref<HTMLElement>()
const tagStyle = ref<Record<string, string>>({})
const lockedTagStyle = ref<Record<string, string>>({})
const tree = ref<TreeNode[]>([])
const activeExample = ref(Object.keys(props.examples)[0])
const viewMode = ref<'preview' | 'html'>('preview')
const showConditional = ref(false)

const partsCache = new Map<string, (...args: any[]) => Record<string, any>>()
const parts = new Proxy({} as Record<string, any>, {
  get(_, key: string) {
    if (!partsCache.has(key)) {
      partsCache.set(key, (...args: any[]) => {
        if (args.length > 1) {
          return {
            'data-section': key,
            'part:root': { 'data-section': key, class: 'vp-no-passthrough' },
          }
        }
        return { 'data-section': key }
      })
    }
    return partsCache.get(key)!
  },
})

const slotScope = computed(() => ({
  schema: {
    ...(props.schema || {}),
    'part:errors': { 'pt:transition:appear': false },
    parts,
  },
}))

function closestSection(target: EventTarget | null): string | null {
  const el = (target as HTMLElement)?.closest?.('[data-section]')
  return el?.getAttribute('data-section') ?? null
}

function onPreviewMouseover(e: Event) {
  const key = closestSection(e.target)
  if (key !== highlightedKey.value) {
    highlightedKey.value = key
  }
  const el = (e.target as HTMLElement)?.closest?.(
    '[data-section]'
  ) as HTMLElement | null
  tooltipAnchor.value = el
  tooltipFromHtml.value = false
}

function onPreviewMouseleave() {
  highlightedKey.value = null
  tooltipAnchor.value = null
}

function onPreviewMousedown(e: Event) {
  e.preventDefault()
}

function onPreviewClick(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  const key = closestSection(e.target)
  if (key) {
    lockedKey.value = lockedKey.value === key ? null : key
    highlightedKey.value = null
    updateTagPosition(key)
    updateLockedTagPosition()
  } else if (lockedKey.value) {
    lockedKey.value = null
    highlightedKey.value = null
  }
}

function bindSectionListeners() {
  if (!previewRef.value) return

  previewRef.value.removeEventListener('mouseover', onPreviewMouseover)
  previewRef.value.removeEventListener('mouseleave', onPreviewMouseleave)
  previewRef.value.removeEventListener('mousedown', onPreviewMousedown, true)
  previewRef.value.removeEventListener('click', onPreviewClick, true)
  previewRef.value.addEventListener('mouseover', onPreviewMouseover)
  previewRef.value.addEventListener('mouseleave', onPreviewMouseleave)
  previewRef.value.addEventListener('mousedown', onPreviewMousedown, true)
  previewRef.value.addEventListener('click', onPreviewClick, true)
}

function buildTree() {
  if (!previewRef.value) return

  function partMeta(key: string) {
    const data = componentData.value
    const part = data?.parts?.[key]
    return {
      callable: part?.type === 'function' || undefined,
      description: part?.description as string | undefined,
    }
  }

  function nodeFromEl(el: Element): TreeNode {
    const key = el.getAttribute('data-section')!
    const children: TreeNode[] = []
    for (const child of el.children) {
      findDirectSections(child, children)
    }
    const filtered = children.filter((c) => c.key !== key)
    const meta = partMeta(key)
    return {
      key,
      children: filtered.length ? filtered : undefined,
      callable: meta.callable,
      description: meta.description,
    }
  }

  function findDirectSections(el: Element, result: TreeNode[]) {
    if (el.hasAttribute('data-section')) {
      const node = nodeFromEl(el)
      const existing = result.find((n) => n.key === node.key)
      if (existing) {
        existing.repeatable = true
        existing.count = (existing.count ?? 1) + 1
      } else {
        result.push(node)
      }
      return
    }
    for (const child of el.children) {
      findDirectSections(child, result)
    }
  }

  const topLevel: TreeNode[] = []
  findDirectSections(previewRef.value, topLevel)
  tree.value = topLevel

  bindSectionListeners()
}

function cleanupJunkAttrs() {
  if (!previewRef.value) return
  previewRef.value.querySelectorAll('[part\\:root]').forEach((el) => {
    el.removeAttribute('part:root')
  })
}

function scheduleRebuild() {
  nextTick(() =>
    nextTick(() => {
      buildTree()
      cleanupJunkAttrs()
    })
  )
}

onMounted(() => {
  scheduleRebuild()
  loadGeneratedData()
})
watch(activeExample, () => {
  lockedKey.value = null
  highlightedKey.value = null
  scheduleRebuild()
})

watch(viewMode, (mode) => {
  if (mode === 'preview') {
    nextTick(() => {
      updateTagPosition(activeKey.value)
      updateLockedTagPosition()
    })
  }
})

function isSrOnly(key: string): boolean {
  if (!previewRef.value) return false
  const el = previewRef.value.querySelector(`[data-section="${key}"]`)
  return el?.classList.contains('sr-only') ?? false
}

function computeTagStyle(key: string): Record<string, string> | null {
  if (!previewRef.value) return null
  const el = previewRef.value.querySelector(`[data-section="${key}"]`)
  if (!el) return null
  const previewRect = previewRef.value.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const tagHeight = 18
  return {
    top: `${elRect.top - previewRect.top - tagHeight}px`,
    left: `${elRect.left - previewRect.left}px`,
  }
}

function updateTagPosition(key: string | null) {
  if (!key || !previewRef.value) return
  const style = computeTagStyle(key)
  if (style) tagStyle.value = style
}

function updateLockedTagPosition() {
  if (!lockedKey.value) return
  const style = computeTagStyle(lockedKey.value)
  if (style) lockedTagStyle.value = style
}

watch(activeKey, (key) => {
  updateTagPosition(key)
  updateLockedTagPosition()
})

const exampleKeys = computed(() => Object.keys(props.examples))

const componentData = computed(() => {
  if (!props.component) return null
  return componentsData.value[props.component] ?? null
})

watch(componentData, () => {
  scheduleRebuild()
})

function getPartInfo(key: string | null): PartInfo | null {
  const data = componentData.value
  if (!key || !data) return null

  const part = data.parts?.[key]
  const cls = data.classes?.[key]

  const rawClasses = cls?.default as string | undefined
  const allClasses = rawClasses ? rawClasses.split(' ') : []
  const rootNames = allClasses.map((c) => c.replace(/[?!]+$/, ''))

  // For a (cleaned) modifier name, find the sibling root class that declares it.
  const contextFor = (name: string): string | undefined => {
    for (const sibling of rootNames) {
      if (sibling === name) continue
      if (classesData.value[sibling]?.modifiers?.[name]) return sibling
    }
    return undefined
  }

  const sortedClasses = [...allClasses].sort((a, b) => {
    const aOpt = a.endsWith('?') ? 1 : 0
    const bOpt = b.endsWith('?') ? 1 : 0
    return aOpt - bOpt
  })

  const classList: ClassItem[] = sortedClasses.map((value) => {
    const name = value.replace(/[?!]+$/, '')
    return classesData.value[name]
      ? { value }
      : { value, context: contextFor(name) }
  })

  const tokenSet = new Set<string>()
  for (const value of allClasses) {
    const name = value.replace(/[?!]+$/, '')
    const rootEntry = classesData.value[name]
    if (rootEntry?.tokens) {
      for (const v of rootEntry.tokens) tokenSet.add(v)
      continue
    }
    // Modifier: pull tokens from the declaring root class's modifier entry.
    const ctx = contextFor(name)
    const modEntry = ctx ? classesData.value[ctx]?.modifiers?.[name] : undefined
    if (modEntry?.tokens) {
      for (const v of modEntry.tokens) tokenSet.add(v)
    }
  }

  let params: PartParam[] | undefined
  if (part?.type === 'function' && part.params) {
    params = Object.entries(
      part.params as Record<string, { type: string; description?: string }>
    ).map(([name, info]) => ({
      name,
      type: info.type,
      description: info.description,
    }))
  }

  return {
    tag: part?.tag,
    description: part?.description,
    classList,
    tokens: [...tokenSet].sort(),
    params,
  }
}

function getPartDescription(key: string | null): string | undefined {
  const data = componentData.value
  if (!key || !data) return undefined
  return data.parts?.[key]?.description as string | undefined
}

const tooltipText = computed(() => getPartDescription(highlightedKey.value))

const tooltipStyle = computed(() => {
  const anchor = tooltipAnchor.value
  const container = sectionsRef.value
  if (!anchor || !container || !tooltipText.value) return null
  const containerRect = container.getBoundingClientRect()
  const anchorRect = anchor.getBoundingClientRect()
  if (tooltipFromHtml.value) {
    return {
      top: `${anchorRect.bottom - containerRect.top + 8}px`,
      left: `${anchorRect.left - containerRect.left}px`,
    }
  }
  const anchorCenter =
    anchorRect.left + anchorRect.width / 2 - containerRect.left
  return {
    top: `${anchorRect.bottom - containerRect.top + 8}px`,
    left: `${anchorCenter}px`,
    transform: 'translateX(-50%)',
  }
})

const tooltipArrowStyle = computed(() => {
  if (!tooltipAnchor.value || !sectionsRef.value || !tooltipText.value)
    return null
  if (tooltipFromHtml.value) {
    return { left: '16px', transform: 'rotate(45deg)' }
  }
  return { left: '50%', transform: 'translateX(-50%) rotate(45deg)' }
})

const lockedPartInfo = computed(() => getPartInfo(lockedKey.value))

watch(
  [lockedPartInfo, viewMode],
  () => {
    nextTick(() => initKeywordPopovers())
  },
  { flush: 'post' }
)

const highlightStyle = computed(() => {
  const scope = '.vp-parts-preview'
  const brand = 'var(--vp-c-brand-2)'
  const tint = 'color-mix(in srgb, var(--vp-c-brand-2) 16%, transparent)'
  let css = `${scope} [data-section] { cursor: pointer; transition: none; } ${scope} [data-section] * { pointer-events: none; } ${scope} [data-section] [data-section] { pointer-events: auto; }`
  if (lockedKey.value && !isSrOnly(lockedKey.value)) {
    const la = `[data-section="${lockedKey.value}"]`
    css += ` ${scope} ${la} { box-shadow: inset 0 0 0 9999px ${tint}; outline: 1px solid ${brand}; outline-offset: -1px; border-radius: 0 !important; }`
  }
  if (
    highlightedKey.value &&
    highlightedKey.value !== lockedKey.value &&
    !isSrOnly(highlightedKey.value)
  ) {
    const ha = `[data-section="${highlightedKey.value}"]`
    css += ` ${scope} ${ha} { box-shadow: inset 0 0 0 9999px ${tint}; outline: 1px solid ${brand}; outline-offset: -1px; border-radius: 0 !important; }`
  }
  return css
})

const shikiThemeStyle = (() => {
  const toVars = (vars: Record<string, string | undefined>) =>
    Object.entries(vars)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')

  return (
    `.vp-parts-html { ${toVars(shikiVars.light)} }` +
    ` html.dark .vp-parts-html { ${toVars(shikiVars.dark)} }`
  )
})()

interface HtmlLine {
  key: string
  tag: string
  classes: string[]
  text?: string
  selfClosing: boolean
  isClosing: boolean
  depth: number
}

function getTextContent(key: string): string {
  if (!previewRef.value) return ''
  const el = previewRef.value.querySelector(`[data-section="${key}"]`)
  if (!el) return ''
  const clone = el.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[data-section]').forEach((c) => c.remove())
  return clone.textContent?.trim() ?? ''
}

const htmlLines = computed<HtmlLine[]>(() => {
  const data = componentData.value
  if (!data || !tree.value.length) return []

  const lines: HtmlLine[] = []

  function walk(node: TreeNode, depth: number) {
    const part = data.parts?.[node.key]
    const cls = data.classes?.[node.key]
    const tag = part?.tag?.split(' | ')[0] ?? 'div'

    if (node.repeatable) {
      const count = node.count ?? 1
      for (let i = 0; i < count; i++) {
        lines.push({
          key: node.key,
          tag,
          classes: [],
          selfClosing: true,
          isClosing: false,
          depth,
        })
      }
      return
    }

    const rawClasses = (cls?.default as string) ?? ''
    const classes = rawClasses
      .split(' ')
      .filter((c: string) => {
        if (!c) return false
        if (c.endsWith('?') && !showConditional.value) return false
        return true
      })
      .map((c: string) => c.replace(/[?!]+$/, ''))

    const hasChildren = !!node.children?.length
    const text = hasChildren ? undefined : getTextContent(node.key)
    const selfClosing = !hasChildren && !text

    lines.push({
      key: node.key,
      tag,
      classes,
      text,
      selfClosing,
      isClosing: false,
      depth,
    })

    if (hasChildren) {
      for (const child of node.children!) {
        walk(child, depth + 1)
      }
      lines.push({
        key: node.key,
        tag,
        classes: [],
        selfClosing: false,
        isClosing: true,
        depth,
      })
    }
  }

  for (const root of tree.value) {
    walk(root, 0)
  }

  return lines
})

function onHtmlLineEnter(key: string, e: Event) {
  highlightedKey.value = key
  tooltipAnchor.value = e.target as HTMLElement
  tooltipFromHtml.value = true
}

function onHtmlLineLeave() {
  highlightedKey.value = null
  tooltipAnchor.value = null
}

function onHtmlLineClick(key: string) {
  lockedKey.value = lockedKey.value === key ? null : key
  highlightedKey.value = null
}
</script>

<template>
  <div
    ref="sectionsRef"
    :class="['vp-parts', { 'has-info': lockedKey && lockedPartInfo }]"
  >
    <div v-if="exampleKeys.length > 1" class="vp-parts-tabs">
      <button
        v-for="key in exampleKeys"
        :key="key"
        type="button"
        class="vp-parts-tab"
        :class="{ active: key === activeExample }"
        @click="activeExample = key"
      >
        {{ examples[key] }}
      </button>
    </div>
    <div class="vp-parts-body">
      <div class="vp-parts-outline">
        <div class="vp-parts-outline-label">Parts</div>
        <ul class="vp-parts-outline-tree">
          <VPPartTree
            v-for="(node, i) in tree"
            :key="node.key"
            :node="node"
            :is-last="i === tree.length - 1"
            :is-root="true"
          />
        </ul>
      </div>
      <div class="vp-parts-main">
        <div class="vp-parts-toolbar">
          <div class="vp-parts-view-toggle">
            <button
              type="button"
              :class="['vp-parts-view-btn', { active: viewMode === 'preview' }]"
              @click="viewMode = 'preview'"
            >
              Preview
            </button>
            <button
              type="button"
              :class="['vp-parts-view-btn', { active: viewMode === 'html' }]"
              @click="viewMode = 'html'"
            >
              HTML
            </button>
          </div>
          <label v-if="viewMode === 'html'" class="vp-parts-conditional">
            <input
              v-model="showConditional"
              type="checkbox"
              class="vp-parts-conditional-input"
            />
            Conditional classes
          </label>
        </div>
        <div
          v-show="viewMode === 'preview'"
          ref="previewRef"
          class="vp-parts-preview vp-example-wrapper"
        >
          <template v-for="key in exampleKeys" :key="key">
            <div class="vp-example" v-if="key === activeExample">
              <slot :name="`example-${key}`" v-bind="slotScope" />
            </div>
          </template>
          <div
            v-if="
              lockedKey &&
              highlightedKey &&
              highlightedKey !== lockedKey &&
              !isSrOnly(lockedKey)
            "
            class="vp-part-tag"
            :style="lockedTagStyle"
          >
            <svg
              class="vp-part-tag-lock"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="9"
              height="9"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
              />
            </svg>
            {{ lockedKey }}
          </div>
          <div
            v-if="activeKey && !isSrOnly(activeKey)"
            class="vp-part-tag"
            :style="tagStyle"
          >
            <svg
              v-if="lockedKey === activeKey"
              class="vp-part-tag-lock"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="9"
              height="9"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
              />
            </svg>
            {{ activeKey }}
          </div>
          <component :is="'style'">{{ highlightStyle }}</component>
        </div>
        <div v-if="viewMode === 'html'" class="vp-parts-html language-html">
          <pre><code><span
              v-for="(line, i) in htmlLines"
              :key="i"
              :data-html-key="line.key"
              :class="[
                'line',
                {
                  'is-highlighted':
                    highlightedKey === line.key || lockedKey === line.key,
                },
              ]"
              @mouseenter="onHtmlLineEnter(line.key, $event)"
              @mouseleave="onHtmlLineLeave()"
              @click="onHtmlLineClick(line.key)"
            ><span :style="{ paddingLeft: line.depth * 16 + 'px' }"            ><svg
                v-if="lockedKey === line.key && !line.isClosing"
                class="vp-html-lock"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="10"
                height="10"
              ><path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
                /></svg><template v-if="line.isClosing"
              ><span class="vp-html-bracket">&lt;/</span
              ><span class="vp-html-tag">{{ line.tag }}</span
              ><span class="vp-html-bracket">&gt;</span></template
            ><template v-else-if="line.selfClosing"
              ><span class="vp-html-bracket">&lt;</span
              ><span class="vp-html-tag">{{ line.tag }}</span
              ><template v-if="line.classes.length"
                ><span class="vp-html-attr"> class</span
                ><span class="vp-html-punct">="</span
                ><span class="vp-html-classes"><template
                    v-for="(cls, ci) in line.classes"
                    :key="cls"
                  ><VPKeywordCode :value="cls" />{{
                    ci < line.classes.length - 1 ? ' ' : ''
                  }}</template></span
                ><span class="vp-html-punct">"</span></template
              ><span class="vp-html-bracket"> /&gt;</span></template
            ><template v-else
              ><span class="vp-html-bracket">&lt;</span
              ><span class="vp-html-tag">{{ line.tag }}</span
              ><template v-if="line.classes.length"
                ><span class="vp-html-attr"> class</span
                ><span class="vp-html-punct">="</span
                ><span class="vp-html-classes"><template
                    v-for="(cls, ci) in line.classes"
                    :key="cls"
                  ><VPKeywordCode :value="cls" />{{
                    ci < line.classes.length - 1 ? ' ' : ''
                  }}</template></span
                ><span class="vp-html-punct">"</span></template
              ><span class="vp-html-bracket">&gt;</span
              ><template v-if="line.text"
                ><span class="vp-html-text">{{
                  line.text
                }}</span
                ><span class="vp-html-bracket">&lt;/</span
                ><span class="vp-html-tag">{{ line.tag }}</span
                ><span class="vp-html-bracket">&gt;</span></template
              ></template
            ></span>
</span></code></pre>
        </div>
        <component :is="'style'">{{ shikiThemeStyle }}</component>
      </div>
    </div>
    <div v-if="lockedKey && lockedPartInfo" class="vp-parts-info">
      <div class="vp-parts-info-header">
        <div class="vp-parts-info-title">
          <svg
            class="vp-parts-info-lock"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="12"
            height="12"
          >
            <path
              d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"
            />
          </svg>
          <template v-if="lockedPartInfo.params">
            {{ lockedKey }}(<template
              v-for="(param, i) in lockedPartInfo.params"
              :key="param.name"
              ><a
                class="vp-parts-info-param"
                :data-popover="
                  JSON.stringify([
                    { type: 'code', content: `${param.name}: ${param.type}` },
                    ...(param.description
                      ? [{ type: 'text', content: param.description }]
                      : []),
                  ])
                "
                >{{ param.name }}</a
              >{{ i < lockedPartInfo.params.length - 1 ? ', ' : '' }}</template
            >)
          </template>
          <template v-else>{{ lockedKey }}</template>
        </div>
        <div
          v-if="lockedPartInfo.description"
          class="vp-parts-info-description"
        >
          {{ lockedPartInfo.description }}
        </div>
      </div>
      <table class="vp-parts-info-table">
        <tbody>
          <tr>
            <td width="1" class="vp-parts-info-label">
              <strong>Element</strong>
              <a
                class="vp-parts-info-hint"
                :data-popover="
                  JSON.stringify([
                    {
                      type: 'text',
                      content:
                        'The HTML tag or Vue component rendered by this part.',
                    },
                  ])
                "
              >
                <svg
                  viewBox="0 0 16 16"
                  width="11"
                  height="11"
                  fill="currentColor"
                >
                  <path
                    d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zM8 6a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </a>
            </td>
            <td>
              <div class="vp-parts-info-value">
                <VPKeywordCode
                  v-for="t in lockedPartInfo?.tag?.split(' | ')"
                  :key="t"
                  :value="t"
                  prefix="<"
                  suffix=">"
                />
              </div>
            </td>
          </tr>
          <tr>
            <td width="1" class="vp-parts-info-label">
              <strong>Classes</strong>
              <a
                class="vp-parts-info-hint"
                :data-popover="
                  JSON.stringify([
                    {
                      type: 'text',
                      content:
                        'CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied.',
                    },
                  ])
                "
              >
                <svg
                  viewBox="0 0 16 16"
                  width="11"
                  height="11"
                  fill="currentColor"
                >
                  <path
                    d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zM8 6a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </a>
            </td>
            <td>
              <div
                class="vp-parts-info-value"
                v-if="lockedPartInfo.classList.length"
              >
                <VPKeywordCode
                  v-for="item in lockedPartInfo.classList"
                  :key="item.value"
                  :value="item.value"
                  :context="item.context"
                  prefix="."
                />
              </div>
              <span v-else class="vp-parts-info-none">No classes</span>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- <div class="vp-parts-info-row">
        <span class="vp-parts-info-label">
          Tokens
          <a
            class="vp-parts-info-hint"
            :data-popover="
              JSON.stringify([
                {
                  type: 'text',
                  content:
                    'Design <a href=\'/guide/themes-tokens\'>tokens</a> (CSS custom properties) used by this part\u2019s classes.',
                },
              ])
            "
          >
            <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
              <path
                d="M8 0a8 8 0 100 16A8 8 0 008 0zm1 12H7V7h2v5zM8 6a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </a>
        </span>
        <span class="vp-parts-info-value">
          <template v-if="lockedPartInfo.tokens.length">
            <VPKeywordCode
              v-for="token in lockedPartInfo.tokens"
              :key="token"
              :value="token"
            />
          </template>
          <span v-else class="vp-parts-info-none">No tokens</span>
        </span>
      </div> -->
    </div>
    <div
      v-if="tooltipText && tooltipStyle"
      class="vp-parts-tooltip"
      :style="tooltipStyle"
    >
      <div class="vp-parts-tooltip-arrow" :style="tooltipArrowStyle" />
      {{ tooltipText }}
    </div>
  </div>
</template>
