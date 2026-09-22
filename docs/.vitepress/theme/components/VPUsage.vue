<script setup lang="ts">
import {
  shallowRef,
  ref,
  computed,
  cloneVNode,
  nextTick,
  onMounted,
  defineComponent,
  h,
  type VNode,
  useSlots,
} from 'vue'

const FormDataView = defineComponent({
  props: ['form'],
  setup(props) {
    return () => {
      const d = props.form?.payload
      const json = d != null ? JSON.stringify(d, null, 2) : ''
      return h(
        'pre',
        { class: 'vp-usage-payload' },
        json.replace(/\u00A0/g, '&nbsp;')
      )
    }
  },
})

const props = defineProps<{
  nomodel?: boolean
  nolive?: boolean
  nocode?: boolean
  model?: boolean
  validate?: boolean
  fit?: boolean
  full?: boolean
  center?: boolean
  middle?: boolean
  rtl?: boolean
  width?: string
}>()

const exampleLanguages = { en_US: 'English', de_DE: 'German' }

const slots = useSlots()
const form$ = shallowRef<any>(null)
const wrapperRef = ref<HTMLElement>()

const activeTab = ref<'preview' | 'template' | 'schema'>('preview')
const showData = ref(props.model ?? false)
const dataHovered = ref(false)
const copied = ref(false)

const toolbarVisible = computed(() => copied.value)

function isVfForm(vnode: VNode): boolean {
  const type = vnode.type
  return (
    typeof type === 'object' &&
    ((type as any).name === 'VfForm' || (type as any).__name === 'VfForm')
  )
}

const hasForm = (slots.default?.() ?? []).some(isVfForm)

let _formRaw: any = null
let _syncQueued = false

const setFormRef = (el: any) => {
  _formRaw = el
  if (!_syncQueued) {
    _syncQueued = true
    nextTick(() => {
      _syncQueued = false
      if (form$.value !== _formRaw) form$.value = _formRaw
    })
  }
}

function onFormMounted(form$: any) {
  if (props.validate) {
    form$.validate()
  }
}

function renderDefault(): VNode[] {
  const extra: Record<string, any> = { ref: setFormRef }
  if (props.validate) {
    extra.onMounted = onFormMounted
  }
  return (slots.default?.() ?? []).map((vn) =>
    isVfForm(vn) ? cloneVNode(vn, extra, true) : vn
  )
}

let previewBlock: HTMLElement | null = null
let templateBlock: HTMLElement | null = null
let schemaBlock: HTMLElement | null = null

function showBlock(tab: 'preview' | 'template' | 'schema') {
  const blocks = [
    { el: previewBlock, name: 'preview' as const },
    { el: templateBlock, name: 'template' as const },
    { el: schemaBlock, name: 'schema' as const },
  ]
  for (const block of blocks) {
    if (block.el) {
      block.el.style.display = block.name === tab ? '' : 'none'
    }
  }
}

function selectTab(tab: 'template' | 'schema') {
  if (activeTab.value === tab) {
    activeTab.value = 'preview'
    showBlock('preview')
  } else {
    activeTab.value = tab
    showBlock(tab)
  }
}

function copyCode() {
  const currentBlock =
    activeTab.value === 'preview'
      ? previewBlock
      : activeTab.value === 'template'
        ? templateBlock
        : schemaBlock

  if (currentBlock) {
    const code = currentBlock.querySelector('pre code')
    if (code) {
      navigator.clipboard.writeText(code.textContent || '')
      copied.value = true
      setTimeout(() => {
        copied.value = false
      }, 2500)
    }
  }
}

function toggleData() {
  showData.value = !showData.value
}

onMounted(() => {
  const wrapper = wrapperRef.value
  if (!wrapper) return

  const codesEl = wrapper.nextElementSibling
  if (!codesEl?.classList.contains('vp-usage-codes')) return

  const codeBlocks = codesEl.querySelectorAll<HTMLElement>(
    ':scope > div[class*="language-"]'
  )

  const blocksContainer = wrapper.querySelector('.vp-usage-blocks')
  if (!blocksContainer) return

  previewBlock = codeBlocks[0] || null
  templateBlock = codeBlocks[1] || null
  schemaBlock = codeBlocks[2] || null

  if (previewBlock) blocksContainer.appendChild(previewBlock)
  if (templateBlock) blocksContainer.appendChild(templateBlock)
  if (schemaBlock) blocksContainer.appendChild(schemaBlock)

  showBlock('preview')

  codesEl.remove()
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="vp-usage"
    :class="{ 'w-fit': fit, 'w-full': full, 'no-live': nolive }"
    :dir="rtl ? 'rtl' : undefined"
  >
    <!-- Live example preview -->
    <!-- <ClientOnly> -->
    <div v-if="!nolive" class="vp-usage-preview">
      <div
        class="vp-usage-example"
        :class="[
          width && !/^\d+$/.test(width) ? `w-${width}` : '',
          fit ? 'w-fit' : '',
          full ? 'w-full' : '',
          middle ? 'vp-usage-middle' : '',
        ]"
        :style="
          width && /^\d+$/.test(width) ? { maxWidth: `${width}px` } : undefined
        "
        :dir="rtl ? 'rtl' : undefined"
      >
        <div v-if="center && !hasForm" class="vp-usage-centered">
          <VfForm
            error-level="element"
            :languages="exampleLanguages"
            :ref="setFormRef"
            @mounted="onFormMounted"
          >
            <slot />
          </VfForm>
        </div>
        <VfForm
          v-else-if="!hasForm"
          error-level="element"
          :languages="exampleLanguages"
          :ref="setFormRef"
          @mounted="onFormMounted"
        >
          <slot />
        </VfForm>
        <div v-else-if="center" class="vp-usage-centered">
          <component :is="renderDefault" />
        </div>
        <component v-else :is="renderDefault" />
      </div>
    </div>

    <!-- Live display panel (above code) -->
    <div
      v-if="!nomodel && !nolive"
      class="vp-usage-data-container"
      :class="{ 'is-open': showData }"
      @mouseenter="dataHovered = true"
      @mouseleave="dataHovered = false"
    >
      <div class="vp-usage-data-inner">
        <button
          v-if="showData && dataHovered"
          class="vp-usage-data-close"
          aria-label="Close payload panel"
          @click="showData = false"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        <FormDataView :form="form$" />
      </div>
    </div>
    <!-- </ClientOnly> -->

    <!-- Code area -->
    <div v-if="!nocode" class="vp-usage-code">
      <!-- Toolbar -->
      <div class="vp-usage-toolbar" :class="{ 'is-active': toolbarVisible }">
        <!-- Action buttons group -->
        <div class="vp-usage-btn-group">
          <button
            class="vp-usage-icon-btn"
            :class="{ 'is-active': activeTab === 'template' }"
            data-tooltip="Toggle full code"
            @click="selectTab('template')"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
          </button>
          <button
            class="vp-usage-icon-btn"
            :class="{ 'is-active': activeTab === 'schema' }"
            data-tooltip="Schema syntax"
            @click="selectTab('schema')"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"
              />
              <path
                d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"
              />
            </svg>
          </button>
          <button
            v-if="!nomodel && !nolive"
            class="vp-usage-icon-btn"
            :class="{ 'is-active': showData }"
            :data-tooltip="showData ? 'Hide form payload' : 'Show form payload'"
            @click="toggleData"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </button>
          <button
            class="vp-usage-icon-btn"
            :class="{ 'is-copied': copied }"
            data-tooltip="Copy code"
            @click="copyCode"
          >
            <span v-if="copied" class="vp-usage-copied-text">Copied</span>
            <svg
              v-else
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path
                d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Code blocks container -->
      <div class="vp-usage-blocks" />
    </div>
  </div>
</template>

<style lang="scss">
.vp-usage {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.vp-usage-preview {
  padding: 2rem;
  background-color: var(--vp-c-bg-example-wrapper);
}

.vp-usage-example {
  background-color: var(--vp-c-bg-example);
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 410px;
  margin: 0 auto;
  box-shadow: 0px 0px 10px 0 rgba(0, 0, 0, 0.1);

  &.w-fit {
    max-width: fit-content;
  }

  &.w-full {
    max-width: 100%;
  }

  &.w-xs {
    max-width: 240px;
  }

  &.w-sm {
    max-width: 320px;
  }

  &.w-md {
    max-width: 410px;
  }

  &.w-lg {
    max-width: 460px;
  }

  &.w-xl {
    max-width: 540px;
  }

  &.w-full {
    max-width: 100%;
  }
}

.vp-usage-centered {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;

  .vf-group-elements {
    justify-content: center;
  }

  .vf-tabs {
    grid-column: span 12 / span 12;
  }

  .p-tablist-tab-list {
    justify-content: center;
  }
}

.vp-usage-middle {
  .vf-group-elements {
    align-items: center;
  }
}

.vp-usage-data-container {
  display: grid;
  grid-template-rows: 0fr;
  background-color: var(--vp-code-block-bg);
  border-bottom: 0px solid var(--vp-code-block-divider-color);
  transition:
    grid-template-rows 0.25s ease,
    border-bottom-width 0.25s ease;

  &.is-open {
    grid-template-rows: 1fr;
    border-bottom-width: 1px;
  }
}

.vp-usage-data-inner {
  overflow: hidden;
  min-height: 0;
  position: relative;
}

.vp-usage-data-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: none;
  border: 0;
  border-radius: 4px;
  color: var(--vp-c-text-3);
  cursor: pointer;
  z-index: 1;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    color: var(--vp-c-text-1);
    background-color: rgba(0, 0, 0, 0.08);
  }
}

.dark .vp-usage-data-close:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.vp-usage-payload {
  margin: 0;
  overflow: hidden;
  min-height: 0;
  padding: 0 24px;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  line-height: 1.7;
  transition: padding 0.25s ease;

  .is-open & {
    padding: 16px 24px;
  }
}

.dark {
  .vp-usage-payload {
    background-color: var(--vp-c-black);
    color: var(--vp-c-text-1);
  }
}

.vp-usage-code {
  position: relative;

  &:hover .vp-usage-toolbar {
    display: flex;
  }
}

.vp-usage-toolbar {
  position: absolute;
  top: 13px;
  right: 12px;
  display: none;
  align-items: center;
  gap: 6px;
  z-index: 3;
  border-radius: 10px;
  animation-duration: 0.3s;
  animation: scalein 0.15s linear;
  transition: opacity 0.2s ease;

  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.1);

  &.is-active {
    display: flex;
  }
}

.dark .vp-usage-toolbar {
  background: rgba(0, 0, 0, 0.1);
}

.vp-usage-btn-group {
  display: flex;
  align-items: center;

  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  gap: 0.5rem;
  justify-content: end;
  padding: 2px;
}

.dark .vp-usage-btn-group {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.vp-usage-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  position: relative;

  background-color: transparent;
  border: 0;
  border-radius: 8px;
  color: var(--vp-c-text-2);
  cursor: pointer;
  outline: 0 none;
  outline-offset: 0;

  > svg {
    pointer-events: none;
  }

  &[data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    font-size: 11px;
    font-family: var(--vp-font-family-base);
    font-weight: 500;
    line-height: 1.4;
    white-space: nowrap;
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    box-shadow: var(--vp-shadow-2);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 10;
  }

  &[data-tooltip]:hover::after {
    opacity: 1;
  }

  .vp-usage-btn-group > &:last-child[data-tooltip]::after {
    left: auto;
    right: 0;
    transform: none;
  }

  .no-live &[data-tooltip]::after {
    bottom: auto;
    top: calc(100% + 6px);
  }

  .no-live .vp-usage-btn-group > &:last-child[data-tooltip]::after {
    left: auto;
    right: 0;
    transform: none;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: var(--vp-c-text-1);
  }

  &.is-active {
    color: var(--vp-c-brand-1);
  }

  &.is-copied {
    width: auto;
    padding: 0 8px;
    color: var(--vp-c-brand-1);
  }
}

.dark .vp-usage-icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.vp-usage-copied-text {
  font-size: 11px;
  font-family: var(--vp-font-family-base);
  font-weight: 500;
  white-space: nowrap;
  padding: 0 4px;
}

.vp-usage-blocks {
  > div[class*='language-'] {
    margin: 0 !important;
    border-radius: 0 !important;

    > button.copy {
      display: none !important;
    }

    > span.lang {
      display: none !important;
    }
  }
}

.vp-usage-codes {
  display: none;
}

@keyframes scalein {
  0% {
    opacity: 0;
    transition:
      transform 0.12s cubic-bezier(0, 0, 0.2, 1),
      opacity 0.12s cubic-bezier(0, 0, 0.2, 1);
  }

  100% {
    opacity: 1;
  }
}
</style>
