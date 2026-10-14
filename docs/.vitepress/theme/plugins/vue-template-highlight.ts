import type { ShikiTransformer } from 'shiki'

/**
 * Matches an SFC block opener: `<template>`, `<script>`, or `<style>` at the
 * start of a line, column 0. An indented `<template>` is markup inside the
 * template (a slot outlet), and a `<template #slot>` / `v-slot` is a slot
 * definition wherever it sits — neither makes the block an SFC.
 */
const SFC_BLOCK_RE = /^<(template|script|style)\b(?![^>]*(?:#|v-slot))/m

/**
 * Shiki transformer that enables template-only Vue code blocks.
 *
 * When a `vue` code block contains no top-level `<template>`, `<script>`, or
 * `<style>` block, this transformer wraps the content in `<template>` tags
 * before highlighting (so it gets proper Vue template grammar), then strips the
 * wrapper lines from the output.
 */
export function vueTemplateHighlight(): ShikiTransformer {
  let wrapped = false
  return {
    name: 'vue-template-highlight',
    preprocess(code, options) {
      if (options.lang === 'vue' && !SFC_BLOCK_RE.test(code)) {
        wrapped = true
        return `<template>\n${code.trimEnd()}\n</template>`
      }
      wrapped = false
    },
    code(codeEl) {
      if (!wrapped) return
      wrapped = false
      const lines = codeEl.children.filter((c) => c.type === 'element')
      if (lines.length < 2) return
      const first = lines[0]
      const last = lines[lines.length - 1]
      const firstIdx = codeEl.children.indexOf(first)
      const lastIdx = codeEl.children.indexOf(last)
      const remove = new Set([firstIdx, lastIdx])
      if (codeEl.children[firstIdx + 1]?.type === 'text')
        remove.add(firstIdx + 1)
      if (codeEl.children[lastIdx - 1]?.type === 'text') remove.add(lastIdx - 1)
      codeEl.children = codeEl.children.filter((_, i) => !remove.has(i))
    },
  }
}
