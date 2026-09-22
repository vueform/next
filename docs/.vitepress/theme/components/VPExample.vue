<script setup lang="ts">
import {
  shallowRef,
  ref,
  watch,
  useSlots,
  cloneVNode,
  nextTick,
  onMounted,
  defineComponent,
  h,
  type VNode,
} from 'vue'

const FormDataView = defineComponent({
  props: ['form'],
  setup(props) {
    return () => {
      const d = props.form?.payload
      return h(
        'pre',
        { class: 'vp-example-model' },
        d != null ? JSON.stringify(d, null, 2) : ''
      )
    }
  },
})

const props = defineProps<{
  model?: boolean
  noModel?: boolean
  validate?: boolean
  width?: string
  plain?: boolean
  center?: boolean
  rtl?: boolean
  fit?: boolean
  closed?: boolean
}>()

const exampleLanguages = { en_US: 'English', de_DE: 'German' }

const slots = useSlots()
const form$ = shallowRef<any>(null)
const showModel = ref(props.model ?? false)

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

if (props.validate) {
  watch(
    form$,
    (f) => {
      if (f) {
        f.on('mounted', () => {
          f.validate()
        })
      }
    },
    { once: true }
  )
}

function renderDefault(): VNode[] {
  return (slots.default?.() ?? []).map((vn) =>
    isVfForm(vn) ? cloneVNode(vn, { ref: setFormRef }, true) : vn
  )
}

const wrapperRef = ref<HTMLElement>()

onMounted(() => {
  if (!wrapperRef.value) return

  let codeGroup: Element | null = wrapperRef.value.nextElementSibling
  while (codeGroup) {
    if (codeGroup.classList.contains('vp-code-group')) break
    codeGroup = codeGroup.nextElementSibling
  }
  if (!codeGroup) return

  const radios = codeGroup.querySelectorAll<HTMLInputElement>(
    '.tabs input[type="radio"]'
  )

  const checkedRadio = codeGroup.querySelector<HTMLInputElement>(
    '.tabs input[type="radio"]:checked'
  )
  let checkedId: string | null = props.closed
    ? null
    : (checkedRadio?.id ?? null)

  if (props.closed) {
    radios.forEach((input) => {
      input.checked = false
    })
  }

  const tabs = codeGroup.querySelector('.tabs')
  if (!tabs) return

  const blocks = codeGroup.querySelectorAll<HTMLElement>('.blocks > div')

  function radioIndexOf(id: string): number {
    for (let i = 0; i < radios.length; i++) {
      if (radios[i].id === id) return i
    }
    return -1
  }

  function activate(inputId: string) {
    const idx = radioIndexOf(inputId)
    radios.forEach((input, i) => {
      input.checked = i === idx
    })
    blocks.forEach((block, i) => {
      block.classList.toggle('active', i === idx)
    })
  }

  function deactivate() {
    radios.forEach((input) => {
      input.checked = false
    })
    blocks.forEach((block) => {
      block.classList.remove('active')
    })
  }

  tabs.addEventListener('click', (e) => {
    const label = (e.target as HTMLElement).closest('label')
    if (!label) return
    const inputId = label.getAttribute('for')
    if (!inputId) return
    e.preventDefault()

    const wrapper = wrapperRef.value
    if (!wrapper) return
    const isClosed = wrapper.classList.contains('is-closed-code')

    if (isClosed) {
      wrapper.classList.remove('is-closed-code')
      activate(inputId)
      checkedId = inputId
    } else if (checkedId === inputId) {
      wrapper.classList.add('is-closed-code')
      deactivate()
      checkedId = null
    } else {
      activate(inputId)
      checkedId = inputId
    }
  })
})
</script>

<template>
  <div
    ref="wrapperRef"
    class="vp-example-wrapper"
    :class="{ 'is-closed-code': closed }"
  >
    <div
      class="vp-example"
      :class="[width ? `w-${width}` : '', fit ? 'w-fit' : '']"
      :dir="rtl ? 'rtl' : undefined"
    >
      <div v-if="plain && center" class="vp-example-centered">
        <slot />
      </div>
      <template v-else-if="plain">
        <slot />
      </template>
      <div v-else-if="center && !hasForm" class="vp-example-centered">
        <VfForm
          error-level="element"
          :languages="exampleLanguages"
          :ref="setFormRef"
        >
          <slot />
        </VfForm>
      </div>
      <VfForm
        v-else-if="!hasForm"
        error-level="element"
        :languages="exampleLanguages"
        :ref="setFormRef"
      >
        <slot />
      </VfForm>
      <div v-else-if="center" class="vp-example-centered">
        <component :is="renderDefault" />
      </div>
      <component v-else :is="renderDefault" />
    </div>
    <button
      v-if="!plain && !noModel"
      class="vp-example-toggle"
      :class="{ 'is-open': showModel }"
      @click="showModel = !showModel"
    >
      <svg
        class="vp-example-toggle-chevron"
        :class="{ 'is-open': showModel }"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
      <span>{{ showModel ? 'Hide form payload' : 'Show form payload' }}</span>
    </button>
  </div>
  <div
    v-if="!plain && !noModel"
    class="vp-example-model-container"
    :class="{ 'is-open': showModel }"
  >
    <FormDataView :form="form$" />
  </div>
</template>

<style lang="scss">
.vp-example-wrapper {
  padding: 2rem;
  background-color: var(--vp-c-bg-example-wrapper);
  border-radius: 8px 8px 0 0;
  position: relative;
  margin-top: 16px;

  & + div[class*='language-'] {
    margin-top: 0;
    margin-bottom: 0;
    border-radius: 0 0 8px 8px;
  }

  &:hover .vp-example-toggle {
    opacity: 1;
  }

  & + div[class*='language-'],
  & + .vp-code-group {
    margin-top: 0;
    border-radius: 0 0 8px 8px;
  }

  & + .vp-code-group .tabs {
    border-radius: 0;
  }
}

.vp-example {
  background-color: var(--vp-c-bg-example);
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 410px;
  margin: 0 auto;
  box-shadow: 0px 0px 10px 0 rgba(0, 0, 0, 0.1);

  &.w-xs {
    max-width: 240px;
  }

  &.w-sm {
    max-width: 320px;
  }

  &.w-md {
    max-width: 460px;
  }

  &.w-lg {
    max-width: 540px;
  }

  &.w-full {
    max-width: 100%;
  }

  &.w-fit {
    max-width: fit-content;
  }
}

.vp-example-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 0;
  border: none;
  background: none;
  color: var(--vp-c-text-3);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition:
    color 0.2s,
    opacity 0.2s;
  position: absolute;
  left: 10px;
  bottom: 8px;
  opacity: 0;

  &:hover {
    color: var(--vp-c-text-2);
  }

  &.is-open {
    opacity: 1;
  }
}

.vp-example-toggle-chevron {
  transition: transform 0.25s ease;

  &.is-open {
    transform: rotate(90deg);
  }
}

.vp-example-model-container {
  display: grid;
  grid-template-rows: 0fr;
  border-top: 0px solid var(--vp-c-gray-soft);
  transition:
    grid-template-rows 0.25s ease,
    border-top 0.25s ease;

  &.is-open {
    grid-template-rows: 1fr;
    border-top: 1px solid var(--vp-c-gray-soft);
  }

  & + div[class*='language-'],
  & + .vp-code-group {
    margin-top: 0;
    border-radius: 0 0 8px 8px;
  }

  & + .vp-code-group .tabs {
    border-radius: 0;
  }
}

.vp-example-model {
  background-color: var(--vp-c-bg-example-wrapper);
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  min-height: 0;
  padding: 0 1.25rem;
  transition: padding 0.25s ease;

  .is-open > & {
    padding: 1.5rem 1.25rem;
  }
}

.vp-example-centered {
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

  ul.vf-tabs-wrapper {
    justify-content: center;
  }
}

.w-full > .vp-example-centered > .vf-form {
  width: 100%;

  .vf-group-elements.vf-stacked {
    justify-content: center;
  }
}

.vp-example-model-container.is-open {
  border-top-color: var(--vp-c-gray-1);
}

.dark .vp-example-model-container.is-open {
  border-top-color: var(--vp-c-gray-soft);
}

.vp-example-wrapper.is-closed-code + .vp-code-group .blocks,
.vp-example-wrapper.is-closed-code
  + .vp-example-model-container
  + .vp-code-group
  .blocks {
  display: none;
}
.vp-example-wrapper.is-closed-code + .vp-code-group .tabs,
.vp-example-wrapper.is-closed-code
  + .vp-example-model-container
  + .vp-code-group
  .tabs {
  box-shadow: none;
  border-radius: 0 0 8px 8px;
}

.fa,
.fa-brands,
.fa-regular,
.fa-solid,
.fab,
.far,
.fas {
  &.vf-btn-icon {
    line-height: inherit;
  }
}
</style>
