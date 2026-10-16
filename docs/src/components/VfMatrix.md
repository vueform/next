<script setup lang="ts">
import { useHttp } from '@vueform/ui'
import { ref } from 'vue'
const $http = useHttp()

const mode = ref('single')
const modeValidation = ref('single')
</script>

# VfMatrix

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

The default `mode` is `'auto'`, which renders a text input in each cell. Rows are group containers and columns define the fields within each row. The matrix value is an object where keys are row values and values are nested objects with column values as keys and the cell input values as values.

::: usage model

```vue [Preview]
<VfMatrix
  name="budget"
  :cols="['Q1', 'Q2']"
  :rows="['Marketing', 'Engineering']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  budget: {
    type: 'matrix',
    cols: ['Q1', 'Q2'],
    rows: ['Marketing', 'Engineering'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-basic -->

<!-- #region usage-single-mode -->

## Single Mode

The `mode="single"` turns each row into a radio group where only one column value can be selected per row. The matrix value is an object where keys are row values and each value is the selected column's value.

::: usage model

```vue [Preview]
<VfMatrix
  name="satisfaction"
  :cols="['Poor', 'Fair', 'Good', 'Excellent']"
  :rows="['Price', 'Quality']"
  mode="single"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  satisfaction: {
    type: 'matrix',
    cols: ['Poor', 'Fair', 'Good', 'Excellent'],
    rows: ['Price', 'Quality'],
    mode: 'single',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-single-mode -->

<!-- #region usage-multiple-mode -->

## Multiple Mode

The `mode="multiple"` turns each row into a checkbox group where multiple column values can be selected per row. The matrix value is an object where keys are row values and each value is an array of selected column values.

::: usage model

```vue [Preview]
<VfMatrix
  name="permissions"
  :cols="['Create', 'Read', 'Update']"
  :rows="['Admin', 'Editor']"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  permissions: {
    type: 'matrix',
    cols: ['Create', 'Read', 'Update'],
    rows: ['Admin', 'Editor'],
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-multiple-mode -->

<!-- #region usage-object-rows-cols -->

## Plain Object

The `rows` and `cols` props also accept a plain object where keys are used as values and values as labels.

::: usage

```vue [Preview]
<VfMatrix
  name="availability"
  :cols="{
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  }"
  :rows="{
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening'
  }"
/>
```

```vue [Template]
<VfMatrix
  name="availability"
  :cols="{
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
  }"
  :rows="{
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening'
  }"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  availability: {
    type: 'matrix',
      cols: {
      fri: 'Friday',
      sat: 'Saturday',
      sun: 'Sunday',
    },
    rows: {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening'
    },
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-object-rows-cols -->

<!-- #region usage-array-of-objects -->

## Array of Objects

The `rows` and `cols` props can also be an array of objects. Each object's `value` property is used as the value and its `label` property as the label by default. To read them from different properties, set `rowValue`, `rowLabel`, `colValue`, and `colLabel` accordingly. These props also accept a function that receives the row or column object and returns the resolved value or label.

::: usage

```vue [Preview]
<VfMatrix
  name="schedule"
  :cols="[
    { id: 'fri', day: 'Friday' },
    { id: 'sat', day: 'Saturday' },
    { id: 'sun', day: 'Sunday' },
  ]"
  col-value="id"
  col-label="day"
  :rows="[
    { code: 'am', slot: 'Morning' },
    { code: 'pm', slot: 'Afternoon' },
    { code: 'ev', slot: 'Evening' },
  ]"
  row-value="code"
  row-label="slot"
/>
```

```vue [Template]
<VfMatrix
  name="schedule"
  :cols="[
    { id: 'fri', day: 'Friday' },
    { id: 'sat', day: 'Saturday' },
    { id: 'sun', day: 'Sunday' },
  ]"
  col-value="id"
  col-label="day"
  :rows="[
    { code: 'am', slot: 'Morning' },
    { code: 'pm', slot: 'Afternoon' },
    { code: 'ev', slot: 'Evening' },
  ]"
  row-value="code"
  row-label="slot"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  schedule: {
    type: 'matrix',
    cols: [
      { id: 'fri', day: 'Friday' },
      { id: 'sat', day: 'Saturday' },
      { id: 'sun', day: 'Sunday' },
    ],
    colValue: 'id',
    colLabel: 'day',
    rows: [
      { code: 'am', slot: 'Morning' },
      { code: 'pm', slot: 'Afternoon' },
      { code: 'ev', slot: 'Evening' },
    ],
    rowValue: 'code',
    rowLabel: 'slot',
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

#### Object Value

In `'single'` and `'multiple'` modes, setting `colValue` to `null` makes the selected values the full column objects instead of a single property.

::: usage model

```vue [Preview]
<VfMatrix name="schedule" :col-value="null" :cols="[
  { id: 'fri', day: 'Friday' },
  { id: 'sat', day: 'Saturday' },
  { id: 'sun', day: 'Sunday' },
]" />
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const mode = ref('single')
</script>
<template>
  <VfSelect
    v-model="mode"
    name="mode"
    :items="{ single: 'Single', multiple: 'Multiple' }"
    default="multiple"
    addon-before="Mode:"
    stacked
  />
  <VfMatrix
    name="schedule"
    :cols="[
      { id: 'fri', day: 'Friday' },
      { id: 'sat', day: 'Saturday' },
      { id: 'sun', day: 'Sunday' },
    ]"
    :col-value="null"
    col-label="day"
    :rows="['Morning', 'Afternoon', 'Evening']"
    :mode="mode"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'
import { ref, computed } from 'vue'

const mode = ref('single')

const schema = comnputed(() => defineSchema({
  mode: {
    type: 'select',
    items: { single: 'Single', multiple: 'Multiple' },
    addonBefore: 'Mode:',
    default: 'multiple',
    stacked: true,
  },
  schedule: {
    type: 'matrix',
    cols: [
      { id: 'fri', day: 'Friday' },
      { id: 'sat', day: 'Saturday' },
      { id: 'sun', day: 'Sunday' },
    ],
    colValue: null,
    colLabel: 'day',
    rows: ['Morning', 'Afternoon', 'Evening'],
    mode: mode.value,
  },
}))

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-array-of-objects -->

<!-- #region usage-async-function -->

## Async Function

The `rows` and `cols` props can be an async function that returns the items. The function receives the component context as its argument.

::: usage

```vue [Preview]
<VfMatrix
  name="skills"
  :cols="async () => {
    const { data } = await $http.get('/data/users.json')
    return data
  }"
  :rows="async () => {
    const { data } = await $http.get('/data/skills.json')
    return data
  }"
/>
```

```vue [Template]
<script setup lang="ts">
import { useHttp } from '@vueform/ui'

const $http = useHttp()
</script>
<template>
  <VfMatrix
    name="skills"
    :cols="async () => {
      const { data } = await $http.get('/data/users.json')
      return data
    }"
    :rows="async () => {
      const { data } = await $http.get('/data/skills.json')
      return data
    }"
    mode="single"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const schema = defineSchema({
  skills: {
    type: 'matrix',
    cols: async () => {
      const { data } = await $http.get('/data/users.json')
      return data
    },
    rows: async () => {
      const { data } = await $http.get('/data/skills.json')
      return data
    },
    mode: 'single',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

#### Retriggering

Use `colsTrigger` and `rowsTrigger` to re-resolve the async functions when specific element values change. They accept an array of element paths to watch. The `colsDebounce` and `rowsDebounce` props add a delay (in ms) before re-fetching.

::: usage

```vue [Preview]
<VfSelect
  name="department"
  :items="['Engineering', 'Design', 'Marketing']"
/>
<VfMatrix
  name="skills"
  :cols="async () => {
    const { data } = await $http.get('/data/skills.json')
    return data
  }"
  :rows=" async ({ form$ }) => {
    const { data } = await $http.get(
      `/data/users-${form$.model.department}.json`
    )
    return data
  }"
  :rows-trigger="['department']"
  :rows-debounce="300"
/>
```

```vue [Template]
<script setup lang="ts">
import { useHttp } from '@vueform/ui'

const $http = useHttp()
</script>
<template>
  <VfSelect
    name="department"
    label="Department"
    :items="['Engineering', 'Design', 'Marketing']"
    default="Engineering"
  />
  <VfMatrix
    name="skills"
    :cols="async () => {
      const { data } = await $http.get('/data/skills.json')
      return data
    }"
    :rows=" async ({ form$ }) => {
      const { data } = await $http.get(
        `/data/users-${form$.model.department}.json`
      )
      return data
    }"
    :rows-trigger="['department']"
    :rows-debounce="300"
    mode="multiple"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const schema = defineSchema({
  department: {
    type: 'select',
    label: 'Department',
    items: ['Engineering', 'Design', 'Marketing'],
    default: 'Engineering',
  },
  skills: {
    type: 'matrix',
    cols: async () => {
      const { data } = await $http.get('/data/skills.json')
      return data
    },
    rows: async ({ form$ }) => {
      const { data } = await $http.get(`/data/users-${form$.model.department}.json`)
      return data
    },
    rowsTrigger: ['department'],
    rowsDebounce: 300,
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-async-function -->

<!-- #region usage-endpoints -->

## Endpoints

The `rows` and `cols` props also accept an endpoint URL string. Expressions within the string are resolved reactively — when a referenced value changes, the endpoint is re-fetched automatically.

::: usage

```vue [Preview]
<VfSelect
  name="department"
  :items="['Engineering', 'Design', 'Marketing']"
/>
<VfMatrix
  name="skills"
  cols="/data/skills.json"
  rows="/data/users-{department}.json"
/>
```

```vue [Template]
<VfSelect
  name="department"
  label="Department"
  :items="['Engineering', 'Design', 'Marketing']"
  default="Engineering"
/>
<VfMatrix
  name="skills"
  cols="/data/skills.json"
  rows="/data/users-{department}.json"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  department: {
    type: 'select',
    label: 'Department',
    items: ['Engineering', 'Design', 'Marketing'],
    default: 'Engineering',
  },
  skills: {
    type: 'matrix',
    cols: '/data/skills.json',
    rows: '/data/users-{department}.json',
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

#### `endpoint` Prop

Alternatively, use the `endpoint` prop to load both cols and rows from a single request. The response is expected to contain `cols` and `rows` keys by default — use `colsKey` and `rowsKey` to customize. The `method` and `headers` props apply to all endpoint requests.

::: usage

```vue [Preview]
<VfMatrix
  name="skills"
  endpoint="/data/matrix.json"
  cols-key="skills"
  rows-key="users"
  method="GET"
  :headers="{ 'X-Custom': 'value' }"
/>
```

```vue [Template]
<VfMatrix
  name="skills"
  endpoint="/data/matrix.json"
  cols-key="skills"
  rows-key="users"
  method="GET"
  :headers="{ 'X-Custom': 'value' }"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  skills: {
    type: 'matrix',
    endpoint: '/data/matrix.json',
    colsKey: 'skills',
    rowsKey: 'users',
    method: 'GET',
    headers: { 'X-Custom': 'value' },
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

#### Transformers

The `transformEndpoint` function reshapes the endpoint response before cols and rows are extracted. Similarly, `transformCols` and `transformRows` can transform data from their respective endpoint string sources.

::: usage

```vue [Preview]
<VfMatrix
  name="skills"
  endpoint="/data/matrix-data.json"
  :transform-endpoint="(data) => ({
    cols: data?.data?.skills?.map((c: any) => ({ value: c.id, label: c.title })) || [],
    rows: data?.data?.team?.map((u: any) => ({ value: u.id, label: u.name })) || [],
  })"
/>
```

```vue [Template]
<VfMatrix
  name="skills"
  endpoint="/data/matrix-data.json"
  :transform-endpoint="(data) => ({
      cols: data?.data?.skills?.map((c: any) => ({ value: c.id, label: c.title })) || [],
      rows: data?.data?.team?.map((u: any) => ({ value: u.id, label: u.name })) || [],
  })"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  skills: {
    type: 'matrix',
    endpoint: '/data/matrix-data.json',
    transformEndpoint: (data) => ({
      cols: data?.data?.skills?.map((c: any) => ({ value: c.id, label: c.title })) || [],
      rows: data?.data?.team?.map((u: any) => ({ value: u.id, label: u.name })) || [],
    }),
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-endpoints -->

<!-- #region usage-custom-columns -->

## Custom Columns

In `'auto'` mode, columns can override the default text input by providing a `schema` property with an element definition.

::: usage w-lg

```vue [Preview]
<VfMatrix name="inventory" :cols="[
  { value: 'sku', label: 'SKU' },
  { value: 'qty', label: 'Qty' },
  {
    value: 'status',
    label: 'Status',
    schema: {
      type: 'select',
      items: ['In Stock', 'Low', 'Out of Stock'],
      placeholder: 'Select',
    },
  },
]" />
```

```vue [Template]
<VfMatrix
  name="inventory"
  :rows="['Widget', 'Gadgets']"
  :cols="[
    { value: 'sku', label: 'SKU' },
    { value: 'qty', label: 'Qty' },
    {
      value: 'status',
      label: 'Status',
      schema: {
        type: 'select',
        items: ['In Stock', 'Low', 'Out of Stock'],
        placeholder: 'Select',
      },
    },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  inventory: {
    type: 'matrix',
    rows: ['Widget', 'Gadgets'],
    cols: [
      { value: 'sku', label: 'SKU' },
      { value: 'qty', label: 'Qty' },
      {
        value: 'status',
        label: 'Status',
        schema: {
          type: 'select',
          items: ['In Stock', 'Low', 'Out of Stock'],
          placeholder: 'Select',
        },
      },
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-custom-columns -->

<!-- #region usage-conditions -->

## Conditions

When `rows` and `cols` are arrays of objects, each item can define a `conditions` property. The row or column is only displayed when its conditions are met.

::: usage

```vue [Preview]
<VfMatrix
  name="notifications"
  :cols="[
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push', conditions: [['premium', '==', true]] },
  ]"
  :rows="[
    { value: 'news', label: 'News' },
    { value: 'updates', label: 'Updates' },
    { value: 'offers', label: 'Offers', conditions: [['premium', '==', true]] },
  ]"
/>
```

```vue [Template]
<VfCheckbox name="premium" text="Premium plan" />
<VfMatrix
  name="notifications"
  :cols="[
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push', conditions: [['premium', '==', true]] },
  ]"
  :rows="[
    { value: 'news', label: 'News' },
    { value: 'updates', label: 'Updates' },
    { value: 'offers', label: 'Offers', conditions: [['premium', '==', true]] },
  ]"
  mode="multiple"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  premium: {
    type: 'checkbox',
    text: 'Premium plan',
  },
  notifications: {
    type: 'matrix',
    cols: [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'SMS' },
      { value: 'push', label: 'Push', conditions: [['premium', '==', true]] },
    ],
    rows: [
      { value: 'news', label: 'News' },
      { value: 'updates', label: 'Updates' },
      { value: 'offers', label: 'Offers', conditions: [['premium', '==', true]] },
    ],
    mode: 'multiple',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-conditions -->

<!-- #region usage-dynamic-rows -->

## Dynamic Rows

When `rows` is a number (or omitted), the matrix becomes dynamic — users can add and remove rows. The add and remove buttons are shown automatically.

::: usage

```vue [Preview]
<VfMatrix name="items" :cols="['Item', 'Qty', 'Price']" :rows="2" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  items: {
    type: 'matrix',
    cols: ['Item', 'Qty', 'Price'],
    rows: 2,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-dynamic-rows -->

<!-- #region usage-row-limits -->

## Row Limits

The `min` and `max` props constrain how many rows a dynamic matrix can have. The add button hides when `max` is reached; the remove button hides when `min` is reached.

::: usage

```vue [Preview]
<VfMatrix name="tasks" :rows="2" :min="1" :max="3"/>
```

```vue [Template]
<VfMatrix
  name="tasks"
  :rows="2"
  :min="1"
  :max="3"
  :cols="['Task', 'Priority']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  tasks: {
    type: 'matrix',
    rows: 2,
    min: 1,
    max: 3,
    cols: ['Task', 'Priority'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-row-limits -->

<!-- #region usage-sorting -->

## Sorting

The `sort` prop enables drag-and-drop row reordering on dynamic matrices.

::: usage

```vue [Preview]
<VfMatrix name="priorities" :rows="3" sort />
```

```vue [Template]
<VfMatrix
  name="priorities"
  :rows="3"
  sort
  :cols="['Taks', 'Status']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  priorities: {
    type: 'matrix',
    rows: 3,
    sort: true,
    cols: ['Taks', 'Status'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-sorting -->

<!-- #region usage-tabular -->

## Tabular

The `tabular` prop renders the matrix as a bordered table with distinct header backgrounds and rounded corners.

::: usage fit

```vue [Preview]
<VfMatrix name="availability" tabular />
```

```vue [Template]
<VfMatrix
  name="availability"
  tabular
  mode="multiple"
  :cols="{
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
  }"
  :rows="{
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  availability: {
    type: 'matrix',
    tabular: true,
    mode: 'multiple',
    cols: {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
    },
    rows: {
      mon: 'Monday',
      tue: 'Tuesday',
      wed: 'Wednesday',
      thu: 'Thursday',
      fri: 'Friday',
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-tabular -->

<!-- #region usage-scrollable -->

## Scrollable

The `scrollable` prop enables horizontal scrolling when the matrix overflows. Use `stickyCols` to pin row headers and `stickyRows` to pin column headers while scrolling.

::: usage

```vue [Preview]
<VfMatrix name="quarterly" scrollable sticky-cols sticky-rows />
```

```vue [Template]
<VfMatrix
  name="quarterly"
  scrollable
  sticky-rows
  :cols="{
    q1: 'Q1',
    q2: 'Q2',
    q3: 'Q3',
    q4: 'Q4',
    q5: 'Q5',
    q6: 'Q6',
    q7: 'Q7',
    q8: 'Q8',
  }"
  :rows="{
    revenue: 'Revenue',
    costs: 'Costs',
    profit: 'Profit',
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  quarterly: {
    type: 'matrix',
    scrollable: true,
    stickyRows: true,
    cols: {
      q1: 'Q1',
      q2: 'Q2',
      q3: 'Q3',
      q4: 'Q4',
      q5: 'Q5',
      q6: 'Q6',
      q7: 'Q7',
      q8: 'Q8',
    },
    rows: {
      revenue: 'Revenue',
      costs: 'Costs',
      profit: 'Profit',
    },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-scrollable -->

<!-- #region usage-custom-labels -->

## Custom Labels

The `addLabel` and `removeLabel` props customize the text of the add and remove buttons in dynamic matrices. You can also use `addIcon` and `removeIcon` to change their icons.

::: usage

```vue [Preview]
<VfMatrix name="contacts" add-label="New contact" remove-label="Remove" />
```

```vue [Template]
<VfMatrix
  name="contacts"
  :rows="1"
  add-label="New contact"
  remove-label="Remove"
  :cols="{ name: 'Name', email: 'Email', phone: 'Phone' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'matrix',
    rows: 1,
    addLabel: 'New contact',
    removeLabel: 'Remove',
    cols: { name: 'Name', email: 'Email', phone: 'Phone' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-custom-labels -->

<!-- #region usage-column-widths -->

## Column Widths

The `minWidth` and `maxWidth` props set the default minimum and maximum width for all columns. When cols is an array of objects, individual columns can override these using `minWidth` and `maxWidth` properties — the `colMinWidth` and `colMaxWidth` props let you customize which property names to read.

::: usage w-xl

```vue [Preview]
<VfMatrix
  name="inventory"
  min-width="60px"
  max-width="200px"
  :cols="[
    { value: 'sku', label: 'SKU', },
    {
      value: 'name',
      label: 'Product Name',
      minWidth: '200px',
      maxWidth: '1fr',
    },
    { value: 'qty', label: 'Qty', },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  inventory: {
    type: 'matrix',
    minWidth: '60px',
    maxWidth: '200px',
    cols: [
      { value: 'sku', label: 'SKU', },
      {
        value: 'name',
        label: 'Product Name',
        minWidth: '200px',
        maxWidth: '1fr',
      },
      { value: 'qty', label: 'Qty', },
    ],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

#### Grid Template Columns

The `gridTemplateColumns` prop gives full control over the CSS `grid-template-columns` value. It accepts a string or a function that receives the component context and returns the value.

::: usage w-xl

```vue [Preview]
<VfMatrix
  name="data"
  :cols="['ID', 'Name', 'Email']"
  grid-template-columns="48px 1fr 1fr min-content"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  data: {
    type: 'matrix',
    cols: ['ID', 'Name', 'Email'],
    gridTemplateColumns: '48px 1fr 1fr min-content',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-column-widths -->

<!-- #region usage-validation -->

## Validation

Setting [`required`](/rules/required) rule on the matrix ensures that:

- In `'auto'` mode — all columns in every row must have a non-null value.
- In `'single'` and `'multiple'` modes — at least one column must be selected per row.

::: usage

```vue [Preview]
<VfMatrix
  name="preferences"
  :cols="['Email', 'SMS', 'Push']"
  :rows="['News', 'Updates', 'Offers']"
  rules="required"
  :mode
/>
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const mode = ref('single')
</script>
<template>
  <VfForm hide-errors>
    <VfSelect
      v-model="mode"
      name="mode"
      :items="{ single: 'Single', multiple: 'Multiple', auto: 'Auto' }"
      default="single"
      addon-before="Mode:"
      stacked
    />
    <VfMatrix
      name="preferences"
      :cols="['Email', 'SMS', 'Push']"
      :rows="['News', 'Updates', 'Offers']"
      :mode="mode"
      rules="required"
    />
    <VfButton type="submit" text="Submit" action="submit" />
  </VfForm>
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'
import { ref, computed } from 'vue'

const mode = ref('single')

const schema = defineSchema({
  mode: {
    type: 'select',
    items: { single: 'Single', multiple: 'Multiple', auto: 'Auto' },
    addonBefore: 'Mode:',
    default: 'single',
    stacked: true,
  },
  preferences: {
    type: 'matrix',
    cols: ['Email', 'SMS', 'Push'],
    rows: ['News', 'Updates', 'Offers'],
    mode: mode.value,
    rules: 'required',
  },
  submit: {
    type: 'button',
    text: 'Submit',
    action: 'submit',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

```vue [Live]
<VfForm hide-errors>
  <VfSelect
    v-model="modeValidation"
    name="mode"
    :items="{ single: 'Single', multiple: 'Multiple', auto: 'Auto' }"
    default="sigle"
    addon-before="Mode:"
    stacked
  />
  <VfMatrix
    name="preferences"
    :cols="['Email', 'SMS', 'Push']"
    :rows="['News', 'Updates', 'Offers']"
    :mode="modeValidation"
    rules="required"
  />
  <VfButton type="submit" text="Submit" action="submit" />
</VfForm>
```

:::

#### Row Rules

To apply additional rules to individual rows, define them via the `rules` property on each row object (customizable via `rowRules`). Per-row rules like [`required`](/rules/required), [`min`](/rules/min), [`max`](/rules/max), [`between`](/rules/between), [`size`](/rules/size), [`gt`](/rules/gt), [`lt`](/rules/lt), [`gte`](/rules/gte), and [`lte`](/rules/lte) control the selection count for that specific row.

::: usage

```vue [Preview]
<VfMatrix
  name="preferences"
  :cols="['Email', 'SMS', 'Push']"
  row-rules="validate"
  :rows="[
    { value: 'news', label: 'News', validate: 'required|min:2' },
    { value: 'updates', label: 'Updates', validate: 'required' },
    { value: 'offers', label: 'Offers' },
  ]"
  mode="multiple"
/>
```

```vue [Template]
<VfMatrix
  name="preferences"
  :cols="['Email', 'SMS', 'Push']"
  row-rules="validate"
  :rows="[
    { value: 'news', label: 'News', validate: 'required|min:2' },
    { value: 'updates', label: 'Updates', validate: 'required' },
    { value: 'offers', label: 'Offers' },
  ]"
  mode="multiple"
/>
<VfButton type="submit" text="Submit" action="submit" />
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  preferences: {
    type: 'matrix',
    cols: ['Email', 'SMS', 'Push'],
    rowRules: 'validate',
    rows: [
      { value: 'news', label: 'News', validate: 'required|min:2' },
      { value: 'updates', label: 'Updates', validate: 'required' },
      { value: 'offers', label: 'Offers' },
    ],
    mode: 'multiple',
  },
  submit: {
    type: 'button',
    text: 'Submit',
    action: 'submit',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For any other validation logic, you can create [custom rules](/guide/validation#custom-rules).

<!-- #endregion usage-validation -->

<!-- #region usage-disabled -->

## Disabled

The `disabled` prop prevents all interaction with the matrix. It also accepts [Conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfMatrix name="locked" disabled />
```

```vue [Template]
<VfMatrix
  name="locked"
  :rows="['Alpha', 'Beta']"
  :cols="['Col A', 'Col B']"
  disabled
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  locked: {
    type: 'matrix',
    disabled: true,
    rows: ['Alpha', 'Beta'],
    cols: ['Col A', 'Col B'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-disabled -->
<!-- #endregion usage -->
<!-- @endtab -->

<!-- @tab Props -->

## Props

<!-- @props-intro-start -->

Configure the component's behavior and appearance with these props.
<!-- @props-intro-end -->

<!-- @props-start -->
<!-- @collapsible -->

### General {#props-general}

| Prop | Default | Description |
| --- | --- | --- |
| [`name`](!code#props.name "ElementName") | — | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type "string") | `'matrix'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Input {#props-matrix}

| Prop | Default | Description |
| --- | --- | --- |
| [`mode`](!code#props.mode "MatrixModes \| (string & {})") | `'auto'` | The selection mode for the matrix. |
| [`tabular`](!code#props.tabular "boolean") | `false` | Whether the matrix uses a tabular visual style with borders and headers. |
| [`sort`](!code#props.sort "boolean") | `false` | Whether to enable drag-and-drop sorting of matrix rows. |
| [`scrollable`](!code#props.scrollable "boolean") | `false` | Whether the matrix is horizontally scrollable on overflow. |
| [`stickyCols`](!code#props.stickyCols "boolean") | `false` | Whether column headers stick to the left when scrolling. |
| [`stickyRows`](!code#props.stickyRows "boolean") | `false` | Whether row headers stick to the top when scrolling. |
| [`wrapColHeaders`](!code#props.wrapColHeaders "boolean") | `false` | Whether column header text can wrap. |
| [`wrapRowHeaders`](!code#props.wrapRowHeaders "boolean") | `false` | Whether row header text can wrap. |
| [`addLabel`](!code#props.addLabel "TProp<string, TContext>") | — | The label text for the "add row" button. |
| [`removeLabel`](!code#props.removeLabel "TProp<string, TContext>") | — | The label text for the "remove row" button. |
| [`addIcon`](!code#props.addIcon "DProp<string, TContext>") | `'$add'` | The icon identifier for the "add row" button. |
| [`removeIcon`](!code#props.removeIcon "DProp<string, TContext>") | `'$remove'` | The icon identifier for the "remove row" button. |
| [`sortIcon`](!code#props.sortIcon "DProp<string, TContext>") | `'$sort'` | The icon identifier for the sort handle button. |
| [`colHeaders`](!code#props.colHeaders "boolean") | `true` | Whether to display column headers. |
| [`rowHeaders`](!code#props.rowHeaders "boolean") | `true` | Whether to display row headers. |
| [`minWidth`](!code#props.minWidth "number \| string") | `'min-content'` | The minimum width of each matrix column. |
| [`maxWidth`](!code#props.maxWidth "number \| string") | `'1fr'` | The maximum width of each matrix column. |
| [`min`](!code#props.min "number") | `-1` | The minimum number of rows allowed. |
| [`max`](!code#props.max "number") | `-1` | The maximum number of rows allowed. |
| [`gridTemplateColumns`](!code#props.gridTemplateColumns "string \| ((context$: any) => any)") | — | CSS `grid-template-columns` value or a function returning it. |
| [`add`](!code#props.add "boolean") | `true` | Whether adding new rows is enabled. When `false`, the add button is not rendered. |
| [`remove`](!code#props.remove "boolean") | `true` | Whether removing rows is enabled. When `false`, remove buttons are not rendered. |
| [`headers`](!code#props.headers "Record<string, string>") | — | Custom HTTP headers to include when loading cols or rows from an endpoint. |
| [`method`](!code#props.method "string") | — | The HTTP method to use when loading cols or rows from an endpoint. Defaults to `'GET'`. |
| [`cols`](!code#props.cols "MatrixCols") | — | The column definitions for the matrix grid. Accepts a plain array, a plain object, an array of objects (customizable via `colValue`, `colLabel`, and related props), an endpoint URL string (supporting expressions), or a (possibly async) function receiving the component context. |
| [`rows`](!code#props.rows "MatrixRows \| number") | — | The row definitions or a fixed number of rows for the matrix grid. Accepts a plain array, a plain object, an array of objects (customizable via `rowValue`, `rowLabel`, and related props), an endpoint URL string (supporting expressions), or a (possibly async) function receiving the component context. |
| [`colValue`](!code#props.colValue "string \| ((col: any) => any) \| null") | `'value'` | The key or function that resolves each column's value (the key used in the matrix data object) when `cols` is an array of objects. Defaults to `'value'`. Set to `null` to use the full column object as the value. |
| [`colLabel`](!code#props.colLabel "string \| ((col: any) => string \| number \| undefined)") | `'label'` | The key or function that resolves each column's header label when `cols` is an array of objects. Defaults to `'label'`. |
| [`colConditions`](!code#props.colConditions "string \| ((col: any) => ConditionsResult<TContext> \| undefined)") | `'conditions'` | The key or function that resolves each column's conditions when `cols` is an array of objects. Defaults to `'conditions'`. |
| [`colSchema`](!code#props.colSchema "string \| ((col: any) => MatrixElement \| undefined)") | `'schema'` | The key or function that resolves each column's custom element schema when `cols` is an array of objects. Defaults to `'schema'`. |
| [`colMinWidth`](!code#props.colMinWidth "string \| ((col: any) => string \| number \| undefined)") | `'minWidth'` | The key or function that resolves each column's minimum width when `cols` is an array of objects. Defaults to `'minWidth'`. |
| [`colMaxWidth`](!code#props.colMaxWidth "string \| ((col: any) => string \| number \| undefined)") | `'maxWidth'` | The key or function that resolves each column's maximum width when `cols` is an array of objects. Defaults to `'maxWidth'`. |
| [`rowValue`](!code#props.rowValue "string \| ((row: any) => string \| number)") | `'value'` | The key or function that resolves each row's value (the key used in the matrix data object) when `rows` is an array of objects. Defaults to `'value'`. |
| [`rowLabel`](!code#props.rowLabel "string \| ((row: any) => string \| number \| undefined)") | `'label'` | The key or function that resolves each row's header label when `rows` is an array of objects. Defaults to `'label'`. |
| [`rowConditions`](!code#props.rowConditions "string \| ((row: any) => ConditionsResult \| undefined)") | `'conditions'` | The key or function that resolves each row's conditions when `rows` is an array of objects. Defaults to `'conditions'`. |
| [`rowRules`](!code#props.rowRules "string \| ((row: any) => RulesProp \| undefined)") | `'rules'` | The key or function that resolves each row's validation rules when `rows` is an array of objects. Defaults to `'rules'`. |
| [`colsTrigger`](!code#props.colsTrigger "ConditionsTriggerProp") | — | The source that triggers re-resolution of function-based `cols`. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, function-based cols are only re-resolved when the `cols` prop reference itself changes. |
| [`colsDebounce`](!code#props.colsDebounce "number") | — | The debounce delay in milliseconds applied before re-resolving `cols` when an expression path or the `colsTrigger` source changes. Defaults to no debounce (immediate re-resolution). |
| [`transformCols`](!code#props.transformCols "(data: any) => any[] \| Record<string, any>") | — | Transforms data received from a `cols` endpoint or function into the cols format before normalization. |
| [`rowsTrigger`](!code#props.rowsTrigger "ConditionsTriggerProp") | — | The source that triggers re-resolution of function-based `rows`. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, function-based rows are only re-resolved when the `rows` prop reference itself changes. |
| [`rowsDebounce`](!code#props.rowsDebounce "number") | — | The debounce delay in milliseconds applied before re-resolving `rows` when an expression path or the `rowsTrigger` source changes. Defaults to no debounce (immediate re-resolution). |
| [`transformRows`](!code#props.transformRows "(data: any) => any[] \| Record<string, any>") | — | Transforms data received from a `rows` endpoint or function into the rows format before normalization. |
| [`endpoint`](!code#props.endpoint "string") | — | An endpoint URL (supporting expressions) that loads both the column and row definitions from a single request. Each side can still be overridden by defining `cols` or `rows` explicitly. |
| [`colsKey`](!code#props.colsKey "string \| ((data: any) => any)") | `'cols'` | The key or function that resolves the column definitions from the `endpoint` response. Defaults to `'cols'`. |
| [`rowsKey`](!code#props.rowsKey "string \| ((data: any) => any)") | `'rows'` | The key or function that resolves the row definitions from the `endpoint` response. Defaults to `'rows'`. |
| [`transformEndpoint`](!code#props.transformEndpoint "(data: any) => any[] \| Record<string, any>") | — | Transforms data received from the `endpoint` before the column and row definitions are extracted. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfMatrixContext<VfMatrixProps>) => any") | — | Transforms the element's value when submitting the form. |

### Validation {#props-validation}

| Prop | Default | Description |
| --- | --- | --- |
| [`rules`](!code#props.rules "RulesProp<TContext>") | — | Validation rules to apply to the element. |
| [`validateOn`](!code#props.validateOn "ElementValidateOnProp") | — | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce "number") | — | Delay in milliseconds before processing input. |
| [`bail`](!code#props.bail "boolean") | `true` | Whether to stop validation after the first failing rule. |
| [`ruleMessages`](!code#props.ruleMessages "RuleMessagesProp<TContext>") | — | Custom error messages keyed by validation rule name. |
| [`displayName`](!code#props.displayName "TProp<string, TContext>") | — | The display name used in validation error messages. |
| [`maxErrors`](!code#props.maxErrors "number") | `1` | Maximum number of validation errors to display at once. |
| [`hideErrors`](!code#props.hideErrors "boolean") | `false` | Whether to hide validation error messages. |
| [`showRequired`](!code#props.showRequired "ShowRequiredProp") | — | Where to show required field indicators (e.g. label, placeholder). |
| [`hoist`](!code#props.hoist "boolean") | `false` | Whether to push the element's errors to its nearest ancestor element. |

### Conditions {#props-conditions}

| Prop | Default | Description |
| --- | --- | --- |
| [`conditions`](!code#props.conditions "ConditionalProp<TContext>") | — | Conditions that control the element's visibility and availability. |
| [`conditionsTrigger`](!code#props.conditionsTrigger "ConditionsTriggerProp<TContext>") | — | The source that triggers re-evaluation of this element's async conditional props (`conditions`, `disabled`, `readonly`, and validation rule conditions). Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce "number") | — | The debounce delay in milliseconds applied before re-evaluating this element's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`). |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`heading`](!code#props.heading "HeadingProp") | — | The heading level to render for the container's title. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Customization {#props-customization}

| Prop | Default | Description |
| --- | --- | --- |
| [`parts`](!code#props.parts "P") | — | Custom DOM attribute overrides for the component's structural parts. |
| [`class`](!code#props.class "ClassValue") | — | CSS classes to apply to the component's root element. |
| [`classes`](!code#props.classes "C") | — | Custom CSS class overrides for the component's structural parts. |
| [`reclass`](!code#props.reclass "C") | — | CSS class overrides that replace (rather than merge with) default classes. |
| [`tokens`](!code#props.tokens "ThemeTokens") | — | Token overrides applied to the element's CSS custom properties. |
| [`slots`](!code#props.slots "S") | — | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets "PresetsProp") | — | Named configuration presets to apply to the component. |
| [`template`](!code#props.template "ComponentProp \| null") | — | A custom Vue component to use as the template instead of the default. |
| [`component`](!code#props.component "ComponentProp") | — | A custom Vue component to render in the component's default slot. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @endtab -->
<!-- @tab Context -->

## Context

Reactive properties and methods accessible on the component's [Context](/guide/context) object.

<!-- @collapsible -->
<!-- @context-start -->
### General {#section-general}

| Name | Description |
| --- | --- |
| [`type`](!code#context.type "string") | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name "string") | The element's name as a string ref. |
| [`props`](!code#context.props "object") | The resolved component props with defaults applied. |

### Matrix {#section-matrix}

| Name | Description |
| --- | --- |
| [`resolvedRows`](!code#context.resolvedRows "ResolvedMatrixRow[]") | The fully resolved matrix rows with component info, props, column mappings, and slot assignments. |
| [`resolvedCols`](!code#context.resolvedCols "ResolvedMatrixCol[]") | The fully resolved matrix columns with component info, labels, conditions, and width constraints. |
| [`headers`](!code#context.headers "ResolvedMatrixCol[]") | The column headers array, including optional row header and remove button placeholders. |
| [`showRowHeaders`](!code#context.showRowHeaders "boolean") | Whether row headers should be displayed. |
| [`showColHeaders`](!code#context.showColHeaders "boolean") | Whether column headers should be displayed. |
| [`add()`](!code#context.add "(count: number) => Promise<void>") | Adds one or more items to a dynamic list. |
| [`remove()`](!code#context.remove "(index: number \| undefined) => void") | Removes an item from a dynamic list by index. |
| [`sort()`](!code#context.sort "(fromIndex: number, toIndex: number) => Promise<void>") | Sorts a dynamic list by moving an item from one data index to another. |
| [`addLabel`](!code#context.addLabel "UnwrapDynamicProp<LooseRequired<TProps>[\"addLabel\"]> \| undefined") | The resolved label text for the add row button. |
| [`removeLabel`](!code#context.removeLabel "UnwrapDynamicProp<LooseRequired<TProps>[\"removeLabel\"]> \| undefined") | The resolved label text for the remove row button. |
| [`description`](!code#context.description "string \| (string & {}) \| undefined") | The resolved description text for the element. |
| [`descriptionId`](!code#context.descriptionId "string") | The DOM id for the element's description text region. |
| [`validation`](!code#context.validation "ShallowReactive<Record<string, ValidationView>>") | Per-language validation views keyed by language (`default` for non-translatable elements). |
| [`validator`](!code#context.validator "Validator") | The validator instance the element is registered with: the form's validator, a store-attached one, or a newly created one. |
| [`shouldValidate`](!code#context.shouldValidate "boolean") | Whether the element should validate live on user input, per the `validateOn` policy and the form's state. |
| [`onUserInput()`](!code#context.onUserInput "() => void") | Validates the element on user input when the live-validation policy allows it. |
| [`isFlatContainer`](!code#context.isFlatContainer "boolean") | Whether the element's data is flattened into the parent container rather than nested under its own `name` key. |
| [`containerModel`](!code#context.containerModel "unknown") | The model ref the element provides to its children via the container context: the parent's model for flat containers, the element's own `model` otherwise. |
| [`handleModelUpdate()`](!code#context.handleModelUpdate "(data: Event) => void") | Handles a native input event and updates the model from the event target. |
| [`initValidation()`](!code#context.initValidation "() => void") | Registers the element with the validator and compiles its rules. |
| [`destroyValidation()`](!code#context.destroyValidation "() => void") | Unregisters the element from the validator and clears its validation views. |
| [`dragIndex`](!code#context.dragIndex "any") | The data index of the item currently being dragged in a sortable list. |
| [`dropIndex`](!code#context.dropIndex "any") | The data index where the dragged item will be dropped. |
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root, `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. |
| [`list`](!code#context.list "any") | Ref to the container's root DOM element, used for drag-and-drop bounds detection. |
| [`canSort`](!code#context.canSort "boolean") | Whether the sort handle should be rendered. Returns `false` when the element is disabled or the optional sortable guard is falsy. |
| [`dropTarget`](!code#context.dropTarget "any") | The stable id rendered at the current drop position (in the live display order), or `undefined` when not hovering over a valid target. The list template compares this against each row's id to flag the drop target. |
| [`canAdd`](!code#context.canAdd "boolean") | Whether the add row button should be displayed, based on dynamic mode, disabled state, and max limit. |
| [`canRemove`](!code#context.canRemove "boolean") | Whether the remove row button should be displayed, based on dynamic mode, disabled state, and min limit. |
| [`gridClass`](!code#context.gridClass "string") | A unique CSS class scoped to this matrix instance, used to target the injected grid style rule. |
| [`gridColumns`](!code#context.gridColumns "string") | The computed `grid-template-columns` value based on visible columns, row headers, and remove button state. |
| [`addIcon`](!code#context.addIcon "string \| undefined") | The resolved icon identifier for the "add" button. |
| [`removeIcon`](!code#context.removeIcon "string \| undefined") | The resolved icon identifier for the "remove" button. |
| [`sortIcon`](!code#context.sortIcon "string \| undefined") | The resolved icon identifier for the sort handle button. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "Record<string, any> \| any") | The element's reactive model value within the form data tree. |
| [`value`](!code#context.value "any") | The current language-aware value of the element. For translatable elements, returns the value for the active language. |
| [`payload`](!code#context.payload "object") | The element's submission payload. Container elements aggregate from children; leaf elements return their own value. |
| [`nullValue`](!code#context.nullValue "any") | The value the element holds when it is considered empty. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel "Record<string, any> \| any") | A snapshot of the model at initialization time, used for dirty checking and reset. |
| [`dataPath`](!code#context.dataPath "string") | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path. |
| [`tracking`](!code#context.tracking "boolean") | Whether the element's `default` expression is currently tracked and auto-updating the value. |
| [`update()`](!code#context.update "(data: any) => void") | Updates the element's model value. Container elements perform a deep merge; leaf elements set the value directly. |
| [`load()`](!code#context.load "(data: any) => void") | Loads data into the element and fires the `load` event, cascading to all children. |
| [`reset()`](!code#context.reset "() => void") | Resets the element to its initial model state and fires the `reset` event. |
| [`clear()`](!code#context.clear "() => void") | Clears the element to its null value and fires the `clear` event. |
| [`track()`](!code#context.track "() => void") | Resumes expression tracking after an untrack, immediately re-writing the resolved value. |
| [`untrack()`](!code#context.untrack "() => void") | Stops expression tracking, leaving the current value in place. |
| [`reinit()`](!code#context.reinit "() => void") | Reinitializes the element by rebuilding both its model registration and validation instances. |

### State {#section-state}

| Name | Description |
| --- | --- |
| [`visible`](!code#context.visible "boolean") | Whether the element is currently visible, based on availability, container visibility, and pager state. |
| [`available`](!code#context.available "boolean") | Whether the element is available (not hidden by conditional logic). |
| [`disabled`](!code#context.disabled "boolean") | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
| [`empty`](!code#context.empty "boolean") | Whether the element's current value is empty. Container elements check whether all children are empty. |
| [`busy`](!code#context.busy "boolean") | Whether the element is busy, meaning it is either debouncing or has pending async validation. |
| [`hoisted`](!code#context.hoisted "boolean \| undefined") | Whether this element pushes its errors to its nearest ancestor element instead of displaying and reporting them itself. |
| [`enable()`](!code#context.enable "() => void") | Programmatically enables the element. |
| [`disable()`](!code#context.disable "() => void") | Programmatically disables the element. |

### Validation {#section-validation}

| Name | Description |
| --- | --- |
| [`invalid`](!code#context.invalid "boolean") | Whether any of the element's validations (across all languages) are currently invalid, including children. |
| [`validated`](!code#context.validated "boolean") | Whether all of the element's validations (across all languages) have been executed, including children. |
| [`completed`](!code#context.completed "boolean") | Whether the element is completed, meaning it either has no rules or has been validated without errors. |
| [`success`](!code#context.success "boolean") | Whether the element has been validated and passed (always `true` for elements without own rules), once touched. |
| [`pending`](!code#context.pending "boolean") | Whether any of the element's validations are currently pending an async check, including children. |
| [`debouncing`](!code#context.debouncing "boolean") | Whether any of the element's validations are currently debouncing, including children. |
| [`errors`](!code#context.errors "any[]") | All error messages for this element: its own plus any pushed up by hoisted children. |
| [`hasError`](!code#context.hasError "boolean") | Whether the element has any active error messages. |
| [`displayErrors`](!code#context.displayErrors "any[]") | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`. |
| [`ownErrors`](!code#context.ownErrors "string[]") | The element's own error messages (validation rules plus custom message bag entries). |
| [`formErrors`](!code#context.formErrors "object") | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent. |
| [`messages`](!code#context.messages "string[]") | The list of custom messages from the message bag, including messages from hoisted children. |
| [`messageBag`](!code#context.messageBag "MessageBagInstance") | The element's message bag for custom errors and messages. |
| [`required`](!code#context.required "boolean") | Whether the element is required by its current validation rules. |
| [`genericName`](!code#context.genericName "string") | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop. |
| [`validate()`](!code#context.validate "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Runs validation on the element's own rules and all children, returning whether everything is valid. |
| [`validateSelf()`](!code#context.validateSelf "() => Promise<boolean>") | Validates the element's own rules (without children), resolving with the result. |
| [`validateChildren()`](!code#context.validateChildren "(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>") | Validates stateful children, returning whether all are valid. By default only incomplete children run. |
| [`invalidate()`](!code#context.invalidate "() => void") | Marks all validation instances as invalidated, requiring revalidation. |
| [`unvalidate()`](!code#context.unvalidate "() => void") | Resets all validation state, including children's. |
| [`filled()`](!code#context.filled "(value: any) => boolean") | Checks whether a value is considered filled. |
| [`clean()`](!code#context.clean "() => void") | Marks the element as clean by updating the initial model snapshot. |
| [`clearErrors()`](!code#context.clearErrors "() => void") | Clears all error messages from the message bag. |
| [`clearMessages()`](!code#context.clearMessages "() => void") | Clears all custom messages from the message bag. |
| [`clearMessageBag()`](!code#context.clearMessageBag "() => void") | Clears the entire message bag, removing both errors and messages. |

### Layout {#section-layout}

| Name | Description |
| --- | --- |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
| [`nonce`](!code#context.nonce "string \| undefined") | Unique security nonce for injecting scoped styles. |
| [`viewLoaded`](!code#context.viewLoaded "boolean") | Whether the element's view has been loaded (used for lazy rendering optimization). |
| [`$el`](!code#context.$el "HTMLElement \| null") | Reference to the component's root DOM element. |
| [`resolvedColumns`](!code#context.resolvedColumns "object") | Resolved column sizes per breakpoint, normalized into container/label/wrapper/group values. |
| [`updateColumns()`](!code#context.updateColumns "(v: any) => any") | Updates the column configuration programmatically. |
| [`scrollTo()`](!code#context.scrollTo "(options: ScrollIntoViewOptions \| undefined, force: boolean \| undefined) => Promise<boolean>") | Scrolls the window to this element. If the element belongs to a step or tab, that page is selected first before scrolling. |
| [`focus()`](!code#context.focus "(scroll: boolean \| undefined) => Promise<boolean>") | Focuses the first focusable HTML element (input, select, textarea, button, etc.) within the wrapper. Optionally scrolls to the element first. |

### Tree {#section-tree}

| Name | Description |
| --- | --- |
| [`form$`](!code#context.form$ "VfFormContext<EntryProps<Record<string, any>>> \| undefined") | The parent form's context, providing access to form-level state and methods. |
| [`path`](!code#context.path "string") | The element's dot-notation path in the form tree (e.g. "user.name"). |
| [`componentName`](!code#context.componentName "keyof ComponentRegistry<Record<string, any>>") | The resolved Vue component name for this element. |
| [`container`](!code#context.container "ContainerContext \| undefined") | The container context providing path, model, and registration methods for child elements. |
| [`children`](!code#context.children "VueformChildren") | The child element registry providing registration, unregistration, and reactive child lists. |

### Handlers {#section-handlers}

| Name | Description |
| --- | --- |
| [`handleAdd()`](!code#context.handleAdd "() => Promise<void>") | Event handler that adds a new row to the matrix. |
| [`handleRemove()`](!code#context.handleRemove "(index: number) => void") | Event handler that removes a row at the given index from the matrix. |
| [`handleDragStart()`](!code#context.handleDragStart "(e: DragEvent, index: number) => void") | Initiates drag-and-drop reordering for the item at the given data index. |
| [`handleDragEnter()`](!code#context.handleDragEnter "(_e: DragEvent, index: number) => void") | Updates the current drop target during drag-and-drop. `index` is the hovered row's live display position; the dragged item moves straight to it (its origin position included, so it can be dropped back home). `dragIndex` stays the canonical data index that feeds `move`/`sort` as the source. |
| [`handleDrop()`](!code#context.handleDrop "(_e: DragEvent) => void") | Completes the drag-and-drop operation by sorting the dragged item to the drop position. |
| [`handleDragEnd()`](!code#context.handleDragEnd "() => void") | Cleans up drag-and-drop state after the operation ends. |
| [`handleWrapperDragOver()`](!code#context.handleWrapperDragOver "(e: DragEvent) => void") | Prevents default dragover behavior on the container to allow drops. |

### Accessibility {#section-a11y}

| Name | Description |
| --- | --- |
| [`uid`](!code#context.uid "string") | A unique auto-generated identifier for the element. |
| [`helpId`](!code#context.helpId "string") | The DOM id for the element's help text region. |
| [`errorId`](!code#context.errorId "string") | The DOM id for the element's error message region. |
| [`labelId`](!code#context.labelId "string") | The DOM id for the element's label region. |
<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/event-handlers) for details.

<!-- @events-start -->
| Name | Params | Description |
| --- | --- | --- |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
| `beforeMount` | [`context$`](!code#events.beforeMount.context$ "TContext") | Emitted before the component is mounted. |
| `mounted` | [`context$`](!code#events.mounted.context$ "TContext") | Emitted after the component is mounted. |
| `beforeUnmount` | [`context$`](!code#events.beforeUnmount.context$ "TContext") | Emitted before the component is unmounted. |
| `unmounted` | [`context$`](!code#events.unmounted.context$ "TContext") | Emitted after the component is unmounted. |
| `updated` | [`context$`](!code#events.updated.context$ "TContext") | Emitted after the component is updated. |
<!-- @events-end -->

<!-- @endtab -->
<!-- @tab Slots -->

## Slots

Named [Slots](/guide/slots) for replacing parts of the component's rendering.

<!-- @slots-start -->
| Name | Scope | Description |
| --- | --- | --- |
| `template` | [`context`](!code#slot.template.context "TContext") | Slot that replaces the entire component rendering. Receives the full component context as a single `context` prop. |
| `default` | — | Slot for the default matrix content. |
| `header` | [`class`](!code#slot.header.class "ClassValue") [`headers`](!code#slot.header.headers "(ResolvedMatrixCol \| {})[]") | Slot that replaces the header row. Receives class and header definitions. |
| `colHeader` | [`class`](!code#slot.colHeader.class "ClassValue") [`id`](!code#slot.colHeader.id "string") [`label`](!code#slot.colHeader.label "string") | Slot that replaces each column header cell. |
| `row` | [`class`](!code#slot.row.class "ClassValue") [`index`](!code#slot.row.index "number") [`rowHeader`](!code#slot.row.rowHeader "boolean") [`beingDragged`](!code#slot.row.beingDragged "boolean") [`isDropTarget`](!code#slot.row.isDropTarget "boolean") [`handleDragEnter`](!code#slot.row.handleDragEnter "($event: DragEvent) => void") [`handleDragStart`](!code#slot.row.handleDragStart "($event: DragEvent) => void") [`handleDragEnd`](!code#slot.row.handleDragEnd "() => void") [`canRemove`](!code#slot.row.canRemove "boolean") [`canSort`](!code#slot.row.canSort "boolean") [`label`](!code#slot.row.label "string") [`remove`](!code#slot.row.remove "() => void") [`cols`](!code#slot.row.cols "{ component: string \| Component; props: MatrixElementSchema }[]") | Slot that replaces each matrix row. Receives row state, drag handlers, label, remove handler, and columns. |
| `rowHeader` | [`class`](!code#slot.rowHeader.class "ClassValue") [`label`](!code#slot.rowHeader.label "string") | Slot that replaces each row header cell. |
| `sortWrapper` | [`class`](!code#slot.sortWrapper.class "ClassValue") [`handleDragEnter`](!code#slot.sortWrapper.handleDragEnter "($event: DragEvent) => void") [`handleDragStart`](!code#slot.sortWrapper.handleDragStart "($event: DragEvent) => void") [`handleDragEnd`](!code#slot.sortWrapper.handleDragEnd "() => void") | Slot that replaces the drag sort handle wrapper. |
| `sort` | [`class`](!code#slot.sort.class "ClassValue") [`handleDragEnter`](!code#slot.sort.handleDragEnter "($event: DragEvent) => void") [`handleDragStart`](!code#slot.sort.handleDragStart "($event: DragEvent) => void") [`handleDragEnd`](!code#slot.sort.handleDragEnd "() => void") | Slot that replaces the drag handle. Receives class and drag event handlers. |
| `cell` | [`component`](!code#slot.cell.component "string \| Component") [`props`](!code#slot.cell.props "MatrixElementSchema") [`handleDragEnter`](!code#slot.cell.handleDragEnter "($event: DragEvent) => void") | Slot that replaces each matrix cell. Receives the component, props for the cell element, and a drag enter handler for sortable rows. |
| `removeWrapper` | [`class`](!code#slot.removeWrapper.class "ClassValue") [`handleRemove`](!code#slot.removeWrapper.handleRemove "() => void") | Slot that replaces the row remove button wrapper. |
| `remove` | [`class`](!code#slot.remove.class "ClassValue") [`handleRemove`](!code#slot.remove.handleRemove "() => void") | Slot that replaces the row remove button. |
| `add` | [`class`](!code#slot.add.class "ClassValue") [`label`](!code#slot.add.label "TProp \| string") [`handleAdd`](!code#slot.add.handleAdd "() => void") | Slot that replaces the add row button. Receives class, label, and add handler. |
<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfMatrix"
:examples="{
default: 'Default',
dynamic: 'Dynamic Rows',
}"
:schema="{
label: 'Rate your experience',
info: 'Responses are anonymous',
help: 'Pick one rating per row',
hint: 'This will be shared with the product team',
cols: ['Poor', 'Fair', 'Good'],
rows: ['Price', 'Quality', 'Support'],
mode: 'single',
rules: 'required',
'part:errors': { 'pt:transition:appear': false },
showRequired: ['label'],
defaultValue: { Price: 'Good', Quality: 'Fair', Support: 'Good' },
onMounted: ({ messageBag }) => {
messageBag.append('Please complete every row', 'error')
messageBag.append('Progress is saved automatically', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfMatrix
      name="default"
      v-bind="schema"
    />
</template>
<template #example-dynamic="{ schema }">
<VfMatrix
      name="dynamic"
      v-bind="schema"
      label="Order items"
      help="Add one row per product"
      hint="This will appear on your invoice"
      info="Prices are in USD"
      sort
      mode="auto"
      :cols="['Product', 'Qty', 'Price']"
      :rows="2"
      :default-value="[
        { Product: 'Laptop stand', Qty: '2', Price: '$39' },
        { Product: 'USB-C cable', Qty: '3', Price: '$12' },
      ]"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `grid`

The grid layout element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-grid` `.vf-scrollable?` |

### `header`

The header row element with `display: contents`.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-header` |

### `colHeader`

Each column header element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-col-header` `.vf-sticky?` |

### `srOnlyHeader`

The screen-reader-only header element.

| | |
| --- | --- |
| **Element** | `<div>` |

### `row`

Each row element with `display: contents`.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-row` `.vf-dragging?` `.vf-drop-target?` |

### `rowHeader`

Each row header element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-row-header` `.vf-sticky?` |

### `cell`

Each cell element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-cell` |

### `sortWrapper`

The drag sort handle wrapper element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-row-sort` |

### `removeWrapper`

The row remove button wrapper element.

| | |
| --- | --- |
| **Element** | `<div>` |
| **Classes** | `.vf-matrix-row-remove` |

### `sort`

The drag sort handle element.

| | |
| --- | --- |
| **Element** | [`<VfButton>`](./VfButton.md) |
| **Classes** | `.vf-matrix-sort` |

### `remove`

The remove action element.

| | |
| --- | --- |
| **Element** | [`<VfButton>`](./VfButton.md) |
| **Classes** | `.vf-matrix-remove` |

### `add`

The add action element.

| | |
| --- | --- |
| **Element** | [`<VfButton>`](./VfButton.md) |
| **Classes** | `.vf-matrix-add` |
<!-- @parts-end -->
<!-- @endtab -->

<!-- @tab Tokens -->

## Tokens

All the CSS variables that control this component's appearance with default values in the default theme. See [Theming Guide](/guide/theming-guide#vueform-s-token-system) for details.

<!-- @tokens-start -->
<!-- @subtabs -->
<!-- @subtab CSS -->

```css
:root {
  /**
   * Element tokens
   * -------------------------------------------------------------------------- */
  --vf-matrix-gutter-x: var(--vf-gutter);
  --vf-matrix-gutter-y: var(--vf-gutter);

  --vf-matrix-col-header-color: inherit;
  --vf-matrix-header-font-size: 1rem;
  --vf-matrix-header-font-weight: 700;
  --vf-matrix-row-header-color: inherit;

  --vf-matrix-dragging-opacity: 0.6;

  --vf-matrix-add-margin: var(--vf-gutter) 0 0 0;

  --vf-tabular-bg: var(--vf-white);

  --vf-tabular-border-color: var(--vf-gray-300);
  --vf-tabular-border-style: solid;
  --vf-tabular-border-width: 1px;
  --vf-tabular-radius: var(--vf-radius);

  --vf-tabular-cell-min-height: calc(1lh + var(--vf-input-pt) + var(--vf-input-pb) + var(--vf-input-border-width-t) + var(--vf-input-border-width-b));
  --vf-tabular-text-cell-padding: var(--vf-py) var(--vf-px);

  --vf-tabular-col-header-bg: var(--vf-gray-100);
  --vf-tabular-col-header-border-color: var(--vf-gray-300);
  --vf-tabular-col-header-color: inherit;
  --vf-tabular-header-font-size: 1rem;
  --vf-tabular-header-font-weight: 700;
  --vf-tabular-header-padding: var(--vf-py) var(--vf-px);
  --vf-tabular-row-header-bg: var(--vf-gray-100);
  --vf-tabular-row-header-border-color: var(--vf-gray-300);
  --vf-tabular-row-header-color: inherit;

  --vf-tabular-color: var(--vf-gray-800);

  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  --vf-element-line-color: var(--vf-gray-300);

  --vf-label-font-size: 1rem;
  --vf-label-font-weight: 600;
  --vf-label-group-h-padding: calc(var(--vf-py) + var(--vf-border-width-t)) 0 0 0;
  --vf-label-group-v-padding: 0 0 0.375rem 0;

  --vf-required-bg: transparent;
  --vf-required-color: inherit;
  --vf-required-content: '*';
  --vf-required-h: auto;
  --vf-required-icon: none;
  --vf-required-w: auto;

  --vf-help-bg: transparent;
  --vf-help-border-color: transparent;
  --vf-help-border-style: solid;
  --vf-help-border-width: 0;
  --vf-help-color: var(--vf-text-soft);
  --vf-help-font-size: 0.875rem;
  --vf-help-padding: 0;
  --vf-help-radius: var(--vf-radius);

  --vf-description-bg: transparent;
  --vf-description-border-color: transparent;
  --vf-description-border-style: solid;
  --vf-description-border-width: 0;
  --vf-description-color: var(--vf-text-soft);
  --vf-description-font-size: 0.875rem;
  --vf-description-padding: 0;
  --vf-description-radius: var(--vf-radius);

  --vf-errors-bg: transparent;
  --vf-errors-border-color: transparent;
  --vf-errors-border-style: solid;
  --vf-errors-border-width: 0;
  --vf-errors-color: var(--vf-red);
  --vf-errors-font-size: 0.875rem;
  --vf-errors-padding: 0;
  --vf-errors-radius: var(--vf-radius);

  --vf-messages-bg: transparent;
  --vf-messages-border-color: var(--vf-border-success);
  --vf-messages-border-style: solid;
  --vf-messages-border-width: 0;
  --vf-messages-color: var(--vf-green);
  --vf-messages-font-size: 0.875rem;
  --vf-messages-padding: 0;
  --vf-messages-radius: var(--vf-radius);

  --vf-element-group-gutter-x: 0;
  --vf-element-group-gutter-y: 0.25rem;
  --vf-element-wrapper-padding: 0;

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  --vf-space-1: 1rem;
  --vf-space-2: 2rem;
  --vf-space-3: 3rem;
}
```

<!-- @endsubtab -->
<!-- @subtab JS -->

```ts
{
  /**
   * Element tokens
   * -------------------------------------------------------------------------- */
  matrixGutterX: '$gutter',
  matrixGutterY: '$gutter',

  matrixColHeaderColor: 'inherit',
  matrixHeaderFontSize: '1rem',
  matrixHeaderFontWeight: '700',
  matrixRowHeaderColor: 'inherit',

  matrixDraggingOpacity: '0.6',

  matrixAddMargin: '$gutter 0 0 0',

  tabularBg: '$white',

  tabularBorderColor: '$gray300',
  tabularBorderStyle: 'solid',
  tabularBorderWidth: '1px',
  tabularRadius: '$radius',

  tabularCellMinHeight: 'calc(1lh + var(--vf-input-pt) + var(--vf-input-pb) + var(--vf-input-border-width-t) + var(--vf-input-border-width-b))',
  tabularTextCellPadding: '$py $px',

  tabularColHeaderBg: '$gray100',
  tabularColHeaderBorderColor: '$gray300',
  tabularColHeaderColor: 'inherit',
  tabularHeaderFontSize: '1rem',
  tabularHeaderFontWeight: '700',
  tabularHeaderPadding: '$py $px',
  tabularRowHeaderBg: '$gray100',
  tabularRowHeaderBorderColor: '$gray300',
  tabularRowHeaderColor: 'inherit',

  tabularColor: '$gray800',

  /**
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  elementLineColor: '$gray300',

  labelFontSize: '1rem',
  labelFontWeight: '600',
  labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',
  labelGroupVPadding: '0 0 0.375rem 0',

  requiredBg: 'transparent',
  requiredColor: 'inherit',
  requiredContent: "'*'",
  requiredH: 'auto',
  requiredIcon: 'none',
  requiredW: 'auto',

  helpBg: 'transparent',
  helpBorderColor: 'transparent',
  helpBorderStyle: 'solid',
  helpBorderWidth: '0',
  helpColor: '$textSoft',
  helpFontSize: '0.875rem',
  helpPadding: '0',
  helpRadius: '$radius',

  descriptionBg: 'transparent',
  descriptionBorderColor: 'transparent',
  descriptionBorderStyle: 'solid',
  descriptionBorderWidth: '0',
  descriptionColor: '$textSoft',
  descriptionFontSize: '0.875rem',
  descriptionPadding: '0',
  descriptionRadius: '$radius',

  errorsBg: 'transparent',
  errorsBorderColor: 'transparent',
  errorsBorderStyle: 'solid',
  errorsBorderWidth: '0',
  errorsColor: '$red',
  errorsFontSize: '0.875rem',
  errorsPadding: '0',
  errorsRadius: '$radius',

  messagesBg: 'transparent',
  messagesBorderColor: '$borderSuccess',
  messagesBorderStyle: 'solid',
  messagesBorderWidth: '0',
  messagesColor: '$green',
  messagesFontSize: '0.875rem',
  messagesPadding: '0',
  messagesRadius: '$radius',

  elementGroupGutterX: '0',
  elementGroupGutterY: '0.25rem',
  elementWrapperPadding: '0',

  /**
   * Primitives tokens
   * -------------------------------------------------------------------------- */
  space1: '1rem',
  space2: '2rem',
  space3: '3rem',
}
```

<!-- @endsubtab -->
<!-- @endsubtabs -->
<!-- @tokens-end -->

<!-- @endtab -->

<!-- @endtabs -->
