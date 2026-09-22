<script setup lang="ts">
/**
 * Test harness for the tabular view of the grid element.
 *
 * Renders the same 3x4 pricing grid in all four header variants (no headers,
 * column headers, row headers, both) and lets you swap the element type used in
 * the cells and cycle through every icon/addon placement combination.
 */
import { defineSchema } from '@vueform/core'
import { computed, ref, watch } from 'vue'

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
     * Show the sticky controls panel.
     */
    showControls?: boolean
    /**
     * Show the page header.
     */
    showHeader?: boolean
    /**
     * Types used for the fixed "odd one out" cells.
     */
    fillers?: {
      middle?: string
      lower?: string
    }
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
    fillers: () => ({
      middle: 'textarea',
      lower: 'text',
    }),
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

const cell = (name: string) => ({
  type: type.value,
  text: 'text',
  ...(mergedBindings.value[type.value] || mergedBindings.value.default),
  name,
  stacked: stacked.value,
  iconBefore: iconBefore.value ? 'search' : undefined,
  iconAfter: iconAfter.value ? 'search' : undefined,
  addonBefore: addonBefore.value ? ['$'] : undefined,
  addonAfter: addonAfter.value ? ['%'] : undefined,
})

/*
 * Rows share the structure: tested element, a fixed "odd one out" cell
 * (textarea / text / empty), then two more tested elements.
 */
const makeDataRows = () => [
  [
    cell('basic_1'),
    { type: props.fillers.middle, name: 'textarea' },
    cell('basic_2'),
    cell('basic_3'),
  ],
  [
    cell('pro_1'),
    { type: props.fillers.lower, name: 'text' },
    cell('pro_2'),
    cell('pro_3'),
  ],
  [cell('enterprise_1'), '', cell('enterprise_2'), cell('enterprise_3')],
]

const colHeaderRow = ['Plan', 'Empty', 'Price', 'Storage']
const rowHeaderLabels = ['Basic', 'Pro', 'Enterprise']

const makeGrid = (colHeaders: boolean, rowHeaders: boolean) => {
  const rows: any[][] = makeDataRows()

  if (rowHeaders) {
    rows.forEach((row, index) => row.unshift(rowHeaderLabels[index]))
  }

  if (colHeaders) {
    rows.unshift(rowHeaders ? ['Plan', ...colHeaderRow] : [...colHeaderRow])
  }

  return {
    type: 'grid',
    tabular: true,
    colHeaders: colHeaders || undefined,
    rowHeaders: rowHeaders || undefined,
    grid: rows,
  }
}

const variants = [
  { key: 'plain', title: 'No headers', colHeaders: false, rowHeaders: false },
  {
    key: 'col_headers',
    title: 'Column headers',
    colHeaders: true,
    rowHeaders: false,
  },
  {
    key: 'row_headers',
    title: 'Row headers',
    colHeaders: false,
    rowHeaders: true,
  },
  {
    key: 'both_headers',
    title: 'Row + column headers',
    colHeaders: true,
    rowHeaders: true,
  },
]

const gridSchemas = computed(() =>
  Object.fromEntries(
    variants.map((variant) => [
      variant.key,
      defineSchema({
        pricing: makeGrid(variant.colHeaders, variant.rowHeaders),
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
    ...props.controls,
  } as any)
)
</script>

<script lang="ts">
/* Test data for cascade-select */
export const countries = [
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'SYD' },
          { cname: 'Newcastle', code: 'NTL' },
          { cname: 'Wollongong', code: 'WOL' },
        ],
      },
      {
        name: 'Queensland',
        cities: [
          { cname: 'Brisbane', code: 'BNE' },
          { cname: 'Gold Coast', code: 'OOL' },
        ],
      },
    ],
  },
  {
    name: 'Canada',
    code: 'CA',
    states: [
      {
        name: 'Ontario',
        cities: [
          { cname: 'Toronto', code: 'YYZ' },
          { cname: 'Ottawa', code: 'YOW' },
        ],
      },
      {
        name: 'British Columbia',
        cities: [
          { cname: 'Vancouver', code: 'YVR' },
          { cname: 'Victoria', code: 'YYJ' },
        ],
      },
    ],
  },
  {
    name: 'United States',
    code: 'US',
    states: [
      {
        name: 'California',
        cities: [
          { cname: 'Los Angeles', code: 'LAX' },
          { cname: 'San Francisco', code: 'SFO' },
          { cname: 'San Diego', code: 'SAN' },
        ],
      },
      {
        name: 'Texas',
        cities: [
          { cname: 'Austin', code: 'AUS' },
          { cname: 'Dallas', code: 'DFW' },
          { cname: 'Houston', code: 'IAH' },
        ],
      },
    ],
  },
]

export const defaultTypes = [
  'button',
  'checkbox',
  'checkboxes',
  'content',
  'field',
  'radio',
  'radios',
  'select',
  'text',
  'textarea',
]

/*
 * Bindings applied to the tested element. `default` is applied to every type,
 * type-specific entries are merged on top of it by the component.
 */
export const defaultBindings: Record<string, any> = {
  default: {},
  content: {
    content: 'content',
  },
}
</script>

<template>
  <div class="tabular-grid-tester">
    <header v-if="showHeader" class="tabular-grid-tester__header">
      <h1>Tabular Grid Tester</h1>
      <p>
        The same grid in all four header variants. Swap the element type and
        cycle through the icon / addon combinations.
      </p>
    </header>

    <div v-if="showControls" class="tabular-grid-tester__controls">
      <VfForm :schema="controlsSchema" />
    </div>

    <section
      v-for="variant in variants"
      :key="variant.key"
      class="tabular-grid-tester__section"
    >
      <VfForm :schema="gridSchemas[variant.key]" />
    </section>
  </div>
</template>

<style scoped>
.tabular-grid-tester__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
}

.tabular-grid-tester__header p {
  margin: 0 0 1.5rem;
  opacity: 0.7;
}

.tabular-grid-tester__controls {
  position: sticky;
  top: 0;
  z-index: 10;
  margin: 0 0 1rem;
  padding: 1rem;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 0.5rem;
  background-color: #fff;
}

.dark .tabular-grid-tester__controls {
  background-color: #242424;
}

.tabular-grid-tester__section {
  margin: 0 0 1rem;
}
</style>
