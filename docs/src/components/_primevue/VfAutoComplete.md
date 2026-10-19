<script setup>
import { ref } from 'vue'
import { useHttp } from '@vueform/primevue'

const $http = useHttp()

const basicSuggestions = ref([])

const allData = [
  {
    category: 'Frameworks',
    options: [
      { name: 'Vue', icon: 'code', deprecated: false },
      { name: 'React', icon: 'code', deprecated: false },
      { name: 'Angular', icon: 'code', deprecated: false },
      { name: 'AngularJS', icon: 'code', deprecated: true },
      { name: 'Svelte', icon: 'code', deprecated: false },
    ],
  },
  {
    category: 'Languages',
    options: [
      { name: 'TypeScript', icon: 'file', deprecated: false },
      { name: 'JavaScript', icon: 'file', deprecated: false },
      { name: 'CoffeeScript', icon: 'file', deprecated: true },
      { name: 'Dart', icon: 'file', deprecated: false },
    ],
  },
  {
    category: 'Tools',
    options: [
      { name: 'Vite', icon: 'bolt', deprecated: false },
      { name: 'Webpack', icon: 'box', deprecated: false },
      { name: 'Gulp', icon: 'box', deprecated: true },
      { name: 'Rollup', icon: 'box', deprecated: false },
      { name: 'ESBuild', icon: 'bolt', deprecated: false },
    ],
  },
]

const handleSearch = (event) => {
  const query = event.query.toLowerCase()

  basicSuggestions.value = allData
    .map((group) => {
      return {
        ...group,
        items: group.options.filter((item) =>
          item.name.toLowerCase().includes(query)
        ),
      }
    })
    .filter((group) => group.options.length > 0)
}

const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)

const langSuggestions = async ({ query }) => {
  let where = ''
  if (query) {
    where = '&where=' + encodeURIComponent(
      JSON.stringify({ ProgrammingLanguage: {
        $regex: `${query}|${query.toUpperCase()}`
          + `|${query[0].toUpperCase() + query.slice(1)}`,
      } })
    )
  }
  const { data } = await $http.get(
    'https://parseapi.back4app.com/classes'
      + '/All_Programming_Languages'
      + '?limit=30&order=ProgrammingLanguage'
      + '&keys=ProgrammingLanguage' + where,
    {
      headers: {
        'X-Parse-Application-Id':
          'XpRShKqJcxlqE5EQKs4bmSkozac44osKifZvLXCL',
        'X-Parse-Master-Key':
          'Mr2UIBiCImScFbbCLndBv8qPRUKwBAq27plwXVuv',
      },
    }
  )
  return data?.results || []
}
</script>

# VfAutoComplete

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

## Basic Usage

`VfAutoComplete` wraps PrimeVue's [AutoComplete](https://v4.primevue.org/autocomplete/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate.

::: usage w-480

```vue [Preview]
<VfAutoComplete
  name="country"
  placeholder="Start typing..."
  option-label="name"
  :suggestions
  dropdown
  @complete="handleSearch"
/>
```

```vue [Template]
<script setup lang="ts">
import { ref } from 'vue'

const countries = [
  { name: 'Australia', code: 'AU' },
  { name: 'Canada', code: 'CA' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Japan', code: 'JP' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
]

const suggestions = ref([])

const handleSearch = (event) => {
  const query = event.query.toLowerCase()
  suggestions.value = countries.filter((c) =>
    c.name.toLowerCase().includes(query)
  )
}
</script>

<template>
  <VfAutoComplete
    name="country"
    placeholder="Start typing..."
    option-label="name"
    :suggestions
    dropdown
    @complete="handleSearch"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { ref } from 'vue'
import { defineSchema, useForm } from '@vueform/primevue'

const countries = [
  { name: 'Australia', code: 'AU' },
  { name: 'Canada', code: 'CA' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Japan', code: 'JP' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' },
]

const suggestions = ref([])

const handleSearch = (event) => {
  const query = event.query.toLowerCase()
  suggestions.value = countries.filter((c) =>
    c.name.toLowerCase().includes(query)
  )
}

const schema = defineSchema({
  country: {
    type: 'auto-complete',
    label: 'Country',
    placeholder: 'Start typing...',
    optionLabel: 'name',
    suggestions,
    dropdown: true,
    onComplete: handleSearch,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [AutoComplete](https://v4.primevue.org/autocomplete/).

## Async Function

The `suggestions` prop accepts an async function that receives a `query` parameter and returns a promise of items. Vueform handles the loading state automatically while the function resolves.

::: usage

```vue [Preview]
<VfAutoComplete
  name="language"
  :suggestions="async ({ query }) => {
    const { data } = await $http.get(`...?q=${query}`)
    return data?.results
  }"
/>
```

```vue [Template]
<script setup lang="ts">
import { useHttp } from '@vueform/primevue'

const $http = useHttp()

const suggestions = async ({ query }) => {
  let where = ''
  if (query) {
    where = '&where=' + encodeURIComponent(
      JSON.stringify({ ProgrammingLanguage: {
        $regex: `${query}|${query.toUpperCase()}`
          + `|${query[0].toUpperCase() + query.slice(1)}`,
      } })
    )
  }
  const { data } = await $http.get(
    'https://parseapi.back4app.com/classes'
      + '/All_Programming_Languages'
      + '?limit=30&order=ProgrammingLanguage'
      + '&keys=ProgrammingLanguage' + where,
    {
      headers: {
        'X-Parse-Application-Id':
          'XpRShKqJcxlqE5EQKs4bmSkozac44osKifZvLXCL',
        'X-Parse-Master-Key':
          'Mr2UIBiCImScFbbCLndBv8qPRUKwBAq27plwXVuv',
      },
    }
  )
  return data?.results || []
}
</script>

<template>
  <VfAutoComplete
    name="language"
    label="Programming language"
    placeholder="Search languages..."
    option-label="ProgrammingLanguage"
    :suggestions
    :min-length="2"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm, useHttp } from '@vueform/primevue'

const $http = useHttp()

const suggestions = async ({ query }) => {
  let where = ''
  if (query) {
    where = '&where=' + encodeURIComponent(
      JSON.stringify({ ProgrammingLanguage: {
        $regex: `${query}|${query.toUpperCase()}`
          + `|${query[0].toUpperCase() + query.slice(1)}`,
      } })
    )
  }
  const { data } = await $http.get(
    'https://parseapi.back4app.com/classes'
      + '/All_Programming_Languages'
      + '?limit=30&order=ProgrammingLanguage'
      + '&keys=ProgrammingLanguage' + where,
    {
      headers: {
        'X-Parse-Application-Id':
          'XpRShKqJcxlqE5EQKs4bmSkozac44osKifZvLXCL',
        'X-Parse-Master-Key':
          'Mr2UIBiCImScFbbCLndBv8qPRUKwBAq27plwXVuv',
      },
    }
  )
  return data?.results || []
}

const schema = defineSchema({
  language: {
    type: 'auto-complete',
    label: 'Programming language',
    placeholder: 'Search languages...',
    optionLabel: 'ProgrammingLanguage',
    suggestions,
    minLength: 2,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

```vue [Live]
<VfAutoComplete
  name="language"
  label="Programming language"
  placeholder="Search languages..."
  option-label="ProgrammingLanguage"
  :suggestions="langSuggestions"
  :min-length="2"
/>
```

:::

## Endpoint

The `suggestions` prop also accepts a URL string. Vueform sends a GET request with the typed query as a `query` parameter and uses the response as suggestions. Use `transformOptions` to reshape the response if needed.

::: usage

```vue [Preview]
<VfAutoComplete
  name="user"
  suggestions="https://api.github.com/search/users?per_page=5&q={SELF('query')}"
/>
```

```vue [Template]
<VfAutoComplete
  name="user"
  label="GitHub user"
  placeholder="Search users..."
  option-label="login"
  suggestions="https://api.github.com/search/users?per_page=5&q={SELF('query')}"
  :transform-options="(data) => data.items"
  :min-length="2"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  user: {
    type: 'auto-complete',
    label: 'GitHub user',
    placeholder: 'Search users...',
    optionLabel: 'login',
    suggestions: 'https://api.github.com/search/users?per_page=5&q={SELF("query")}',
    transformOptions: (data) => data.items,
    minLength: 2,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Disabled Options

The `optionDisabled` prop determines which suggestions are disabled. Like PrimeVue's native `optionDisabled`, it accepts a string key — but Vueform extends it so the referenced property can hold a `ConditionalProp`, enabling reactive disabled states that depend on other form values.

::: usage w-480

```vue [Preview]
<VfAutoComplete
  name="runtime"
  option-disabled="disabled"
  :suggestions="(ctx$) => [
    { name: 'Node 22' },
    { name: 'Node 20' },
    {
      name: 'Node 18 (legacy)',
      disabled: [['showLegacy', '!=', true]]
    },
    { name: 'Deno 2' },
    { name: 'Bun 1' },
  ].filter((r) => r.name
    .toLowerCase()
    .includes(ctx$.query?.toLowerCase())
  )"
/>
```

```vue [Template]
<VfForm>
  <VfCheckbox name="showLegacy" text="Allow legacy versions" />
  <VfAutoComplete
    name="runtime"
    label="Runtime"
    placeholder="Search runtimes..."
    option-label="name"
    option-disabled="disabled"
    :suggestions="(ctx$) => [
      { name: 'Node 22' },
      { name: 'Node 20' },
      { name: 'Node 18 (legacy)', disabled: [['showLegacy', '!=', true]] },
      { name: 'Deno 2' },
      { name: 'Bun 1' },
    ].filter((r) => r.name
      .toLowerCase()
      .includes(ctx$.query?.toLowerCase())
    )"
    dropdown
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const runtimes = [
  { name: 'Node 22' },
  { name: 'Node 20' },
  { name: 'Node 18 (legacy)', disabled: [['showLegacy', '!=', true]] },
  { name: 'Deno 2' },
  { name: 'Bun 1' },
]

const schema = defineSchema({
  showLegacy: {
    type: 'checkbox',
    text: 'Allow legacy versions',
  },
  runtime: {
    type: 'auto-complete',
    label: 'Runtime',
    placeholder: 'Search runtimes...',
    optionLabel: 'name',
    optionDisabled: 'disabled',
    suggestions: (ctx$) => runtimes.filter((r) => r.name
      .toLowerCase()
      .includes(ctx$.query.toLowerCase())
    ),
    dropdown: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

`optionDisabled` also accepts a function when you need logic to determine the disabled condition:

::: usage w-480 nolive

```vue [Preview]
<VfAutoComplete
  :option-disabled="
    (item) => item.legacy ? [['showLegacy', '!=', true]] : undefined
  "
  :suggestions="() => [
    { name: 'Node 18 (legacy)', legacy: true },
  ]"
/>
```

```vue [Template]
<VfForm>
  <VfCheckbox name="showLegacy" text="Allow legacy versions" />
  <VfAutoComplete
    name="runtime"
    label="Runtime"
    placeholder="Search runtimes..."
    option-label="name"
    :option-disabled="
      (item) => item.legacy ? [['showLegacy', '!=', true]] : undefined
    "
    :suggestions="(ctx$) =>[
      { name: 'Node 22' },
      { name: 'Node 20' },
      { name: 'Node 18 (legacy)', legacy: true },
      { name: 'Deno 2' },
      { name: 'Bun 1' },
    ].filter((r) =>
      r.name
        .toLowerCase()
        .includes(ctx$.query?.toLowerCase())
    )"
    dropdown
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const runtimes = [
  { name: 'Node 22', legacy: false },
  { name: 'Node 20', legacy: false },
  { name: 'Node 18 (legacy)', legacy: true },
  { name: 'Deno 2', legacy: false },
  { name: 'Bun 1', legacy: false },
]

const schema = defineSchema({
  showLegacy: {
    type: 'checkbox',
    text: 'Allow legacy versions',
  },
  runtime: {
    type: 'auto-complete',
    label: 'Runtime',
    placeholder: 'Search runtimes...',
    optionLabel: 'name',
    optionDisabled: (item) => item.legacy
      ? [['showLegacy', '!=', true]]
      : undefined,
    suggestions: (ctx$) =>
      runtimes.filter((r) =>
        r.name
          .toLowerCase()
          .includes(ctx$.query.toLowerCase())
      ),
    dropdown: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Icons

The `iconBefore` and `iconAfter` props add icons inside the input wrapper. See [Icons](/guide/element-layout#icons) for usage and [Configuration](/guide/configuration#icon) for class format customization.

::: usage

```vue [Preview]
<VfAutoComplete name="search" icon-before="search" />
<VfAutoComplete name="location" icon-after="map-marker" />
```

```vue [Template]
<script setup lang="ts">
const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)
</script>

<template>
  <VfAutoComplete
    name="search"
    placeholder="Search..."
    icon-before="search"
    :suggestions
  />
  <VfAutoComplete
    name="location"
    placeholder="Location"
    icon-after="map-marker"
    :suggestions
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)

const schema = defineSchema({
  search: {
    type: 'auto-complete',
    placeholder: 'Search...',
    iconBefore: 'search',
    suggestions,
  },
  location: {
    type: 'auto-complete',
    placeholder: 'Location',
    iconAfter: 'map-marker',
    suggestions,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Text Addons

The `addonBefore` and `addonAfter` props render text addons adjacent to the input. Pass a string for a single addon or an array for multiple.

::: usage

```vue [Preview]
<VfAutoComplete name="domain" addon-before="https://" addon-after=".com" />
<VfAutoComplete name="user" addon-before="@" />
<VfAutoComplete name="tag" :addon-before="['#', 'tag:']" />
```

```vue [Template]
<script setup lang="ts">
const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)
</script>

<template>
  <VfAutoComplete
    name="domain"
    placeholder="example"
    addon-before="https://"
    addon-after=".com"
    :suggestions
  />
  <VfAutoComplete
    name="user"
    placeholder="username"
    addon-before="@"
    :suggestions
  />
  <VfAutoComplete
    name="tag"
    placeholder="Search tags"
    :addon-before="['#', 'tag:']"
    :suggestions
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)

const schema = defineSchema({
  domain: {
    type: 'auto-complete',
    placeholder: 'example',
    addonBefore: 'https://',
    addonAfter: '.com',
    suggestions,
  },
  user: {
    type: 'auto-complete',
    placeholder: 'username',
    addonBefore: '@',
    suggestions,
  },
  tag: {
    type: 'auto-complete',
    placeholder: 'Search tags',
    addonBefore: ['#', 'tag:'],
    suggestions,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Element Addons

Addons can also be element schemas, allowing interactive controls like selects, buttons, checkboxes, or radios to be embedded alongside the input.

::: usage model

```vue [Preview]
<VfAutoComplete name="search" :addon-before="{
  name: 'scope',
  type: 'select',
  defaultValue: 'all',
  items: { all: 'All', docs: 'Docs', code: 'Code' },
}" />

<VfAutoComplete name="query" :addon-after="{
  name: 'go',
  type: 'button',
  text: 'Go',
}" />

<VfAutoComplete name="domain" :addon-before="{
  name: 'www',
  type: 'checkbox',
  text: 'www.',
}" />

<VfAutoComplete name="results" :addon-after="[
  { name: 'asc', type: 'radio', text: '▲', radioName: 'order' },
  { name: 'desc', type: 'radio', text: '▼', radioName: 'order' },
]" />
```

```vue [Template]
<script setup lang="ts">
const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)
</script>

<template>
  <VfForm>
    <VfAutoComplete
      name="search"
      placeholder="Search in {PROP(scope, 'selectedLabel')}..."
      :addon-before="{
        name: 'scope',
        type: 'select',
        defaultValue: 'all',
        items: { all: 'All', docs: 'Docs', code: 'Code' },
      }"
      :suggestions
    />
    <VfAutoComplete
      name="query"
      placeholder="Search..."
      :addon-after="{ name: 'go', type: 'button', text: 'Go' }"
      :suggestions
    />
    <VfAutoComplete
      name="domain"
      placeholder="example.com"
      :addon-before="{
        name: 'www',
        type: 'checkbox',
        text: 'www.',
      }"
      :suggestions
    />
    <VfAutoComplete
      name="results"
      placeholder="Search results"
      :addon-after="[
        { name: 'asc', type: 'radio', text: '▲', radioName: 'order' },
        { name: 'desc', type: 'radio', text: '▼', radioName: 'order' },
      ]"
      :suggestions
    />
  </VfForm>
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)

const schema = defineSchema({
  search: {
    type: 'auto-complete',
    placeholder: 'Search...',
    addonBefore: {
      name: 'scope',
      type: 'select',
      defaultValue: 'all',
      items: { all: 'All', docs: 'Docs', code: 'Code' },
    },
    suggestions,
  },
  query: {
    type: 'auto-complete',
    placeholder: 'Search...',
    addonAfter: { name: 'go', type: 'button', text: 'Go' },
    suggestions,
  },
  domain: {
    type: 'auto-complete',
    placeholder: 'example.com',
    addonBefore: { name: 'www', type: 'checkbox', text: 'www.' },
    suggestions,
  },
  results: {
    type: 'auto-complete',
    placeholder: 'Search results',
    addonAfter: [
      { name: 'asc', type: 'radio', text: '▲', radioName: 'order' },
      { name: 'desc', type: 'radio', text: '▼', radioName: 'order' },
    ],
    suggestions,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Float Label

The `floatLabel` prop displays a label that floats above the input when focused or filled, using PrimeVue's [FloatLabel](https://primevue.org/floatlabel/) component. The `float` prop controls the label behavior: omit it for the default "over" style, or set it to `'in'` or `'on'` for alternative placements.

::: usage center middle fit

```vue [Preview]
<VfAutoComplete name="over" float-label="Over Label" />
<VfAutoComplete name="in" float-label="In Label" float="in" />
<VfAutoComplete name="on" float-label="On Label" float="on" />
```

```vue [Template]
<script setup lang="ts">
const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)
</script>

<template>
  <VfGroup name="floatLabels">
    <VfAutoComplete
      name="over"
      float-label="Over Label"
      :columns="4"
      :suggestions
    />
    <VfAutoComplete
      name="in"
      float-label="In Label"
      float="in"
      :columns="4"
      :suggestions
    />
    <VfAutoComplete
      name="on"
      float-label="On Label"
      float="on"
      :columns="4"
      :suggestions
    />
  </VfGroup>
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const suggestions = (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)

const schema = defineSchema({
  over: {
    type: 'auto-complete',
    floatLabel: 'Over Label',
    columns: 4,
    suggestions,
  },
  in: {
    type: 'auto-complete',
    floatLabel: 'In Label',
    float: 'in',
    columns: 4,
    suggestions,
  },
  on: {
    type: 'auto-complete',
    floatLabel: 'On Label',
    float: 'on',
    columns: 4,
    suggestions,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## IFTA

The `ifta` prop renders an in-field top-aligned label using PrimeVue's [IftaLabel](https://primevue.org/iftalabel/) component. The label stays visible at the top of the input at all times.

::: usage

```vue [Preview]
<VfAutoComplete name="city" ifta="City" />
```

```vue [Template]
<VfAutoComplete
  name="city"
  ifta="City"
  :suggestions="(ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'auto-complete',
    ifta: 'City',
    suggestions: (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Hint Text

The `hint` prop displays advisory text below the input, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfAutoComplete name="skill" hint="Start typing to see matching skills." />
```

```vue [Template]
<VfAutoComplete
  name="skill"
  label="Primary skill"
  hint="Start typing to see matching skills."
  :suggestions="(ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  skill: {
    type: 'auto-complete',
    label: 'Primary skill',
    hint: 'Start typing to see matching skills.',
    suggestions: (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Help Text

The `help` prop displays advisory text below the label, rendered as a PrimeVue [Message](https://primevue.org/message/) with secondary severity. Unlike `hint` (which appears below the input), `help` is positioned directly under the label.

::: usage

```vue [Preview]
<VfAutoComplete
  name="manager"
  help="Select the person you report to directly."
/>
```

```vue [Template]
<VfAutoComplete
  name="manager"
  label="Reporting manager"
  help="Select the person you report to directly."
  :suggestions="(ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  manager: {
    type: 'auto-complete',
    label: 'Reporting manager',
    help: 'Select the person you report to directly.',
    suggestions: (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Info

The `info` prop displays an info icon next to the label that shows a tooltip on hover. The element must have a `label` for the info icon to appear. The `infoPosition` prop controls the tooltip placement.

::: usage

```vue [Preview]
<VfAutoComplete
  name="department"
  label="Department"
  info="Choose the department this role belongs to."
/>
```

```vue [Template]
<VfAutoComplete
  name="department"
  label="Department"
  info="Choose the department this role belongs to."
  :suggestions="(ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  department: {
    type: 'auto-complete',
    label: 'Department',
    info: 'Choose the department this role belongs to.',
    suggestions: (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Horizontal Label

The `columns` prop controls the responsive grid layout. Setting `columns.label` places the label and input side by side in a horizontal arrangement.

::: usage

```vue [Preview]
<VfAutoComplete name="country" label="Country" :columns="{ label: 4 }" />
```

```vue [Template]
<VfAutoComplete
  name="country"
  label="Country"
  placeholder="Select a country"
  :columns="{ label: 4 }"
  :suggestions="(ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  country: {
    type: 'auto-complete',
    label: 'Country',
    placeholder: 'Select a country',
    columns: { label: 4 },
    suggestions: (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Invalid

When the `rules` prop is set and validation fails, the input displays an invalid state with error messages below.

::: usage validate

```vue [Preview]
<VfAutoComplete name="technology" rules="required" />
```

```vue [Template]
<VfAutoComplete
  name="technology"
  label="Preferred technology"
  rules="required"
  force-selection
  :suggestions="(ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`)"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  technology: {
    type: 'auto-complete',
    label: 'Preferred technology',
    rules: 'required',
    forceSelection: true,
    suggestions: (ctx$) => [...Array(10).keys()].map((k) => `${ctx$.query}-${k}`),
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

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
| [`type`](!code#props.type "string") | `'auto-complete'` | The element type identifier. |
| [`id`](!code#props.id "TProp<string, TContext>") | — | The HTML `id` attribute for the input element. |

### Layout {#props-layout}

| Prop | Default | Description |
| --- | --- | --- |
| [`label`](!code#props.label "TProp<string, TContext>") | — | The label displayed alongside the element. |
| [`hideLabel`](!code#props.hideLabel "boolean") | `false` | Whether to visually hide the element's label. |
| [`page`](!code#props.page "PageProp<TContext>") | — | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property. |
| [`help`](!code#props.help "TProp<string, TContext>") | — | A help text displayed below the label. |
| [`placeholder`](!code#props.placeholder "TProp<string, TContext>") | — | The placeholder text displayed when the element is empty. |
| [`ifta`](!code#props.ifta "TProp") | — | The IFTA (in-field top-aligned) label text for the input. |
| [`floatLabel`](!code#props.floatLabel "TProp") | — | The floating label text displayed inside the input. |
| [`float`](!code#props.float "FloatProp") | — | Floating label behavior mode. |
| [`info`](!code#props.info "TProp") | — | Informational text displayed as a tooltip for the element. |
| [`infoPosition`](!code#props.infoPosition "InfoPositionProp") | — | Position of the info tooltip relative to the info icon. |
| [`addonBefore`](!code#props.addonBefore "AddonProp<TContext>") | — | Content or schema rendered as addons before the input. |
| [`addonAfter`](!code#props.addonAfter "AddonProp<TContext>") | — | Content or schema rendered as addons after the input. |
| [`iconBefore`](!code#props.iconBefore "DProp<string, TContext>") | — | Icon displayed before the input. |
| [`iconAfter`](!code#props.iconAfter "DProp<string, TContext>") | — | Icon displayed after the input. |
| [`loading`](!code#props.loading "ConditionalProp<TContext>") | — | Whether the element is in loading state. |
| [`columns`](!code#props.columns "ColumnsProp<TContext>") | — | Responsive grid column sizing for the element's layout. |
| [`layout`](!code#props.layout "ComponentProp \| boolean") | `true` | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout. |
| [`spaceTop`](!code#props.spaceTop "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`spaceBottom`](!code#props.spaceBottom "number") | — | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, .... |
| [`lineTop`](!code#props.lineTop "boolean") | `false` | Renders a horizontal line (border) above the element. |
| [`lineBottom`](!code#props.lineBottom "boolean") | `false` | Renders a horizontal line (border) below the element. |
| [`expressions`](!code#props.expressions "ExpressionsProp") | — | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Input {#props-autocomplete}

| Prop | Default | Description |
| --- | --- | --- |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |
| [`multiple`](!code#props.multiple "TMultiple \| boolean") | `false` | Whether to allow multiple selections. |
| [`headers`](!code#props.headers "Record<string, string>") | — | Custom HTTP headers to include when loading suggestions from an endpoint. |
| [`method`](!code#props.method "string") | — | The HTTP method to use when loading suggestions from an endpoint. Defaults to `'GET'`. |

### Options {#props-options}

| Prop | Default | Description |
| --- | --- | --- |
| [`suggestions`](!code#props.suggestions "MaybeRef<TSuggestions>") | — | The suggestion items for the element. |
| [`optionLabel`](!code#props.optionLabel "OptionKeyProp<TSuggestions, undefined, string>") | — | Resolves the label for a suggestion. A string key for property lookup, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionDisabled`](!code#props.optionDisabled "OptionKeyProp<TSuggestions, undefined, ConditionalProp<TContext> \| undefined>") | — | Determines whether a suggestion is disabled. A string key for property lookup, or a function returning a `ConditionalProp`. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionsTrigger`](!code#props.optionsTrigger "ConditionsTriggerProp") | — | The source that triggers re-resolution of function-based suggestions. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, function-based suggestions are only re-resolved when the `suggestions` prop reference itself changes. |
| [`optionsDebounce`](!code#props.optionsDebounce "number") | `300` | The debounce delay in milliseconds applied before re-resolving function-based suggestions when the `optionsTrigger` source changes. Defaults to no debounce (immediate re-resolution). |
| [`transformOptions`](!code#props.transformOptions "(data: any) => any[] \| Record<string, any>") | — | Transforms data received from an endpoint into the suggestions format. When `suggestions` is a string (endpoint URL), the HTTP response data is passed through this function before normalization. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>) => any") | — | Transforms the element's value when submitting the form. |

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

<!-- @props-adapter-start -->
### PrimeVue {#props-primevue}

<!-- @collapsible -->

#### Unavailable PrimeVue Props {#props-unavailable}

Props that are unavailable because Vueform covers them differently.

| Prop | Description |
| --- | --- |
| [`fluid`](!code#props.fluid "boolean \| undefined") | Use [`columns`](#props.columns) prop instead. |
| [`formControl`](!code#props.formControl "Record<string, any> \| undefined") | Vueform manages form control registration internally. |
| [`invalid`](!code#props.invalid "boolean \| undefined") | Managed automatically by Vueform's validation system. |

<!-- @endcollapsible -->

<!-- @collapsible closed -->

#### Unaffected PrimeVue Props {#props-unaffected}

PrimeVue props that work exactly the same — Vueform does not modify them.

| Prop | Description |
| --- | --- |
| [`appendTo`](!code#props.appendTo "HintedString<'body' \| 'self'> \| undefined \| HTMLElement") | A valid query selector or an HTMLElement to specify where the overlay gets attached. Special keywords are 'body' for document body and 'self' for the element itself. |
| [`ariaLabel`](!code#props.ariaLabel "string \| undefined") | Defines a string value that labels an interactive element. |
| [`ariaLabelledby`](!code#props.ariaLabelledby "string \| undefined") | Identifier of the underlying input element. |
| [`autoOptionFocus`](!code#props.autoOptionFocus "boolean \| undefined") | Whether to focus on the first visible or selected element when the overlay is shown. |
| [`chipIcon`](!code#props.chipIcon "string \| undefined") | Icon to display in chip remove action. |
| [`completeOnFocus`](!code#props.completeOnFocus "boolean \| undefined") | Whether to run a query when input receives focus. |
| [`dataKey`](!code#props.dataKey "string \| undefined") | A property to uniquely identify an option. |
| [`delay`](!code#props.delay "number \| undefined") | Delay between keystrokes to wait before sending a query. |
| [`dropdown`](!code#props.dropdown "boolean \| undefined") | Displays a button next to the input field when enabled. |
| [`dropdownClass`](!code#props.dropdownClass "string \| object \| undefined") | Style class of the dropdown button. |
| [`dropdownIcon`](!code#props.dropdownIcon "string \| undefined") | Icon to display in the dropdown. |
| [`dropdownMode`](!code#props.dropdownMode "HintedString<'blank' \| 'current'> \| undefined") | Specifies the behavior dropdown button. Default 'blank' mode sends an empty string and 'current' mode sends the input value. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`emptySearchMessage`](!code#props.emptySearchMessage "string \| undefined") | Text to display when filtering does not return any results. Defaults to value from PrimeVue locale configuration. |
| [`emptySelectionMessage`](!code#props.emptySelectionMessage "string \| undefined") | Text to be displayed in hidden accessible field when any option is not selected. Defaults to value from PrimeVue locale configuration. |
| [`focusOnHover`](!code#props.focusOnHover "boolean \| undefined") | When enabled, the focus is placed on the hovered option. |
| [`forceSelection`](!code#props.forceSelection "boolean \| undefined") | When present, autocomplete clears the manual input if it does not match of the suggestions to force only accepting values from the suggestions. |
| [`inputClass`](!code#props.inputClass "string \| object \| undefined") | Style class of the input field. |
| [`inputId`](!code#props.inputId "string \| undefined") | Identifier of the underlying input element. |
| [`inputStyle`](!code#props.inputStyle "object \| undefined") | Inline style of the input field. |
| [`loader`](!code#props.loader "string \| undefined") | Icon to display in loading state. |
| [`loadingIcon`](!code#props.loadingIcon "string \| undefined") | Icon to display in loading state. |
| [`minLength`](!code#props.minLength "number \| undefined") | Minimum number of characters to initiate a search. |
| [`optionGroupChildren`](!code#props.optionGroupChildren "string \| ((data: any) => any[]) \| undefined") | Property name or getter function that refers to the children options of option group. |
| [`optionGroupLabel`](!code#props.optionGroupLabel "string \| ((data: any) => string) \| undefined") | Property name or getter function to use as the label of an option group. |
| [`overlayClass`](!code#props.overlayClass "string \| object \| undefined") | Style class of the overlay overlay. |
| [`overlayStyle`](!code#props.overlayStyle "object \| undefined") | Inline style of the overlay overlay. |
| [`panelClass`](!code#props.panelClass "string \| object \| undefined") | Style class of the overlay. |
| [`panelStyle`](!code#props.panelStyle "object \| undefined") | Inline style of the overlay. |
| [`pt`](!code#props.pt "PassThrough<AutoCompletePassThroughOptions>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`removeTokenIcon`](!code#props.removeTokenIcon "string \| undefined") | Icon to display in chip remove action. |
| [`scrollHeight`](!code#props.scrollHeight "string \| undefined") | Maximum height of the suggestions overlay. |
| [`searchLocale`](!code#props.searchLocale "string \| undefined") | Locale to use in searching. The default locale is the host environment's current locale. |
| [`searchMessage`](!code#props.searchMessage "string \| undefined") | Text to be displayed in hidden accessible field when filtering returns any results. Defaults to value from PrimeVue locale configuration. |
| [`selectionMessage`](!code#props.selectionMessage "string \| undefined") | Text to be displayed in hidden accessible field when options are selected. Defaults to value from PrimeVue locale configuration. |
| [`selectOnFocus`](!code#props.selectOnFocus "boolean \| undefined") | When enabled, the focused option is selected. |
| [`showClear`](!code#props.showClear "boolean \| undefined") | When enabled, a clear icon is displayed to clear the value. |
| [`showEmptyMessage`](!code#props.showEmptyMessage "boolean \| undefined") | When enabled, empty search message will be visible. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the component. |
| [`tabindex`](!code#props.tabindex "number \| string \| undefined") | Index of the element in tabbing order. |
| [`typeahead`](!code#props.typeahead "boolean \| undefined") | whether typeahead is active or not. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`variant`](!code#props.variant "HintedString<'outlined' \| 'filled'> \| undefined \| null") | Specifies the input variant of the component. |
| [`virtualScrollerOptions`](!code#props.virtualScrollerOptions "VirtualScrollerProps") | Whether to use the virtualScroller feature. The properties of VirtualScroller component can be used like an object in it. |

<!-- @endcollapsible -->
<!-- @props-adapter-end -->
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

### AutoComplete {#section-autocomplete}

| Name | Description |
| --- | --- |
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
| [`rootModel`](!code#context.rootModel "RootModel \| undefined") | The root model backing the form when this element operates as the form root, `undefined` for every other element. |
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `inputRef` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value pickup and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |
| [`show()`](!code#context.show "(isFocus: boolean \| undefined) => void") | Shows the auto-complete overlay. |
| [`hide()`](!code#context.hide "(isFocus: boolean \| undefined) => void") | Hides the auto-complete overlay. |

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
| [`focused`](!code#context.focused "boolean") | Whether the element is currently focused. |
| [`touched`](!code#context.touched "boolean") | Whether the element has been touched (blurred) by the user. |
| [`visited`](!code#context.visited "boolean") | Whether the element has been visited (focused) by the user. |
| [`dirty`](!code#context.dirty "boolean") | Whether the current model value differs from the initial model value. |
| [`loading`](!code#context.loading "boolean") | Whether the element is in a loading state, true when pending, explicitly set to loading, or resolved via conditions. |
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
| [`inputRef`](!code#context.inputRef "any") | Ref to the underlying input element. |
| [`id`](!code#context.id "string") | The resolved element id, using the id prop or falling back to the auto-generated uid. |
| [`label`](!code#context.label "string \| undefined") | The resolved label text for the element. |
| [`help`](!code#context.help "string") | The resolved help text for the element. |
| [`placeholder`](!code#context.placeholder "string \| (string & {}) \| undefined") | The resolved placeholder text, supporting static strings and dynamic text props. |
| [`page`](!code#context.page "PageProp \| undefined") | Page metadata for stepped/tabbed forms. |
| [`addonable`](!code#context.addonable "true") | Whether this element supports before/after addons. |
| [`addonsBefore`](!code#context.addonsBefore "AddonItem[]") | Array of resolved before-addons, each an individual `AddonItem` for `VfAddon`. |
| [`addonsAfter`](!code#context.addonsAfter "AddonItem[]") | Array of resolved after-addons, each an individual `AddonItem` for `VfAddon`. |
| [`iconBefore`](!code#context.iconBefore "string \| undefined") | The resolved CSS class string for the icon displayed before the input. |
| [`iconAfter`](!code#context.iconAfter "string \| undefined") | The resolved CSS class string for the icon displayed after the input. |
| [`classes`](!code#context.classes "object") | The resolved CSS class map for the component. |
| [`parts`](!code#context.parts "object") | The resolved DOM attribute overrides for internal elements. |
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
| [`handleInput()`](!code#context.handleInput "(payload: any, e: Event \| undefined) => void") | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it.<br><br>Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends.<br><br>The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only picked up while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleBlur()`](!code#context.handleBlur "(e: Event) => void") | Fires the blur event on the element. |
| [`handleFocus()`](!code#context.handleFocus "(e: Event) => void") | Handles focus by setting the focused state and firing the focus event. |

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
| `complete` | [`event`](!code#events.complete.event "AutoCompleteCompleteEvent"), [`context$`](!code#events.complete.context$ "TContext") | Callback to invoke to search for suggestions. |
| `optionSelect` | [`event`](!code#events.optionSelect.event "AutoCompleteOptionSelectEvent"), [`context$`](!code#events.optionSelect.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke when a suggestion is selected. |
| `optionUnselect` | [`event`](!code#events.optionUnselect.event "AutoCompleteOptionUnselectEvent"), [`context$`](!code#events.optionUnselect.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke when a selected value is removed. |
| `dropdownClick` | [`event`](!code#events.dropdownClick.event "AutoCompleteDropdownClickEvent"), [`context$`](!code#events.dropdownClick.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke to when dropdown button is clicked. |
| `show` | [`context$`](!code#events.show.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke when the overlay is shown. |
| `beforeShow` | [`context$`](!code#events.beforeShow.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke before the overlay is shown. |
| `hide` | [`context$`](!code#events.hide.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke when the overlay is hidden. |
| `beforeHide` | [`context$`](!code#events.beforeHide.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Callback to invoke before the overlay is hidden. |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `valueChange` | [`value`](!code#events.valueChange.value "any"), [`context$`](!code#events.valueChange.context$ "VfAutoCompleteContext<VfAutoCompleteProps<TSuggestions, TMultiple, TModel>>") | Emitted when the value changes in uncontrolled mode. |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value "T") | Emitted to update the v-model binding. |
| `load` | [`value`](!code#events.load.value "T"), [`context$`](!code#events.load.context$ "TContext") | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset` | [`context$`](!code#events.reset.context$ "TContext") | Emitted when the element is reset to its default value. |
| `clear` | [`context$`](!code#events.clear.context$ "TContext") | Emitted when the element's value is cleared. |
| `invalid` | [`context$`](!code#events.invalid.context$ "TContext") | Emitted when the element becomes invalid. |
| `valid` | [`context$`](!code#events.valid.context$ "TContext") | Emitted when the element becomes valid after having been invalid. |
| `input` | [`value`](!code#events.input.value "V"), [`e`](!code#events.input.e "Event \| undefined"), [`context$`](!code#events.input.context$ "TContext") | Emitted when the input value is changed via the UI by the user. |
| `focus` | [`context$`](!code#events.focus.context$ "TContext") | Emitted when the element receives focus. |
| `blur` | [`context$`](!code#events.blur.context$ "TContext") | Emitted when the element loses focus. |
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
| `label` | [`label`](!code#slot.label.label "string") | Slot for customizing the element's label content. |
| `required` | — | Slot for customizing the required indicator. |
| `info` | [`info`](!code#slot.info.info "string") | Slot for customizing the info tooltip or helper content. |
| `ifta` | [`ifta`](!code#slot.ifta.ifta "string") | Slot for customizing the IFTA label content. |
| `float-label` | [`floatLabel`](!code#slot.float-label.floatLabel "string") | Slot for customizing the floating label content. |
| `addon-before` | [`addonBefore`](!code#slot.addon-before.addonBefore "AddonProp \| undefined") | Slot that replaces the before-addons section. |
| `addon-after` | [`addonAfter`](!code#slot.addon-after.addonAfter "AddonProp \| undefined") | Slot that replaces the after-addons section. |
| `icon-before` | [`iconBefore`](!code#slot.icon-before.iconBefore "string \| undefined") | Slot that replaces the icon rendered before the input. |
| `icon-after` | [`iconAfter`](!code#slot.icon-after.iconAfter "string \| undefined") | Slot that replaces the icon rendered after the input. |
| `help` | [`help`](!code#slot.help.help "string") | Slot for customizing the help text. |
| `description` | [`description`](!code#slot.description.description "string") | Slot for customizing the description text. |
| `dropdown` | [`toggleCallback`](!code#slot.dropdown.toggleCallback "(event: Event) => void") | Custom dropdown template. |
| `loader` | [`options`](!code#slot.loader.options "any[]") | Custom loader template. |
| `empty` | — | Custom empty template when there is no data to display. |
| `dropdownicon` | [`class`](!code#slot.dropdownicon.class "string") | Custom dropdown icon template. |
| `chipicon` | [`class`](!code#slot.chipicon.class "string") [`index`](!code#slot.chipicon.index "number") [`removeCallback`](!code#slot.chipicon.removeCallback "(event: Event, index: number) => void") | Custom chip icon template in multiple mode. |
| `clearicon` | [`clearCallback`](!code#slot.clearicon.clearCallback "(event: Event) => void") | Custom clear icon template. |
| `option` | [`option`](!code#slot.option.option "any") [`index`](!code#slot.option.index "number") | Custom content for each suggestion option. |
| `optiongroup` | [`option`](!code#slot.optiongroup.option "any") [`index`](!code#slot.optiongroup.index "number") | Custom content for each suggestion option group. |
| `chip` | [`value`](!code#slot.chip.value "any") [`index`](!code#slot.chip.index "number") [`removeCallback`](!code#slot.chip.removeCallback "(event: Event) => void") | Custom chip template for a selected suggestion in multiple mode. |
| `header` | [`value`](!code#slot.header.value "any") [`suggestions`](!code#slot.header.suggestions "any[]") | Custom header template of the overlay panel. |
| `footer` | [`value`](!code#slot.footer.value "any") [`suggestions`](!code#slot.footer.suggestions "any[]") | Custom footer template of the overlay panel. |
| `content` | [`items`](!code#slot.content.items "any[]") [`styleClass`](!code#slot.content.styleClass "string") [`contentRef`](!code#slot.content.contentRef "(el: any) => void") [`getItemOptions`](!code#slot.content.getItemOptions "(index: number) => any") | Custom content template for virtual scrolling. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfAutoComplete"
:examples="{
default: 'Default',
float: 'Float Label',
ifta: 'Ifta',
icons: 'Icons',
addons: 'Addons',
mix: 'Mix',
}"
:schema="{
label: 'Repository',
info: 'The full repository name, e.g. vueform/primevue. Used to identify the source for deployment.',
help: 'Start typing to search your repositories',
hint: 'This will be your deployment source',
rules: 'required',
showRequired: ['label'],
modelValue: 'vueform/primevue',
suggestions: () => [
'vueform/primevue',
'vueform/next',
'vueform/ui',
],
onMounted: ({ messageBag }) => {
messageBag.append('Repository could not be found', 'error')
messageBag.append('Repository connected successfully', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfAutoComplete
      name="default"
      v-bind="schema"
    />
</template>
<template #example-float="{ schema }">
<VfAutoComplete
      name="float"
      v-bind="schema"
      float-label="Repository"
      float="on"
    />
</template>
<template #example-ifta="{ schema }">
<VfAutoComplete
      name="ifta"
      v-bind="schema"
      ifta="Repository"
    />
</template>
<template #example-icons="{ schema }">
<VfAutoComplete
      name="icons"
      v-bind="schema"
      icon-before="github"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfAutoComplete
      name="addons"
      v-bind="schema"
      addon-before="github.com/"
      addon-after=".git"
    />
</template>
<template #example-mix="{ schema }">
<VfAutoComplete
      name="mix"
      v-bind="schema"
      addon-before="github.com/"
      icon-after="lock"
      float-label="Repository"
      float="on"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `panel`

The wrapper around `root` with `display: contents` when the element is a step or a tab.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<TabPanel>`](https://primevue.org/tabpanel/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-panel` |

### `root`

The element's root wrapper.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<fieldset>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-auto-complete` |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-align-label`](!code#parts.root.modifiers.data-align-label "''") |

### `labelGroup`

The container holding the label and required indicator.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<legend>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label-group` |

### `label`

The label element, associated with the control via `for`.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` `<span>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.label.a11y.id "string") |

### `required`

The required indicator.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` [`<TabsProps>`](https://primevue.org/tabsprops/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element-group` |

### `elementWrapper`

The wrapper directly around the input control.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element-wrapper` |

### `help`

The help text area.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-help` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.help.a11y.id "string") |

### `input`

The auto-complete input element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<AutoComplete>`](https://primevue.org/autocomplete/) |
| **Modifiers** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The <code>data-*</code> state and variant attributes this part carries."}]'></a> | [`data-invalid`](!code#parts.input.modifiers.data-invalid "''") |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`aria-describedby`](!code#parts.input.a11y.aria-describedby "string") [`aria-invalid`](!code#parts.input.a11y.aria-invalid "true") [`aria-required`](!code#parts.input.a11y.aria-required "true") [`aria-busy`](!code#parts.input.a11y.aria-busy "true") |

### `info`

Info container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-info` |

### `infoIcon`

Icon for displaying info tooltip.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<span>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-info-icon` |

### `description`

The description text area.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-description` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.description.a11y.id "string") |

### `addonBefore`

An individual addon rendered before the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `addonGroup`

The addon group wrapper element.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |

### `iconBefore`

The icon rendered before the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |

### `floatWrapper`

The PrimeVue FloatLabel wrapper around the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<FloatLabel>`](https://primevue.org/floatlabel/) |

### `float`

The label tag inside PrimeVue FloatLabel.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` |

### `iftaWrapper`

The PrimeVue IftaLabel wrapper around the input.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<IftaLabel>`](https://primevue.org/iftalabel/) |

### `ifta`

The label tag inside PrimeVue IftaLabel.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` |

### `errors`

The validation errors container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-errors` |
| **A11y** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The accessibility attributes this part carries."}]'></a> | [`id`](!code#parts.errors.a11y.id "string") [`role`](!code#parts.errors.a11y.role "'alert'") |

### `error`

An individual validation error.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-error` |

### `messages`

The info messages container.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-messages` |

### `message`

An individual info message.

| | |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-message` |
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
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  --vf-element-line-color: var(--vf-gray-300);

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
   * Shared element layout tokens
   * -------------------------------------------------------------------------- */
  elementLineColor: '$gray300',

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
