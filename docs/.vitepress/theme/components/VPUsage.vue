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
