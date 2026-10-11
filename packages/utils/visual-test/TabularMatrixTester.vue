<script setup lang="ts">
/**
 * Test harness for the tabular view of the matrix element.
 *
 * Renders the same 3×4 matrix in six variants (header combinations plus dynamic
 * / sortable rows) and lets you swap the element type used in the cells and
 * cycle through every icon/addon placement combination.
 */
import { defineSchema } from '@vueform/core'
import { computed, ref, watch } from 'vue'

import { defaultBindings, defaultTypes } from './TabularGridTester.vue'

const props = withDefaults(
  defineProps<{
    /**
     * Element types available in the type select.
     */
    types?: string[]
    /**
     * Bindings applied to the tested element, keyed by element type. Must
     * contain at least `default`. Any other key extends `default` with its own
     * entries.
     */
    bindings?: Record<string, any>
    /**
     * Extra elements merged into the controls schema.
     */
    controls?: Record<string, any>
    /**
     * Controlled element type (syncs into the type select).
     */
    type?: string
    /**
     * Controlled icons/addons combination index (0–15).
     */
    combination?: number
    /**
     * Controlled stacked flag.
     */
    stacked?: boolean
    /**
     * When true, the middle column uses an empty content cell instead of
     * `filler`.
     */
    contentFiller?: boolean
    /**
     * Show the sticky controls panel.
     */
    showControls?: boolean
    /**
     * Show the page header.
     */
    showHeader?: boolean
    /**
     * Element type used for the fixed "odd one out" middle column when
     * `contentFiller` is false.
     */
    filler?: string
    /**
     * Element type used for the icons/addons combination control.
     */
    combinationType?: string
  }>(),
  {
    types: () => defaultTypes,
    bindings: () => defaultBindings,
    controls: () => ({}),
    showControls: true,
    showHeader: true,
    contentFiller: false,
    filler: 'textarea',
    combinationType: 'text',
  }
)

/* Each combination is [iconAfter, iconBefore, addonAfter, addonBefore] */
const combinations = [
  [0, 0, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [0, 1, 0, 0],
  [1, 0, 0, 0],
  [1, 1, 0, 0],
  [0, 1, 0, 1],
  [0, 1, 1, 0],
  [0, 1, 1, 1],
  [1, 0, 0, 1],
  [1, 0, 1, 0],
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [1, 1, 1, 0],
  [1, 1, 1, 1],
]

/* Controls state */
const type = ref(props.type ?? props.types[0])
const combination = ref(props.combination ?? 0)
const stacked = ref(props.stacked ?? false)
const contentFiller = ref(props.contentFiller ?? false)

watch(
  () => props.type,
  (value) => {
    if (value !== undefined) type.value = value
  }
)

watch(
  () => props.combination,
  (value) => {
    if (value !== undefined) combination.value = value
  }
)

watch(
  () => props.stacked,
  (value) => {
    if (value !== undefined) stacked.value = value
  }
)

watch(
  () => props.contentFiller,
  (value) => {
    if (value !== undefined) contentFiller.value = value
  }
)

const combinationLabel = computed(() => {
  const [iconAfter, iconBefore, addonAfter, addonBefore] =
    combinations[combination.value]

  const parts = [
    iconBefore && 'icon before',
    iconAfter && 'icon after',
    addonBefore && 'addon before',
    addonAfter && 'addon after',
  ].filter(Boolean)

  return parts.length ? parts.join(' + ') : 'none'
})

const iconAfter = computed(() => !!combinations[combination.value][0])
const iconBefore = computed(() => !!combinations[combination.value][1])
const addonAfter = computed(() => !!combinations[combination.value][2])
const addonBefore = computed(() => !!combinations[combination.value][3])

/* Every non-default key extends `default` with its own entries */
const mergedBindings = computed<Record<string, any>>(() => {
  const { default: defaults = {}, ...rest } = props.bindings

  return {
    default: defaults,
    ...Object.fromEntries(
      Object.entries(rest).map(([key, value]) => [
        key,
        { ...defaults, ...value },
      ])
    ),
  }
})

const cellSchema = computed(() => ({
  type: type.value,
  text: 'text',
  ...(mergedBindings.value[type.value] || mergedBindings.value.default),
  stacked: stacked.value,
  iconBefore: iconBefore.value ? 'search' : undefined,
  iconAfter: iconAfter.value ? 'search' : undefined,
  addonBefore: addonBefore.value ? ['$'] : undefined,
  addonAfter: addonAfter.value ? ['%'] : undefined,
}))

const fillerSchema = computed(() =>
  contentFiller.value
    ? { type: 'content', content: '' }
    : { type: props.filler }
)

const makeCols = () => [
  {
    value: 'col1',
    label: 'Col1',
    schema: cellSchema.value,
  },
  {
    value: 'col2',
    label: 'Col2',
    schema: fillerSchema.value,
  },
  {
    value: 'col3',
    label: 'Col3',
    schema: cellSchema.value,
  },
  {
    value: 'col4',
    label: 'Col4',
    schema: cellSchema.value,
  },
]

const namedRows = {
  row1: 'Row1',
  row2: 'Row2',
  row3: 'Row3',
}

type Variant = {
  key: string
  title: string
  colHeaders: boolean
  rowHeaders: boolean
  rows: Record<string, string> | number
  add?: boolean
  sort?: boolean
}

const variants: Variant[] = [
  {
    key: 'plain',
    title: 'No headers',
    colHeaders: false,
    rowHeaders: false,
    rows: namedRows,
  },
  {
    key: 'row_headers',
    title: 'Row headers',
    colHeaders: false,
    rowHeaders: true,
    rows: namedRows,
  },
  {
    key: 'col_headers',
    title: 'Column headers',
    colHeaders: true,
    rowHeaders: false,
    rows: namedRows,
  },
  {
    key: 'both_headers',
    title: 'Row + column headers',
    colHeaders: true,
    rowHeaders: true,
    rows: namedRows,
  },
  {
    key: 'dynamic',
    title: 'Dynamic rows',
    colHeaders: true,
    rowHeaders: true,
    rows: 3,
    add: false,
  },
  {
    key: 'dynamic_sort',
    title: 'Dynamic rows + sort',
    colHeaders: true,
    rowHeaders: true,
    rows: 3,
    add: false,
    sort: true,
  },
]

const makeMatrix = (variant: Variant) => ({
  type: 'matrix',
  tabular: true,
  cols: makeCols(),
  rows: variant.rows,
  colHeaders: variant.colHeaders,
  rowHeaders: variant.rowHeaders,
  ...(variant.add === false ? { add: false } : {}),
  ...(variant.sort ? { sort: true } : {}),
})

const matrixSchemas = computed(() =>
  Object.fromEntries(
    variants.map((variant) => [
      variant.key,
      defineSchema({
        matrix: makeMatrix(variant),
      } as any),
    ])
  )
)

const controlsSchema = computed(() =>
  defineSchema({
    type: {
      type: 'select',
      floatLabel: 'Element type',
      float: 'on',
      modelValue: type.value,
      onChange: (v: any) => (type.value = v),
      options: props.types,
      items: props.types,
      filter: true,
      columns: 3,
    },
    combination: {
      type: props.combinationType,
      inputType: 'number',
      floatLabel: 'Icons & addons',
      float: 'on',
      showButtons: true,
      min: 0,
      max: combinations.length - 1,
      modelValue: combination.value,
      onChange: (v: any) => (combination.value = Number(v)),
      description: combinationLabel.value,
      columns: 3,
      addonAfter: {
        type: 'button',
        name: 'reset',
        text: 'Reset',
        onClick: () => (combination.value = 0),
      },
    },
    stacked: {
      type: 'checkbox',
      text: 'Stacked',
      modelValue: stacked.value,
      onChange: (v: any) => (stacked.value = !!v),
      columns: 2,
    },
    contentFiller: {
      type: 'checkbox',
      text: 'Content filler',
      modelValue: contentFiller.value,
      onChange: (v: any) => (contentFiller.value = !!v),
      columns: 2,
    },
    ...props.controls,
  } as any)
)
</script>

<template>
  <div class="tabular-matrix-tester">
    <header v-if="showHeader" class="tabular-matrix-tester__header">
      <h1>Tabular Matrix Tester</h1>
      <p>
        The same matrix in header and dynamic-row variants. Swap the element
        type and cycle through the icon / addon combinations.
      </p>
    </header>

    <div v-if="showControls" class="tabular-matrix-tester__controls">
      <VfForm :schema="controlsSchema" />
    </div>

    <section
      v-for="variant in variants"
      :key="variant.key"
      class="tabular-matrix-tester__section"
    >
      <VfForm :schema="matrixSchemas[variant.key]" />
    </section>
  </div>
</template>

<style scoped>
.tabular-matrix-tester__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.tabular-matrix-tester__header p {
  margin: 0 0 1.5rem;
  opacity: 0.7;
}

.tabular-matrix-tester__controls {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 0 1rem;
  padding: 1rem;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 0.5rem;
  background-color: #fff;
}

.dark .tabular-matrix-tester__controls {
  background-color: #242424;
}

.tabular-matrix-tester__section {
  margin: 0 0 1rem;
}
</style>
