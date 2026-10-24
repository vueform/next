<script setup>
import { useHttp } from '@vueform/primevue'

const $http = useHttp()

const countries = [
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
</script>

# VfCascadeSelect

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->

## Basic Usage

`VfCascadeSelect` wraps PrimeVue's [CascadeSelect](https://v4.primevue.org/cascadeselect/) and forwards its entire API — original props, events, and slots all work as documented, apart from the few exceptions in the [PrimeVue Props](#props.props-primevue) table. On top of that, Vueform adds its own props, events, slots, and features — data binding, validation, conditions, and layout — which the examples on this page demonstrate.

::: usage w-sm

```vue [Preview]
<VfCascadeSelect
  name="city"
  placeholder="Select a city..."
  option-label="cname"
  option-value="code"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  :options="countries"
/>
```

```vue [Template]
<script setup lang="ts">
const countries = [
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'SYD' },
          { cname: 'Newcastle', code: 'NTL' },
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
    ],
  },
]
</script>

<template>
  <VfCascadeSelect
    name="city"
    placeholder="Select a city..."
    option-label="cname"
    option-value="code"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    :options="countries"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const countries = [
  {
    name: 'Australia',
    code: 'AU',
    states: [
      {
        name: 'New South Wales',
        cities: [
          { cname: 'Sydney', code: 'SYD' },
          { cname: 'Newcastle', code: 'NTL' },
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
    ],
  },
]

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionValue: 'code',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: countries,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

For the official PrimeVue examples, visit [CascadeSelect](https://v4.primevue.org/cascadeselect/).

## Async Function

The `options` prop accepts a function that returns a promise. Vueform handles the loading state automatically while the function resolves. The function receives the element's context object.

::: usage w-sm

```vue [Preview]
<VfCascadeSelect
  name="city"
  :options="async () => {
    const { data } = await $http.get('/api/countries')
    return data
  }"
/>
```

```vue [Template]
<script setup lang="ts">
import { useHttp } from '@vueform/primevue'

const $http = useHttp()
</script>

<template>
  <VfCascadeSelect
    name="city"
    label="City"
    placeholder="Select a city..."
    option-label="cname"
    option-value="code"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    :options="async () => {
      const { data } = await $http.get('/data/countries.json')
      return data
    }"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm, useHttp } from '@vueform/primevue'

const $http = useHttp()

const options = async () => {
  const { data } = await $http.get('/data/countries.json')
  return data
}

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'City',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionValue: 'code',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## Endpoint

The `options` prop also accepts a URL string. Vueform sends a request and uses the response as options. Use `transformOptions` to reshape the response if needed.

::: usage w-sm

```vue [Preview]
<VfCascadeSelect name="city" options="/api/countries" />
```

```vue [Template]
<VfCascadeSelect
  name="city"
  label="City"
  placeholder="Select a city..."
  option-label="cname"
  option-value="code"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'City',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionValue: 'code',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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

The `iconBefore` and `iconAfter` props display [icons](/guide/element-layout#icons) inside the input wrapper. The icon class format can be [configured](/guide/configuration#icon) globally.

::: usage

```vue [Preview]
<VfCascadeSelect name="origin" icon-before="map-marker" />
<VfCascadeSelect name="destination" icon-after="map-marker" />
```

```vue [Template]
<VfCascadeSelect
  name="origin"
  placeholder="Origin"
  icon-before="map-marker"
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
<VfCascadeSelect
  name="destination"
  placeholder="Destination"
  icon-after="map-marker"
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  origin: {
    type: 'cascade-select',
    placeholder: 'Origin',
    iconBefore: 'map-marker',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
  },
  destination: {
    type: 'cascade-select',
    placeholder: 'Destination',
    iconAfter: 'map-marker',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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

The `addonBefore` and `addonAfter` props render content alongside the input. When passed a string, it displays as a text addon. Pass an array for multiple addons.

::: usage

```vue [Preview]
<VfCascadeSelect name="orig" addon-before="From city:" />
<VfCascadeSelect name="dest" addon-before="To:" addon-after="airport" />
<VfCascadeSelect name="stop" :addon-before="['Route', 'via:']" />
```

```vue [Template]
<VfCascadeSelect
  name="orig"
  addon-before="From city:"
  placeholder="Select origin city..."
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
<VfCascadeSelect
  name="dest"
  addon-before="To:"
  addon-after="airport"
  placeholder="Select destination city..."
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
<VfCascadeSelect
  name="stop"
  :addon-before="['Route', 'via:']"
  placeholder="Select stopover city..."
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  orig: {
    type: 'cascade-select',
    addonBefore: 'From city:',
    placeholder: 'Select origin city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
  },
  dest: {
    type: 'cascade-select',
    addonBefore: 'To:',
    addonAfter: 'airport',
    placeholder: 'Select destination city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
  },
  stop: {
    type: 'cascade-select',
    addonBefore: ['Route', 'via:'],
    placeholder: 'Select stopover city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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
<VfCascadeSelect name="city" :addon-before="{
  name: 'region',
  type: 'select',
  defaultValue: 'apac',
  options: { apac: 'APAC', emea: 'EMEA', amer: 'AMER' },
}" />

<VfCascadeSelect name="office" :addon-after="{
  name: 'confirm',
  type: 'button',
  text: 'Confirm',
}" />

<VfCascadeSelect name="branch" :addon-before="{
  name: 'primary',
  type: 'checkbox',
  text: 'Primary',
}" />

<VfCascadeSelect name="hub" :addon-after="[
  { name: 'domestic', type: 'radio', text: 'DOM', radioName: 'scope' },
  { name: 'international', type: 'radio', text: 'INT', radioName: 'scope' },
]" />
```

```vue [Template]
<VfForm>
  <VfCascadeSelect
    name="city"
    placeholder="Select a city..."
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/{region}.json"
    :addon-before="{
      name: 'region',
      type: 'select',
      defaultValue: 'apac',
      options: { apac: 'APAC', emea: 'EMEA', amer: 'AMER' },
    }"
  />
  <VfCascadeSelect
    name="office"
    placeholder="Select a city..."
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/countries.json"
    :addon-after="{
      name: 'confirm',
      type: 'button',
      text: 'Confirm',
    }"
  />
  <VfCascadeSelect
    name="branch"
    placeholder="Select a city..."
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/countries.json"
    :addon-before="{
      name: 'primary',
      type: 'checkbox',
      text: 'Primary',
    }"
  />
  <VfCascadeSelect
    name="hub"
    placeholder="Select a city..."
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/countries.json"
    :addon-after="[
      { name: 'domestic', type: 'radio', text: 'DOM', radioName: 'scope' },
      { name: 'international', type: 'radio', text: 'INT', radioName: 'scope' },
    ]"
  />
</VfForm>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/{region}.json',
    addonBefore: {
      name: 'region',
      type: 'select',
      defaultValue: 'apac',
      options: { apac: 'APAC', emea: 'EMEA', amer: 'AMER' },
    },
  },
  office: {
    type: 'cascade-select',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
    addonAfter: {
      name: 'confirm',
      type: 'button',
      text: 'Confirm',
    },
  },
  branch: {
    type: 'cascade-select',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
    addonBefore: {
      name: 'primary',
      type: 'checkbox',
      text: 'Primary',
    },
  },
  hub: {
    type: 'cascade-select',
    placeholder: 'Select a city...',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
    addonAfter: [
      { name: 'domestic', type: 'radio', text: 'DOM', radioName: 'scope' },
      { name: 'international', type: 'radio', text: 'INT', radioName: 'scope' },
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

## Float Label

The `floatLabel` prop displays a label that floats above the input when focused or filled, using PrimeVue's [FloatLabel](https://primevue.org/floatlabel/) component. The `float` prop controls the label behavior: omit it for the default "over" style, or set it to `'in'` or `'on'` for alternative placements.

::: usage middle w-full

```vue [Preview]
<VfCascadeSelect name="over" float-label="Over Label" />
<VfCascadeSelect name="in" float-label="In Label" float="in" />
<VfCascadeSelect name="on" float-label="On Label" float="on" />
```

```vue [Template]
<VfGroup name="floatLabels">
  <VfCascadeSelect
    name="over"
    float-label="Over Label"
    :columns="4"
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/countries.json"
  />
  <VfCascadeSelect
    name="in"
    float-label="In Label"
    float="in"
    :columns="4"
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/countries.json"
  />
  <VfCascadeSelect
    name="on"
    float-label="On Label"
    float="on"
    :columns="4"
    option-label="cname"
    option-group-label="name"
    :option-group-children="['states', 'cities']"
    options="/data/countries.json"
  />
</VfGroup>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  over: {
    type: 'cascade-select',
    floatLabel: 'Over Label',
    columns: 4,
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
  },
  in: {
    type: 'cascade-select',
    floatLabel: 'In Label',
    float: 'in',
    columns: 4,
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
  },
  on: {
    type: 'cascade-select',
    floatLabel: 'On Label',
    float: 'on',
    columns: 4,
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

## IFTA Label

The `ifta` prop renders an in-field top-aligned label using PrimeVue's [IftaLabel](https://primevue.org/iftalabel/) component. The label stays visible at the top of the input at all times.

::: usage w-sm

```vue [Preview]
<VfCascadeSelect name="city" ifta="City" />
```

```vue [Template]
<VfCascadeSelect
  name="city"
  ifta="City"
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    ifta: 'City',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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

::: usage w-sm

```vue [Preview]
<VfCascadeSelect
  name="city"
  hint="Choose country and state to pick a city."
/>
```

```vue [Template]
<VfCascadeSelect
  name="city"
  label="City"
  placeholder="Select a city..."
  hint="Choose country and state to pick a city."
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'City',
    placeholder: 'Select a city...',
    hint: 'Choose country and state to pick a city.',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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

::: usage w-sm

```vue [Preview]
<VfCascadeSelect name="city" help="The city where your office is located." />
```

```vue [Template]
<VfCascadeSelect
  name="city"
  label="Office city"
  placeholder="Select a city..."
  help="The city where your office is located."
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'Office city',
    placeholder: 'Select a city...',
    help: 'The city where your office is located.',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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

::: usage w-sm

```vue [Preview]
<VfCascadeSelect
  name="city"
  label="Office city"
  info="Used to determine your local tax jurisdiction."
/>
```

```vue [Template]
<VfCascadeSelect
  name="city"
  label="Office city"
  placeholder="Select a city..."
  info="Used to determine your local tax jurisdiction."
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'Office city',
    placeholder: 'Select a city...',
    info: 'Used to determine your local tax jurisdiction.',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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
<VfCascadeSelect name="city" label="City" :columns="{ label: 4 }" />
```

```vue [Template]
<VfCascadeSelect
  name="city"
  label="City"
  placeholder="Select a city..."
  :columns="{ label: 4 }"
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'City',
    placeholder: 'Select a city...',
    columns: { label: 4 },
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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

::: usage validate w-sm

```vue [Preview]
<VfCascadeSelect name="city" rules="required" />
```

```vue [Template]
<VfCascadeSelect
  name="city"
  label="City"
  placeholder="Select a city..."
  rules="required"
  option-label="cname"
  option-group-label="name"
  :option-group-children="['states', 'cities']"
  options="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/primevue'

const schema = defineSchema({
  city: {
    type: 'cascade-select',
    label: 'City',
    placeholder: 'Select a city...',
    rules: 'required',
    optionLabel: 'cname',
    optionGroupLabel: 'name',
    optionGroupChildren: ['states', 'cities'],
    options: '/data/countries.json',
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
| [`type`](!code#props.type "string") | `'cascade-select'` | The element type identifier. |
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

### Input {#props-cascadeselect}

| Prop | Default | Description |
| --- | --- | --- |
| [`noExpressions`](!code#props.noExpressions "boolean") | `false` | Disables expression resolution for this element. Applies to the element itself only (container elements don't cascade it to their children), and a form-level `noExpressions` cannot be overridden by setting it to `false` here. |
| [`description`](!code#props.description "TProp<string, TContext>") | — | A description text displayed below the element. |
| [`defaultValue`](!code#props.defaultValue "T") | — | The default/initial value of the element. |
| [`sensitive`](!code#props.sensitive "boolean") | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored drafts. On a container, the whole subtree is excluded. |
| [`disabled`](!code#props.disabled "ConditionalProp<TContext>") | — | Whether the element is disabled. |
| [`headers`](!code#props.headers "Record<string, string>") | — | Custom HTTP headers to include when loading options from an endpoint. |
| [`method`](!code#props.method "string") | — | The HTTP method to use when loading options from an endpoint. Defaults to `'GET'`. |

### Options {#props-options}

| Prop | Default | Description |
| --- | --- | --- |
| [`options`](!code#props.options "MaybeRef<TOptions>") | — | The option items for the element. |
| [`optionLabel`](!code#props.optionLabel "OptionKeyProp<TOptions, TGroupChildren, string>") | — | Resolves the label for an option. A string key for property lookup, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionValue`](!code#props.optionValue "AllowsOptionKeyProps<TOptions> extends true ? \| (TOptionValueKey & AllowedOptionValueKey<TOptions, TGroupChildren>) \| AllowedOptionValueKey<TOptions, TGroupChildren> \| (( option: RawOptionOf<TOptions, TGroupChildren> ) => TOptionValueReturn) : never") | — | Resolves the value for an option. A string key for property lookup, or a function returning the value. Not allowed for plain scalar arrays or plain object/record maps.<br><br>Typed as `(TOptionValueKey & AllowedOptionValueKey) \| AllowedOptionValueKey<br><br>\| ((option) => TOptionValueReturn)` so:<br><br>- string keys infer into `TOptionValueKey` through the intersection, which also rejects keys missing from the option shape (the generic itself is only bounded by the simple `OptionValueProp`, so validation must happen here) - keys remain assignable on the defaulted `ElementSchema` / `FormSchema` surface where `TOptionValueKey` is still `undefined` - mapper return types infer into `TOptionValueReturn` - the `option` parameter stays concrete and is contextually typed even for bare inline arrows (whose return type cannot drive generics under Vue's single-pass inference — annotate the param or use a named function for full model inference) |
| [`optionDisabled`](!code#props.optionDisabled "OptionKeyProp<TOptions, TGroupChildren, ConditionalProp<TContext> \| undefined>") | — | Determines whether an option is disabled. A string key for property lookup, or a function returning a `ConditionalProp`. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionConditions`](!code#props.optionConditions "OptionKeyProp<TOptions, TGroupChildren, ConditionalProp<TContext> \| undefined>") | — | Determines whether an option is available. A string key for property lookup, or a function returning a `ConditionalProp`. Options whose conditions are not met are omitted from the list. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionGroupLabel`](!code#props.optionGroupLabel "OptionGroupKeyProp<TOptions, string>") | — | Resolves the label for an option group. A string key for property lookup on the group object, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionGroupChildren`](!code#props.optionGroupChildren "AllowsOptionKeyProps<TOptions> extends true ? \| (TGroupChildren & AllowedCascadeOptionGroupChildren<TOptions>) \| AllowedCascadeOptionGroupChildren<TOptions> : never") | — | Resolves nested children for each cascade level. Accepts a string key, a nested path array (e.g. `['states', 'cities']`), or a mapper function.<br><br>The intersection arm infers keys into `TGroupChildren` while rejecting keys missing from the group shape (the generic itself is only bounded by the simple `CascadeOptionGroupChildrenProp`). The bare `AllowedCascadeOptionGroupChildren` arm keeps keys assignable on the defaulted schema surface where `TGroupChildren` is still `undefined`. |
| [`optionGroupConditions`](!code#props.optionGroupConditions "OptionGroupKeyProp<TOptions, ConditionalProp<TContext> \| undefined>") | — | Determines whether an option group is available. A string key for property lookup on the group object, or a function returning a `ConditionalProp`. Groups whose conditions are not met are omitted entirely. Not allowed for plain scalar arrays or plain object/record maps. |
| [`optionsTrigger`](!code#props.optionsTrigger "ConditionsTriggerProp") | — | The source that triggers re-resolution of function-based options. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, function-based options are only re-resolved when the `options` prop reference itself changes. |
| [`optionsDebounce`](!code#props.optionsDebounce "number") | `300` | The debounce delay in milliseconds applied before re-resolving function-based options when the `optionsTrigger` source changes. Defaults to no debounce (immediate re-resolution). |
| [`transformOptions`](!code#props.transformOptions "(data: any) => any[] \| Record<string, any>") | — | Transforms data received from an endpoint into the options format. When `options` is a string (endpoint URL), the HTTP response data is passed through this function before normalization. |

### Data {#props-data}

| Prop | Default | Description |
| --- | --- | --- |
| [`modelValue`](!code#props.modelValue "T") | — | The current value of the element (v-model). |
| [`submit`](!code#props.submit "boolean") | `true` | Whether the element value is included in form submission data. |
| [`untrackOn`](!code#props.untrackOn "UntrackOnProp") | — | Controls when the element stops tracking user changes. |
| [`detached`](!code#props.detached "boolean") | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload "(value: any, context$: VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>) => any") | — | Transforms the element's value when submitting the form. |

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
| [`ariaLabel`](!code#props.ariaLabel "string \| undefined") | Establishes a string value that labels the component. |
| [`ariaLabelledby`](!code#props.ariaLabelledby "string \| undefined") | Establishes relationships between the component and label(s) where its value should be one or more element IDs. |
| [`autoOptionFocus`](!code#props.autoOptionFocus "boolean \| undefined") | Whether to focus on the first visible or selected element when the overlay panel is shown. |
| [`breakpoint`](!code#props.breakpoint "string \| undefined") | The breakpoint to define the maximum width boundary. |
| [`clearIcon`](!code#props.clearIcon "string \| undefined") | Icon to display in clear button. |
| [`dataKey`](!code#props.dataKey "string \| undefined") | A property to uniquely identify an option. |
| [`dropdownIcon`](!code#props.dropdownIcon "string \| undefined") | Icon to display in the dropdown. |
| [`dt`](!code#props.dt "DesignToken<any>") | It generates scoped CSS variables using design tokens for the component. |
| [`emptyMessage`](!code#props.emptyMessage "string \| undefined") | Text to be displayed when there are no options available. Defaults to value from PrimeVue locale configuration. |
| [`emptySearchMessage`](!code#props.emptySearchMessage "string \| undefined") | Text to display when filtering does not return any results. Defaults to value from PrimeVue locale configuration. |
| [`emptySelectionMessage`](!code#props.emptySelectionMessage "string \| undefined") | Text to be displayed in hidden accessible field when any option is not selected. Defaults to value from PrimeVue locale configuration. |
| [`focusOnHover`](!code#props.focusOnHover "boolean \| undefined") | When enabled, the focus is placed on the hovered option. |
| [`inputClass`](!code#props.inputClass "string \| object \| undefined") | Style class of the input field. |
| [`inputId`](!code#props.inputId "string \| undefined") | Identifier of the underlying input element. |
| [`inputProps`](!code#props.inputProps "InputHTMLAttributes \| undefined") | Used to pass all properties of the HTMLInputElement to the focusable input element inside the component. |
| [`inputStyle`](!code#props.inputStyle "object \| undefined") | Inline style of the input field. |
| [`loadingIcon`](!code#props.loadingIcon "string \| undefined") | Icon to display in loading state. |
| [`optionGroupIcon`](!code#props.optionGroupIcon "string \| undefined") | Icon to display in the option group. |
| [`overlayClass`](!code#props.overlayClass "string \| object \| undefined") | Style class of the overlay overlay. |
| [`overlayProps`](!code#props.overlayProps "HTMLAttributes \| undefined") | Used to pass all properties of the HTMLDivElement to the overlay overlay inside the component. |
| [`overlayStyle`](!code#props.overlayStyle "object \| undefined") | Inline style of the overlay overlay. |
| [`panelClass`](!code#props.panelClass "string \| object \| undefined") | Style class of the overlay overlay. |
| [`panelProps`](!code#props.panelProps "HTMLAttributes \| undefined") | Used to pass all properties of the HTMLDivElement to the overlay overlay inside the component. |
| [`panelStyle`](!code#props.panelStyle "object \| undefined") | Inline style of the overlay overlay. |
| [`pt`](!code#props.pt "PassThrough<CascadeSelectPassThroughOptions>") | Used to pass attributes to DOM elements inside the component. |
| [`ptOptions`](!code#props.ptOptions "PassThroughOptions") | Used to configure passthrough(pt) options of the component. |
| [`searchLocale`](!code#props.searchLocale "string \| undefined") | Locale to use in searching. The default locale is the host environment's current locale. |
| [`searchMessage`](!code#props.searchMessage "string \| undefined") | Text to be displayed in hidden accessible field when filtering returns any results. Defaults to value from PrimeVue locale configuration. |
| [`selectionMessage`](!code#props.selectionMessage "string \| undefined") | Text to be displayed in hidden accessible field when options are selected. Defaults to value from PrimeVue locale configuration. |
| [`selectOnFocus`](!code#props.selectOnFocus "boolean \| undefined") | When enabled, the focused option is selected/opened. |
| [`showClear`](!code#props.showClear "boolean \| undefined") | When enabled, a clear icon is displayed to clear the value. |
| [`size`](!code#props.size "HintedString<'small' \| 'large'> \| undefined") | Defines the size of the component. |
| [`tabindex`](!code#props.tabindex "number \| string \| undefined") | Index of the element in tabbing order. |
| [`unstyled`](!code#props.unstyled "boolean") | When enabled, it removes component related styles in the core. |
| [`variant`](!code#props.variant "HintedString<'outlined' \| 'filled'> \| undefined \| null") | Specifies the input variant of the component. |

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

### CascadeSelect {#section-cascadeselect}

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
| [`sensitivePaths`](!code#context.sensitivePaths "string[]") | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored drafts. |
| [`setInputRef()`](!code#context.setInputRef "(el: any) => void") | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `inputRef` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref. |
| [`canonicalDomValue`](!code#context.canonicalDomValue "boolean") | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value pickup and the DOM recovery listeners. |
| [`inputBindings`](!code#context.inputBindings "object") | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners. |
| [`componentBindings`](!code#context.componentBindings "object") | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur. |
| [`groups`](!code#context.groups "ResolvedGroup<any, Record<string, any>>[]") | Resolved option groups. Empty when not grouped — use `items` then. |
| [`rawItems`](!code#context.rawItems "any[]") | Library-friendly items for third-party components. Flat lists are the original raw objects (with `__disabled` injected when conditional disabled resolution is active). Grouped lists are the original group objects with children replaced by the filtered raw items. |
| [`resolvedItems`](!code#context.resolvedItems "ShallowRef<any[], any[]> \| ShallowRef<Record<string, any>, Record<string, any>>") | The raw items data before normalization (from props, endpoint, or function). |
| [`normalizedItems`](!code#context.normalizedItems "NormalizedItem[]") | All normalized items before conditional filtering, flattened across groups when grouped. |
| [`selectedLabel`](!code#context.selectedLabel "string \| string[] \| undefined") | The resolved label(s) of the currently selected item(s). Returns a single string for single-select, or an array of strings for multi-select. Returns `undefined` (single) or `[]` (multiple) when nothing is selected. |
| [`itemLabel`](!code#context.itemLabel "string \| ((item: any) => string)") | Label accessor to forward to third-party components. Always defined and always string-producing when the `itemLabel` prop is unset: the synthetic wrapper's `label` for synthetic items, the normalized-label fallback (JSON for plain objects) otherwise — mirroring what `resolveLabel` yields on the core-rendered path. |
| [`itemValue`](!code#context.itemValue "ComputedRef<string \| ((item: any) => any) \| undefined>") | Value accessor to forward to third-party components. Falls back to `'value'` for synthetic items. |
| [`itemDisabled`](!code#context.itemDisabled "ComputedRef<string \| ((item: any) => boolean) \| undefined>") | Disabled accessor to forward to third-party components. Points at `__disabled` when conditional resolution is required. |
| [`grouped`](!code#context.grouped "boolean") | Whether the items are grouped (a `groupLabel` or `groupChildren` prop is set). |
| [`resolving`](!code#context.resolving "ShallowRef<boolean, boolean>") | Whether the items are currently being loaded from an endpoint or an async function. |
| [`synthetic`](!code#context.synthetic "boolean") | Whether the resolved data uses synthetic `{ value, label }` items. True for plain object maps and arrays of primitives — cases where raw values are wrapped into `{ value, label }` objects. |
| [`resolveItems()`](!code#context.resolveItems "() => void") | Resolves the items source: fetches endpoint URLs, invokes functions (awaiting async results), and passes plain data through. |
| [`show()`](!code#context.show "(isFocus: boolean \| undefined) => void") | Shows the cascade-select overlay. |
| [`hide()`](!code#context.hide "(isFocus: boolean \| undefined) => void") | Hides the cascade-select overlay. |

### Data {#section-data}

| Name | Description |
| --- | --- |
| [`model`](!code#context.model "Record<string, any> \| any") | The element's reactive model value within the form data tree. |
| [`value`](!code#context.value "any") | The current language-aware value of the element. For translatable elements, returns the value for the active language. |
| [`payload`](!code#context.payload "object") | The element's submission payload. Container elements aggregate from children; leaf elements return their own value. |
| [`nullValue`](!code#context.nullValue "any") | The value the element holds when it is considered empty. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel "Record<string, any> \| any") | A snapshot of the model at initialization time, used for dirty checking and reset. |
| [`items`](!code#context.items "ResolvedItem<any, Record<string, any>>[]") | Resolved flat option items. Empty when grouped — use `groups` then. |
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

### Events {#section-events}

| Name | Description |
| --- | --- |
| [`fire()`](!code#context.fire "(e: string, ...args: any[]) => any") | Fires an event synchronously, invoking before, main, and after listeners in order. |
| [`fireAsync()`](!code#context.fireAsync "(e: string, ...args: any[]) => Promise<any>") | Fires an event asynchronously, awaiting each callback and short-circuiting when any returns `false`. |
| [`on()`](!code#context.on "(e: string, callback: (...args: any[]) => any) => void") | Subscribes a callback to a specific event. |
| [`off()`](!code#context.off "(e: string, callback: (...args: any[]) => any) => void") | Removes a previously registered event callback. |
| [`onBefore()`](!code#context.onBefore "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs before the main event listeners. |
| [`onAfter()`](!code#context.onAfter "(e: string, callback: (...args: any[]) => any) => void") | Registers a callback that runs after the main event listeners. |

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
| `show` | [`context$`](!code#events.show.context$ "VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>") | Callback to invoke when the overlay is shown. |
| `beforeShow` | [`context$`](!code#events.beforeShow.context$ "VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>") | Callback to invoke before the overlay is shown. |
| `hide` | [`context$`](!code#events.hide.context$ "VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>") | Callback to invoke when the overlay is hidden. |
| `beforeHide` | [`context$`](!code#events.beforeHide.context$ "VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>") | Callback to invoke before the overlay is hidden. |
| `change` | [`newValue`](!code#events.change.newValue "T"), [`oldValue`](!code#events.change.oldValue "T"), [`context$`](!code#events.change.context$ "TContext") | Emitted when the element value changes. |
| `valueChange` | [`value`](!code#events.valueChange.value "any"), [`context$`](!code#events.valueChange.context$ "VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>") | Emitted when the value changes in uncontrolled mode. |
| `groupChange` | [`event`](!code#events.groupChange.event "CascadeSelectGroupChangeEvent"), [`context$`](!code#events.groupChange.context$ "VfCascadeSelectContext<VfCascadeSelectProps<TOptions, TOptionValueKey, TGroupChildren, TModel, TOptionValueReturn>>") | Callback to invoke when a group changes. |
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
| `dropdownicon` | — | Custom dropdown icon template. |
| `clearicon` | [`clearCallback`](!code#slot.clearicon.clearCallback "(event: Event) => void") | Custom clear icon template. |
| `loadingicon` | — | Custom loading icon template. |
| `optiongroupicon` | [`class`](!code#slot.optiongroupicon.class "string") | Custom option group icon template. |
| `option` | [`option`](!code#slot.option.option "any") [`selected`](!code#slot.option.selected "boolean") | Custom content for each option. |
| `value` | [`value`](!code#slot.value.value "any") [`placeholder`](!code#slot.value.placeholder "string") | Custom value template. |
| `header` | [`value`](!code#slot.header.value "any") [`options`](!code#slot.header.options "any[]") | Custom header template. |
| `footer` | [`value`](!code#slot.footer.value "any") [`options`](!code#slot.footer.options "any[]") | Custom footer template. |
| `errors` | [`errors`](!code#slot.errors.errors "string[]") | Slot for customizing the validation errors display. |
| `messages` | [`messages`](!code#slot.messages.messages "string[]") | Slot for customizing the info messages display. |
<!-- @slots-end -->
<!-- @endtab -->

<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts component="VfCascadeSelect"
:examples="{
default: 'Default',
float: 'Float Label',
ifta: 'Ifta',
icons: 'Icons',
addons: 'Addons',
mix: 'Mix',
}"
:schema="{
label: 'Destination',
info: 'Select your arrival destination. This will help suggest appropriate routes and connections.',
help: 'Select a country, state, then city',
hint: 'This will be your arrival city',
rules: 'required',
showRequired: ['label'],
optionLabel: 'cname',
optionValue: 'code',
optionGroupLabel: 'name',
optionGroupChildren: ['states', 'cities'],
options: countries,
defaultValue: 'LAX',
onMounted: ({ messageBag }) => {
messageBag.append('No direct flights to this destination', 'error')
messageBag.append('Direct flights available', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfCascadeSelect
      name="default"
      v-bind="schema"
    />
</template>
<template #example-float="{ schema }">
<VfCascadeSelect
      name="float"
      v-bind="schema"
      float-label="Destination"
      float="on"
    />
</template>
<template #example-ifta="{ schema }">
<VfCascadeSelect
      name="ifta"
      v-bind="schema"
      ifta="Destination"
    />
</template>
<template #example-icons="{ schema }">
<VfCascadeSelect
      name="icons"
      v-bind="schema"
      icon-before="map-marker"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfCascadeSelect
      name="addons"
      v-bind="schema"
      addon-before="To"
      addon-after="Intl. Airport"
    />
</template>
<template #example-mix="{ schema }">
<VfCascadeSelect
      name="mix"
      v-bind="schema"
      addon-before="To"
      icon-after="globe"
      float-label="Destination"
      float="on"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->
### `panel`

The wrapper around `root` with `display: contents` when the element is a step or a tab.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<TabPanel>`](https://primevue.org/tabpanel/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-panel` |

### `root`

The element's root wrapper.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<fieldset>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` |

### `labelGroup`

The container holding the label and required indicator.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` `<legend>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label-group` |

### `label`

The label element, associated with the control via `for`.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` `<span>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-label` |

### `required`

The required indicator.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` [`<TabsProps>`](https://primevue.org/tabsprops/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element-group` |

### `elementWrapper`

The wrapper directly around the input control.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-element-wrapper` |

### `help`

The help text area.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-help` |

### `input`

The cascade-select input element.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<CascadeSelect>`](https://primevue.org/cascadeselect/) |

### `info`

Info container.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-info` |

### `infoIcon`

Icon for displaying info tooltip.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<span>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-info-icon` |

### `description`

The description text area.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-description` |

### `addonBefore`

An individual addon rendered before the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfAddon>`](./VfAddon.md) |

### `addonGroup`

The addon group wrapper element.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |

### `iconBefore`

The icon rendered before the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |

### `floatWrapper`

The PrimeVue FloatLabel wrapper around the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<FloatLabel>`](https://primevue.org/floatlabel/) |

### `float`

The label tag inside PrimeVue FloatLabel.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` |

### `iftaWrapper`

The PrimeVue IftaLabel wrapper around the input.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<IftaLabel>`](https://primevue.org/iftalabel/) |

### `ifta`

The label tag inside PrimeVue IftaLabel.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<label>` |

### `errors`

The validation errors container.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | [`<Message>`](https://primevue.org/message/) |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-errors` |

### `error`

An individual validation error.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-error` |

### `messages`

The info messages container.

|  |  |
| --- | --- |
| **Element** <a class="vp-info-hint" data-popover='[{"type":"text","content":"The HTML tag or Vue component rendered by this part."}]'></a> | `<div>` |
| **Classes** <a class="vp-info-hint" data-popover='[{"type":"text","content":"CSS classes applied to this part. A <code>?</code> suffix means the class is conditionally applied."}]'></a> | `.vf-messages` |

### `message`

An individual info message.

|  |  |
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
