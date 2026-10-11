<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'

interface KeywordEntry {
  link?: string
  github?: string
  tokens?: string[]
  classes?: string[]
  variants?: Record<string, KeywordEntry>
  popover?: Array<string | { type: string; content: string }>
}

type Block = { type: string; content: string }

const props = defineProps<{
  value: string
  prefix?: string
  suffix?: string
  context?: string
}>()

const keywordMap =
  inject<Ref<Record<string, KeywordEntry>>>('keywordMap') ??
  ref<Record<string, KeywordEntry>>({})

const trailingSuffix = computed(() => {
  const m = props.value.match(/([?!]+)$/)
  return m ? m[1] : ''
})

const cleanValue = computed(() => props.value.replace(/[?!]+$/, ''))

const entry = computed(() => {
  const full = `${props.prefix ?? ''}${cleanValue.value}${props.suffix ?? ''}`
  return keywordMap.value[full] ?? keywordMap.value[cleanValue.value] ?? null
})

const matchedFull = computed(() => {
  const full = `${props.prefix ?? ''}${cleanValue.value}${props.suffix ?? ''}`
  return !!keywordMap.value[full]
})

const hasPopover = computed(
  () => !!(entry.value?.link || entry.value?.popover || entry.value?.variants)
)

const popoverAttr = computed(() => {
  const e = entry.value
  if (!e) return undefined

  // Multi-parent modifier: resolve to a single variant when context is known,
  // otherwise present the list of variants.
  if (e.variants) {
    if (props.context && e.variants[props.context]) {
      const variant = e.variants[props.context]
      return JSON.stringify(normalizeBlocks(variant.popover ?? [], variant))
    }
    return JSON.stringify([
      { type: '$variants', content: resolveVariantsContent(e) },
    ])
  }

  if (!e.popover) return undefined
  return JSON.stringify(normalizeBlocks(e.popover, e))
})

function normalizeBlocks(
  blocks: Array<string | Block>,
  kwEntry: KeywordEntry
): Block[] {
  return blocks.map((b) => {
    if (typeof b === 'string') {
      if (b === '$github')
        return { type: '$github', content: kwEntry.github ?? '' }
      if (b === '$tokens')
        return { type: '$tokens', content: resolveTokensContent(kwEntry) }
      if (b === '$classes')
        return { type: '$classes', content: resolveClassesContent(kwEntry) }
      if (b === '$variants')
        return { type: '$variants', content: resolveVariantsContent(kwEntry) }
      return { type: 'text', content: b }
    }
    return b
  })
}

/**
 * Normalizes a nested entry's popover, dropping cross-reference blocks.
 */
function normalizeNested(kwEntry: KeywordEntry): Block[] | undefined {
  if (!kwEntry.popover?.length) return undefined
  return kwEntry.popover
    .filter((b) => b !== '$tokens' && b !== '$classes' && b !== '$variants')
    .map((b) => {
      if (typeof b === 'string') {
        if (b === '$github')
          return { type: '$github', content: kwEntry.github ?? '' }
        return { type: 'text', content: b }
      }
      return b as Block
    })
}

function resolveTokensContent(kwEntry: KeywordEntry | null): string {
  const tokens = kwEntry?.tokens ?? []
  if (!tokens.length) return '[]'
  const map = keywordMap.value
  const resolved = tokens.map((name) => {
    const tokenEntry = map[name]
    const item: { name: string; popover?: Block[]; link?: string } = { name }
    if (tokenEntry) {
      item.popover = normalizeNested(tokenEntry)
      if (tokenEntry.link) item.link = tokenEntry.link
    }
    return item
  })
  return JSON.stringify(resolved)
}

function resolveClassesContent(kwEntry: KeywordEntry | null): string {
  const classes = kwEntry?.classes ?? []
  if (!classes.length) return '[]'
  const map = keywordMap.value
  const resolved = classes.map((name) => {
    const classEntry = map[name]
    const item: { name: string; popover?: Block[]; link?: string } = { name }
    if (classEntry) {
      item.popover = normalizeNested(classEntry)
      if (classEntry.link) item.link = classEntry.link
    }
    return item
  })
  return JSON.stringify(resolved)
}

function resolveVariantsContent(kwEntry: KeywordEntry | null): string {
  const variants = kwEntry?.variants ?? {}
  const modName = cleanValue.value
  const resolved = Object.entries(variants).map(([parent, variant]) => {
    const display = `.${parent}.${modName}`
    const item: { name: string; popover?: Block[]; link?: string } = {
      name: display,
    }
    if (variant.popover?.length) {
      item.popover = normalizeBlocks(variant.popover, variant)
    }
    if (variant.link) item.link = variant.link
    return item
  })
  return JSON.stringify(resolved)
}
</script>

<template>
  <code v-if="hasPopover">
    {{ matchedFull ? '' : (prefix ?? '') }}
    <a
      class="keyword-link"
      :href="entry.link || undefined"
      :data-popover="popoverAttr"
    >
      {{
        matchedFull ? `${prefix ?? ''}${cleanValue}${suffix ?? ''}` : cleanValue
      }}
    </a>
    {{ matchedFull ? '' : (suffix ?? '') }}{{ trailingSuffix }}
  </code>
  <code v-else>{{ `${prefix ?? ''}${value}${suffix ?? ''}` }}</code>
</template>
