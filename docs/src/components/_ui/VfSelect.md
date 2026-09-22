<script setup>
import { useHttp } from '@vueform/ui'

const $http = useHttp()
</script>

# VfSelect

<!-- @tabs -->

<!-- @tab Usage -->
<!-- #region usage -->
<!-- #region usage-basic -->

## Basic

A select input defined with `items` as a key-value object. Keys become the submitted values, values become the labels.

::: usage model

```vue [Preview]
<VfSelect
  name="country"
  label="Country"
  default="us"
  :items="{ us: 'United States', uk: 'United Kingdom', de: 'Germany' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    default: 'us',
    items: {
      us: 'United States',
      uk: 'United Kingdom',
      de: 'Germany',
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

<!-- #endregion usage-basic -->

<!-- #region usage-array -->

## Primitive Array

When `items` is a plain array, each value is used as both the label and the submitted value.

::: usage

```vue [Preview]
<VfSelect name="fruit" :items="['Apple', 'Banana', 'Cherry']" />
```

```vue [Template]
<VfSelect
  name="fruit"
  label="Fruit"
  default="Apple"
  :items="['Apple', 'Banana', 'Cherry']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  fruit: {
    type: 'select',
    label: 'Fruit',
    default: 'Apple',
    items: ['Apple', 'Banana', 'Cherry'],
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-array -->

<!-- #region usage-object-array -->

## Object Array

When `items` is an array of objects, use `itemLabel` to specify which property holds the display text. Without `itemValue`, the submitted value is the entire object.

::: usage model

```vue [Preview]
<VfSelect
  name="size"
  item-label="label"
  :items="[
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
  ]"
/>
```

```vue [Template]
<VfSelect
  name="size"
  label="Size"
  item-label="label"
  :default="{ value: 's', label: 'Small' }"
  :items="[
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  size: {
    type: 'select',
    label: 'Size',
    itemLabel: 'label',
    default: { value: 's', label: 'Small' },
    items: [
      { value: 's', label: 'Small' },
      { value: 'm', label: 'Medium' },
      { value: 'l', label: 'Large' },
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

Use `itemValue` to extract a specific property as the submitted value instead of the whole object:

::: usage model

```vue [Preview]
<VfSelect
  name="size"
  item-label="label"
  item-value="value"
  :items="[
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
  ]"
/>
```

```vue [Template]
<VfSelect
  name="size"
  label="Size"
  item-label="label"
  item-value="value"
  default="s"
  :items="[
    { value: 's', label: 'Small' },
    { value: 'm', label: 'Medium' },
    { value: 'l', label: 'Large' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  size: {
    type: 'select',
    label: 'Size',
    itemLabel: 'label',
    itemValue: 'value',
    default: 's',
    items: [
      { value: 's', label: 'Small' },
      { value: 'm', label: 'Medium' },
      { value: 'l', label: 'Large' },
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

<!-- #endregion usage-object-array -->

<!-- #region usage-async-function -->

## Async Function

The `items` prop accepts a function that returns a promise. Vueform handles the loading state automatically while the function resolves.

::: usage

```vue [Preview]
<VfSelect
  name="country"
  :items="async () => {
    const { data } = await $http.get(
      '/data/countries.json'
    )
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
  <VfSelect
    name="country"
    label="Country"
    placeholder="Select a country..."
    item-label="name"
    item-value="code"
    :items="async () => {
      const { data } = await $http.get(
        '/data/countries.json'
      )
      return data
    }"
  />
</template>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm, useHttp } from '@vueform/ui'

const $http = useHttp()

const items = async () => {
  const { data } = await $http.get('/data/countries.json')
  return data
}

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    placeholder: 'Select a country...',
    itemLabel: 'name',
    itemValue: 'code',
    items,
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

<!-- #region usage-endpoint -->

## Endpoint

The `items` prop also accepts a URL string. Vueform sends a request and uses the response as items. Use `transformItems` to reshape the response if the data isn't at the top level.

::: usage

```vue [Preview]
<VfSelect
  name="country"
  items="/data/countries.json"
/>
```

```vue [Template]
<VfSelect
  name="country"
  label="Country"
  placeholder="Select a country..."
  item-label="name"
  item-value="code"
  items="/data/countries.json"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    placeholder: 'Select a country...',
    itemLabel: 'name',
    itemValue: 'code',
    items: '/data/countries.json',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-endpoint -->

<!-- #region usage-disabled-items -->

## Disabled Items

The `itemDisabled` prop specifies which property on each item object determines whether it is disabled.

::: usage

```vue [Preview]
<VfSelect
  name="plan"
  item-disabled="disabled"
  :items="[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise', disabled: true },
  ]"
/>
```

```vue [Template]
<VfCheckbox name="premium" text="I have a premium account" />
<VfSelect
  name="plan"
  label="Plan"
  item-label="label"
  item-value="value"
  item-disabled="disabled"
  :items="[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    {
      value: 'enterprise',
      label: 'Enterprise',
      disabled: [['premium', '!=', true]],
    },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  premium: {
    type: 'checkbox',
    text: 'I have a premium account',
  },
  plan: {
    type: 'select',
    label: 'Plan',
    itemLabel: 'label',
    itemValue: 'value',
    itemDisabled: 'disabled',
    items: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      {
        value: 'enterprise',
        label: 'Enterprise',
        disabled: [['premium', '!=', true]],
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

<!-- #endregion usage-disabled-items -->

<!-- #region usage-conditional-items -->

## Conditional Items

The `itemConditions` prop specifies which property on each item object holds conditions that control its visibility. See [Conditions on Items](/guide/conditions#conditions-on-items) for the full syntax.

::: usage model

```vue [Preview]
<VfSelect
  name="tier"
  item-conditions="conditions"
  :items="[
    { value: 'basic', label: 'Basic' },
    {
      value: 'advanced',
      label: 'Advanced',
      conditions: [['premium', '==', true]],
    },
  ]"
/>
```

```vue [Template]
<VfCheckbox name="premium" text="I have a premium account" />
<VfSelect
  name="tier"
  label="Tier"
  item-label="label"
  item-value="value"
  item-conditions="conditions"
  :default="{ value: 'basic', label: 'Basic' }"
  :items="[
    { value: 'basic', label: 'Basic' },
    {
      value: 'advanced',
      label: 'Advanced',
      conditions: [['premium', '==', true]],
    },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  premium: {
    type: 'checkbox',
    text: 'I have a premium account',
  },
  tier: {
    type: 'select',
    label: 'Tier',
    itemLabel: 'label',
    itemValue: 'value',
    itemConditions: 'conditions',
    default: 'basic',
    items: [
      { value: 'basic', label: 'Basic' },
      {
        value: 'advanced',
        label: 'Advanced',
        conditions: [['premium', '==', true]],
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

<!-- #endregion usage-conditional-items -->

<!-- #region usage-groups -->

## Groups

The `groupLabel` and `groupChildren` props enable rendering items in labeled groups. Each group object holds a label and a nested list of items.

::: usage model

```vue [Preview]
<VfSelect
  name="font"
  group-label="category"
  group-children="fonts"
  :items="[
    {
      category: 'Serif',
      fonts: [
        { value: 'georgia', label: 'Georgia' },
        { value: 'times', label: 'Times New Roman' },
      ],
    },
    {
      category: 'Sans-Serif',
      fonts: [
        { value: 'arial', label: 'Arial' },
        { value: 'helvetica', label: 'Helvetica' },
      ],
    },
  ]"
/>
```

```vue [Template]
<VfSelect
  name="font"
  label="Font"
  placeholder="Select a font..."
  item-label="label"
  item-value="value"
  group-label="category"
  group-children="fonts"
  :items="[
    {
      category: 'Serif',
      fonts: [
        { value: 'georgia', label: 'Georgia' },
        { value: 'times', label: 'Times New Roman' },
      ],
    },
    {
      category: 'Sans-Serif',
      fonts: [
        { value: 'arial', label: 'Arial' },
        { value: 'helvetica', label: 'Helvetica' },
      ],
    },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  font: {
    type: 'select',
    label: 'Font',
    placeholder: 'Select a font...',
    itemLabel: 'label',
    itemValue: 'value',
    groupLabel: 'category',
    groupChildren: 'fonts',
    items: [
      {
        category: 'Serif',
        fonts: [
          { value: 'georgia', label: 'Georgia' },
          { value: 'times', label: 'Times New Roman' },
        ],
      },
      {
        category: 'Sans-Serif',
        fonts: [
          { value: 'arial', label: 'Arial' },
          { value: 'helvetica', label: 'Helvetica' },
        ],
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

<!-- #endregion usage-groups -->

<!-- #region usage-conditional-groups -->

## Conditional Groups

The `groupConditions` prop specifies which property on each group object holds conditions that control its visibility. Groups whose conditions are not met are hidden entirely. See [Conditions on Items](/guide/conditions#conditions-on-items) for the full syntax.

::: usage

```vue [Preview]
<VfSelect
  name="tool"
  group-conditions="conditions"
  :items="[
    {
      category: 'Archived',
      conditions: [['showArchived', '==', true]],
      tools: [
        { value: 'gulp', label: 'Gulp' },
        { value: 'grunt', label: 'Grunt' },
      ],
    },
    {
      category: 'Active',
      tools: [
        { value: 'vite', label: 'Vite' },
        { value: 'esbuild', label: 'ESBuild' },
      ],
    },
  ]"
/>
```

```vue [Template]
<VfCheckbox
  name="showArchived"
  text="Show archived tools"
/>
<VfSelect
  name="tool"
  label="Build tool"
  placeholder="Select a tool..."
  item-label="label"
  item-value="value"
  group-label="category"
  group-children="tools"
  group-conditions="conditions"
  :items="[
    {
      category: 'Archived',
      conditions: [['showArchived', '==', true]],
      tools: [
        { value: 'gulp', label: 'Gulp' },
        { value: 'grunt', label: 'Grunt' },
      ],
    },
    {
      category: 'Active',
      tools: [
        { value: 'vite', label: 'Vite' },
        { value: 'esbuild', label: 'ESBuild' },
      ],
    },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  showArchived: {
    type: 'checkbox',
    text: 'Show archived tools',
  },
  tool: {
    type: 'select',
    label: 'Build tool',
    placeholder: 'Select a tool...',
    itemLabel: 'label',
    itemValue: 'value',
    groupLabel: 'category',
    groupChildren: 'tools',
    groupConditions: 'conditions',
    items: [
      {
        category: 'Archived',
        conditions: [['showArchived', '==', true]],
        tools: [
          { value: 'gulp', label: 'Gulp' },
          { value: 'grunt', label: 'Grunt' },
        ],
      },
      {
        category: 'Active',
        tools: [
          { value: 'vite', label: 'Vite' },
          { value: 'esbuild', label: 'ESBuild' },
        ],
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

<!-- #endregion usage-conditional-groups -->

<!-- #region usage-multiple -->

## Multiple

The `multiple` prop allows selecting more than one option.

::: usage model

```vue [Preview]
<VfSelect name="languages" multiple />
```

```vue [Template]
<VfSelect
  name="languages"
  label="Languages"
  :items="{ en: 'English', fr: 'French', es: 'Spanish', de: 'German' }"
  multiple
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  languages: {
    type: 'select',
    label: 'Languages',
    items: {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
    },
    multiple: true,
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-multiple -->

<!-- #region usage-placeholder -->

## Placeholder

The `placeholder` prop displays hint text when no option is selected.

::: usage

```vue [Preview]
<VfSelect name="role" placeholder="Select a role" />
```

```vue [Template]
<VfSelect
  name="role"
  label="Role"
  placeholder="Select a role"
  :items="{ admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  role: {
    type: 'select',
    label: 'Role',
    placeholder: 'Select a role',
    items: {
      admin: 'Admin',
      editor: 'Editor',
      viewer: 'Viewer',
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

<!-- #endregion usage-placeholder -->

<!-- #region usage-icons -->

## Icons

The `iconBefore` and `iconAfter` props display [icons](/guide/element-layout#icons) inside the select. The icon class format can be [configured](/guide/configuration#icon) globally.

::: usage

```vue [Preview]
<VfSelect name="status" icon-before="{SELF('model.icon')}" />
<VfSelect name="language" icon-after="comment" />
```

```vue [Template]
<VfSelect
  name="status"
  label="Status"
  icon-before="{SELF('model.icon')}"
  item-label="label"
  :default="{ value: 'active', label: 'Active', icon: 'check' }"
  :items="[
    { value: 'active', label: 'Active', icon: 'check' },
    { value: 'inactive', label: 'Inactive', icon: 'times' },
    { value: 'pending', label: 'Pending', icon: 'hourglass' },
  ]"
/>
<VfSelect
  name="language"
  label="Language"
  icon-after="comment"
  default="en"
  :items="{ en: 'English', fr: 'French', de: 'German' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  status: {
    type: 'select',
    label: 'Status',
    iconBefore: '{SELF('model.icon')}',
    itemLabel: 'label',
    default: { value: 'active', label: 'Active', icon: 'check' },
    items: [
      { value: 'active', label: 'Active', icon: 'check' },
      { value: 'inactive', label: 'Inactive', icon: 'times' },
      { value: 'pending', label: 'Pending', icon: 'hourglass' },
    ],
  },
  language: {
    type: 'select',
    label: 'Language',
    iconAfter: 'comment',
    default: 'en',
    items: { en: 'English', fr: 'French', de: 'German' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-icons -->

<!-- #region usage-text-addons -->

## Text Addons

The `addonBefore` and `addonAfter` props render content alongside the select. When passed a string, it displays as a text addon. An array of strings renders multiple addons.

::: usage

```vue [Preview]
<VfSelect name="country" addon-before="{SELF('model.icon')}" />
<VfSelect name="discount" addon-after="%" />
<VfSelect name="region" :addon-before="['🌍', 'Zone']" />
```

```vue [Template]
<VfSelect
  name="country"
  label="Country"
  addon-before="{SELF('model.icon')}"
  item-label="label"
  :default="{ value: 'us', label: 'United States', icon: '🇺🇸' }"
  :items="[
    { value: 'us', label: 'United States', icon: '🇺🇸' },
    { value: 'uk', label: 'United Kingdom', icon: '🇬🇧' },
    { value: 'de', label: 'Germany', icon: '🇩🇪' },
  ]"
/>
<VfSelect
  name="discount"
  label="Discount"
  addon-after="%"
  default="25"
  :items="{ 25: '25', 50: '50', 75: '75' }"
/>
<VfSelect
  name="region"
  label="Region"
  :addon-before="['🌍', 'Zone']"
  default="eu"
  :items="{ eu: 'Europe', us: 'Americas', ap: 'Asia Pacific' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    addonBefore: '{SELF('model.icon')}',
    itemLabel: 'label',
    default: { value: 'us', label: 'United States', icon: '🇺🇸' },
    items: [
      { value: 'us', label: 'United States', icon: '🇺🇸' },
      { value: 'uk', label: 'United Kingdom', icon: '🇬🇧' },
      { value: 'de', label: 'Germany', icon: '🇩🇪' },
    ],
  },
  discount: {
    type: 'select',
    label: 'Discount',
    addonAfter: '%',
    default: '25',
    items: { 25: '25', 50: '50', 75: '75' },
  },
  region: {
    type: 'select',
    label: 'Region',
    addonBefore: ['🌍', 'Zone'],
    default: 'eu',
    items: { eu: 'Europe', us: 'Americas', ap: 'Asia Pacific' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-text-addons -->

<!-- #region usage-element-addons -->

## Element Addons

Addons can also be element schemas, allowing interactive controls like selects, buttons, checkboxes, or radios to be embedded alongside the select.

::: usage

```vue [Preview]
<VfSelect name="action" :addon-after="{
  name: 'run',
  type: 'button',
  text: 'Apply',
}" />

<VfSelect name="font" :addon-before="{
  name: 'bold',
  type: 'checkbox',
  text: 'Bold',
}" />

<VfSelect name="sort" :addon-after="[
  { name: 'asc', type: 'radio', text: '↑', radioName: 'order' },
  { name: 'desc', type: 'radio', text: '↓', radioName: 'order' }
]" />
```

```vue [Template]
<VfSelect
  name="action"
  label="Action"
  default="view"
  :items="{ view: 'View', edit: 'Edit', delete: 'Delete' }"
  :addon-after="{ name: 'run', type: 'button', text: 'Apply' }"
/>
<VfSelect
  name="font"
  label="Font"
  default="sans"
  :items="{ sans: 'Sans', serif: 'Serif', mono: 'Mono' }"
  :addon-before="{ name: 'bold', type: 'checkbox', text: 'Bold' }"
/>
<VfSelect
  name="sort"
  label="Sort"
  default="name"
  :items="{ name: 'Name', date: 'Date', size: 'Size' }"
  :addon-after="[
    { name: 'asc', type: 'radio', text: '↑', radioName: 'order' },
    { name: 'desc', type: 'radio', text: '↓', radioName: 'order' },
  ]"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  action: {
    type: 'select',
    label: 'Action',
    default: 'view',
    items: { view: 'View', edit: 'Edit', delete: 'Delete' },
    addonAfter: { name: 'run', type: 'button', text: 'Apply' },
  },
  font: {
    type: 'select',
    label: 'Font',
    default: 'sans',
    items: { sans: 'Sans', serif: 'Serif', mono: 'Mono' },
    addonBefore: { name: 'bold', type: 'checkbox', text: 'Bold' },
  },
  sort: {
    type: 'select',
    label: 'Sort',
    default: 'name',
    items: { name: 'Name', date: 'Date', size: 'Size' },
    addonAfter: [
      { name: 'asc', type: 'radio', text: '↑', radioName: 'order' },
      { name: 'desc', type: 'radio', text: '↓', radioName: 'order' },
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

<!-- #endregion usage-element-addons -->

<!-- #region usage-hint-text -->

## Hint Text

The `hint` prop displays advisory text below the input. Use it to provide contextual guidance to the user.

::: usage

```vue [Preview]
<VfSelect
  name="country"
  :items="{ us: 'United States', uk: 'United Kingdom', de: 'Germany' }"
  hint="Used for shipping and tax calculation."
/>
```

```vue [Template]
<VfSelect
  name="country"
  label="Country"
  :items="{ us: 'United States', uk: 'United Kingdom', de: 'Germany' }"
  hint="Used for shipping and tax calculation."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  country: {
    type: 'select',
    label: 'Country',
    items: {
      us: 'United States',
      uk: 'United Kingdom',
      de: 'Germany',
    },
    hint: 'Used for shipping and tax calculation.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-hint-text -->

<!-- #region usage-help-text -->

## Help Text

The `help` prop displays advisory text below the label. Unlike `hint` (which appears below the input), `help` is positioned directly under the label.

::: usage

```vue [Preview]
<VfSelect
  name="language"
  :items="{ en: 'English', fr: 'French', de: 'German' }"
  help="Choose the language for your dashboard."
/>
```

```vue [Template]
<VfSelect
  name="language"
  label="Language"
  :items="{ en: 'English', fr: 'French', de: 'German' }"
  help="Choose the language for your dashboard."
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  language: {
    type: 'select',
    label: 'Language',
    items: { en: 'English', fr: 'French', de: 'German' },
    help: 'Choose the language for your dashboard.',
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-help-text -->

<!-- #region usage-disabled -->

## Disabled

The `disabled` prop prevents all interaction. It also accepts [conditions](/guide/conditions#conditional-props).

::: usage

```vue [Preview]
<VfSelect name="locked" disabled />
```

```vue [Template]
<VfSelect
  name="locked"
  label="Locked"
  :items="{ a: 'Option A', b: 'Option B' }"
  default="a"
  disabled
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  locked: {
    type: 'select',
    label: 'Locked',
    items: {
      a: 'Option A',
      b: 'Option B',
    },
    default: 'a',
    disabled: true,
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

<!-- #region usage-horizontal-label -->

## Horizontal Label

The `columns` prop controls the responsive grid layout. Setting `columns.label` places the label and input side by side in a horizontal arrangement.

::: usage

```vue [Preview]
<VfSelect name="role" label="Role" :columns="{ label: 4 }" />
```

```vue [Template]
<VfSelect
  name="role"
  label="Role"
  placeholder="Select a role"
  :columns="{ label: 4 }"
  :items="{ admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  role: {
    type: 'select',
    label: 'Role',
    placeholder: 'Select a role',
    columns: { label: 4 },
    items: { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

<!-- #endregion usage-horizontal-label -->
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

| Prop                                             | Default    | Description                                                                                     |
| ------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------- |
| [`name`](!code#props.name 'ElementName')         | —          | **Required.** The element's unique identifier and path in the current level of form data model. |
| [`type`](!code#props.type 'string')              | `'select'` | The element type identifier.                                                                    |
| [`id`](!code#props.id 'TProp<string, TContext>') | —          | The HTML `id` attribute for the input element.                                                  |

### Input {#props-select}

| Prop                                                                                                                                                                                                                                                                     | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`description`](!code#props.description 'TProp<string, TContext>')                                                                                                                                                                                                       | —       | A description text displayed below the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [`sensitive`](!code#props.sensitive 'boolean')                                                                                                                                                                                                                           | `false` | Whether the element holds sensitive data (passwords, payment details, …). Sensitive values are excluded from locally stored autosave drafts. On a container, the whole subtree is excluded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| [`disabled`](!code#props.disabled 'ConditionalProp<TContext>')                                                                                                                                                                                                           | `false` | Whether the element is disabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [`items`](!code#props.items 'MaybeRef<TItems>')                                                                                                                                                                                                                          | —       | The option items for the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [`itemLabel`](!code#props.itemLabel 'ItemKeyProp<TItems, TGroupChildren, string>')                                                                                                                                                                                       | —       | Resolves the label for an item. A string key for property lookup, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| [`itemValue`](!code#props.itemValue 'AllowsItemKeyProps<TItems> extends true ? \| (TItemValueKey & AllowedItemValueKey<TItems, TGroupChildren>) \| AllowedItemValueKey<TItems, TGroupChildren> \| ((item: RawItemOf<TItems, TGroupChildren>) => TItemValueReturn) : never') | —       | Resolves the value for an item. A string key for property lookup, or a function returning the value. Not allowed for plain scalar arrays or plain object/record maps.<br><br>Typed as `(TItemValueKey & AllowedItemValueKey) \| AllowedItemValueKey \| ((item) => TItemValueReturn)` so:<br><br>- string keys infer into `TItemValueKey` through the intersection, which also rejects keys missing from the item shape (the generic itself is only bounded by the simple `ItemValueProp`, so validation must happen here) - keys remain assignable on the defaulted `ElementSchema` / `FormSchema` surface where `TItemValueKey` is still `undefined` - mapper return types infer into `TItemValueReturn` - the `item` parameter stays concrete and is contextually typed even for bare inline arrows (whose return type cannot drive generics under Vue's single-pass inference — annotate the param or use a named function for full model inference) |
| [`itemDisabled`](!code#props.itemDisabled 'ItemKeyProp<TItems, TGroupChildren, ConditionalProp<TContext> \| undefined>')                                                                                                                                                  | —       | Determines whether an item is disabled. A string key for property lookup, or a function returning a `ConditionalProp`. Not allowed for plain scalar arrays or plain object/record maps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| [`itemConditions`](!code#props.itemConditions 'ItemKeyProp<TItems, TGroupChildren, ConditionalProp<TContext> \| undefined>')                                                                                                                                              | —       | Determines whether an item is available. A string key for property lookup, or a function returning a `ConditionalProp`. Items whose conditions are not met are omitted from the list. Not allowed for plain scalar arrays or plain object/record maps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [`groupLabel`](!code#props.groupLabel 'GroupKeyProp<TItems, string>')                                                                                                                                                                                                    | —       | Resolves the label for a group. A string key for property lookup on the group object, or a function returning the label string. Not allowed for plain scalar arrays or plain object/record maps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [`groupChildren`](!code#props.groupChildren 'AllowsItemKeyProps<TItems> extends true ? \| (TGroupChildren & AllowedGroupChildren<TItems>) \| AllowedGroupChildren<TItems> : never')                                                                                        | —       | Resolves the children items for a group. A string key for property lookup on the group object, or a function returning the children in any `ItemsProp` format. Not allowed for plain scalar arrays or plain object/record maps.<br><br>The intersection arm infers keys into `TGroupChildren` while rejecting keys missing from the group shape (the generic itself is only bounded by the simple `GroupChildrenProp`). The bare `AllowedGroupChildren` arm keeps keys assignable on the defaulted `ElementSchema` / `FormSchema` surface where `TGroupChildren` is still `undefined`.                                                                                                                                                                                                                                                                                                                                                                  |
| [`groupConditions`](!code#props.groupConditions 'GroupKeyProp<TItems, ConditionalProp<TContext> \| undefined>')                                                                                                                                                           | —       | Determines whether a group is available. A string key for property lookup on the group object, or a function returning a `ConditionalProp`. Groups whose conditions are not met are omitted entirely. Not allowed for plain scalar arrays or plain object/record maps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [`headers`](!code#props.headers 'Record<string, string>')                                                                                                                                                                                                                | —       | Custom HTTP headers to include when loading items from an endpoint.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| [`method`](!code#props.method 'string')                                                                                                                                                                                                                                  | —       | The HTTP method to use when loading items from an endpoint. Defaults to `'GET'`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| [`itemsTrigger`](!code#props.itemsTrigger 'ConditionsTriggerProp<TContext>')                                                                                                                                                                                             | —       | The source that triggers re-resolution of function-based items. Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, function-based items are only re-resolved when the `items` prop reference itself changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| [`itemsDebounce`](!code#props.itemsDebounce 'number')                                                                                                                                                                                                                    | —       | The debounce delay in milliseconds applied before re-resolving function-based items when the `itemsTrigger` source changes. Defaults to no debounce (immediate re-resolution).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| [`transformItems`](!code#props.transformItems '(data: any) => any[] \| Record<string, any>')                                                                                                                                                                              | —       | Transforms data received from an endpoint into the items format. When `items` is a string (endpoint URL), the HTTP response data is passed through this function before normalization.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| [`multiple`](!code#props.multiple 'TMultiple \| boolean')                                                                                                                                                                                                                 | `false` | Whether to allow multiple selections.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Data {#props-data}

| Prop                                                                                                                                                                                           | Default | Description                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| [`modelValue`](!code#props.modelValue 'T')                                                                                                                                                     | —       | The current value of the element (v-model).                                                      |
| [`default`](!code#props.default 'T')                                                                                                                                                           | —       | The default/initial value of the element.                                                        |
| [`submit`](!code#props.submit 'boolean')                                                                                                                                                       | `true`  | Whether the element value is included in form submission data.                                   |
| [`untrackOn`](!code#props.untrackOn 'UntrackOnProp')                                                                                                                                           | —       | Controls when the element stops tracking user changes.                                           |
| [`detached`](!code#props.detached 'boolean')                                                                                                                                                   | `false` | Whether the element is detached from the form's element registry and data model (if applicable). |
| [`transformPayload`](!code#props.transformPayload '(value: any, context$: VfSelectContext<VfSelectProps<TItems, TItemValueKey, TGroupChildren, TMultiple, TModel, TItemValueReturn>>) => any') | —       | Transforms the element's value when submitting the form.                                         |

### Validation {#props-validation}

| Prop                                                                    | Default | Description                                                              |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| [`rules`](!code#props.rules 'RulesProp<TContext>')                      | —       | Validation rules to apply to the element.                                |
| [`validateOn`](!code#props.validateOn 'ElementValidateOnProp')          | —       | Controls when validation is triggered (e.g. on change, blur, or submit). |
| [`debounce`](!code#props.debounce 'number')                             | —       | Delay in milliseconds before processing input.                           |
| [`bail`](!code#props.bail 'boolean')                                    | `true`  | Whether to stop validation after the first failing rule.                 |
| [`ruleMessages`](!code#props.ruleMessages 'RuleMessagesProp<TContext>') | —       | Custom error messages keyed by validation rule name.                     |
| [`displayName`](!code#props.displayName 'TProp<string, TContext>')      | —       | The display name used in validation error messages.                      |
| [`maxErrors`](!code#props.maxErrors 'number')                           | `1`     | Maximum number of validation errors to display at once.                  |
| [`hideErrors`](!code#props.hideErrors 'boolean')                        | `false` | Whether to hide validation error messages.                               |
| [`showRequired`](!code#props.showRequired 'ShowRequiredProp')           | —       | Where to show required field indicators (e.g. label, placeholder).       |
| [`hoist`](!code#props.hoist 'boolean')                                  | `false` | Whether to push the element's errors to its nearest ancestor element.    |

### Conditions {#props-conditions}

| Prop                                                                                   | Default | Description                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`conditions`](!code#props.conditions 'ConditionalProp<TContext>')                     | —       | Conditions that control the element's visibility and availability.                                                                                                                                                                                                                                                                     |
| [`conditionsTrigger`](!code#props.conditionsTrigger 'ConditionsTriggerProp<TContext>') | —       | The source that triggers re-evaluation of this element's async conditional props (`conditions`, `disabled`, `readonly`, and validation rule conditions). Accepts an array of element paths whose values are watched, a `Ref`, or a function used as a watch getter. When omitted, any change in the form model re-triggers evaluation. |
| [`conditionsDebounce`](!code#props.conditionsDebounce 'number')                        | —       | The debounce delay in milliseconds applied before re-evaluating this element's async conditional props when the trigger source changes. Overrides the global `$conditions.debounce` config (default `300`).                                                                                                                            |

### Layout {#props-layout}

| Prop                                                               | Default | Description                                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`columns`](!code#props.columns 'ColumnsProp<TContext>')           | —       | Responsive grid column sizing for the element's layout.                                                                                                                                                       |
| [`layout`](!code#props.layout 'ComponentProp \| boolean')           | `true`  | Custom layout template for this element, `false` to render the element without any layout wrapper, or `true` (default) for normal layout.                                                                     |
| [`label`](!code#props.label 'TProp<string, TContext>')             | —       | The label displayed alongside the element.                                                                                                                                                                    |
| [`hideLabel`](!code#props.hideLabel 'boolean')                     | `false` | Whether to visually hide the element's label.                                                                                                                                                                 |
| [`page`](!code#props.page 'PageProp<TContext>')                    | —       | Page configuration for stepped/tabbed forms. Accepts a simple label or a metadata tuple with at least a `label` property.                                                                                     |
| [`help`](!code#props.help 'TProp<string, TContext>')               | —       | A help text displayed below the label.                                                                                                                                                                        |
| [`placeholder`](!code#props.placeholder 'TProp<string, TContext>') | —       | The placeholder text displayed when the element is empty.                                                                                                                                                     |
| [`addonBefore`](!code#props.addonBefore 'AddonProp<TContext>')     | —       | Content or schema rendered as addons before the input.                                                                                                                                                        |
| [`addonAfter`](!code#props.addonAfter 'AddonProp<TContext>')       | —       | Content or schema rendered as addons after the input.                                                                                                                                                         |
| [`iconBefore`](!code#props.iconBefore 'DProp<string, TContext>')   | —       | Icon displayed before the input.                                                                                                                                                                              |
| [`iconAfter`](!code#props.iconAfter 'DProp<string, TContext>')     | —       | Icon displayed after the input.                                                                                                                                                                               |
| [`loading`](!code#props.loading 'ConditionalProp<TContext>')       | —       | Whether the element is in loading state.                                                                                                                                                                      |
| [`spaceTop`](!code#props.spaceTop 'number')                        | —       | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, ....                                                                                   |
| [`spaceBottom`](!code#props.spaceBottom 'number')                  | —       | Adds vertical spacing (padding) above the element. The value maps to a spacing token (1-3): `1` = `var(--vf-space-1)`, ....                                                                                   |
| [`lineTop`](!code#props.lineTop 'boolean')                         | `false` | Renders a horizontal line (border) above the element.                                                                                                                                                         |
| [`lineBottom`](!code#props.lineBottom 'boolean')                   | `false` | Renders a horizontal line (border) below the element.                                                                                                                                                         |
| [`expressions`](!code#props.expressions 'ExpressionsProp')         | —       | Controls which props allow dynamic expression resolution. Set to `false` to disable all expression evaluation, `true` to enable for all expressionable props, or an array of prop keys to enable selectively. |

### Customization {#props-customization}

| Prop                                                      | Default | Description                                                                                                                         |
| --------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`parts`](!code#props.parts 'P')                          | —       | Custom DOM attribute overrides for the component's structural parts.                                                                |
| [`class`](!code#props.class 'ClassValue')                 | —       | CSS classes to apply to the component's root element.                                                                               |
| [`classes`](!code#props.classes 'C')                      | —       | Custom CSS class overrides for the component's structural parts.                                                                    |
| [`reclass`](!code#props.reclass 'C')                      | —       | CSS class overrides that replace (rather than merge with) default classes.                                                          |
| [`tokens`](!code#props.tokens 'ThemeTokens')              | —       | Token overrides applied to the element's CSS custom properties.                                                                     |
| [`slots`](!code#props.slots 'S')                          | —       | Custom Vue components to use for named slots. Every component resolves it through the standard outlets pipeline (see `useOutlets`). |
| [`presets`](!code#props.presets 'PresetsProp')            | —       | Named configuration presets to apply to the component.                                                                              |
| [`template`](!code#props.template 'ComponentProp \| null') | —       | A custom Vue component to use as the template instead of the default.                                                               |
| [`component`](!code#props.component 'ComponentProp')      | —       | A custom Vue component to render in the component's default slot.                                                                   |

### Accessibility {#props-accessibility}

| Prop                                  | Default | Description                        |
| ------------------------------------- | ------- | ---------------------------------- |
| [`aria`](!code#props.aria 'AriaProp') | —       | ARIA attributes for accessibility. |

<!-- @endcollapsible -->
<!-- @props-end -->

<!-- @props-adapter-start --><!-- @props-adapter-end -->

<!-- @endtab -->
<!-- @tab Context -->

## Context

Reactive properties and methods accessible on the component's [Context](/guide/context) object.

<!-- @collapsible -->
<!-- @context-start -->

### General {#section-general}

| Name                                    | Description                                                        |
| --------------------------------------- | ------------------------------------------------------------------ |
| [`type`](!code#context.type 'string')   | The element's type identifier (e.g. "text", "checkbox", "select"). |
| [`name`](!code#context.name 'string')   | The element's name as a string ref.                                |
| [`props`](!code#context.props 'object') | The resolved component props with defaults applied.                |

### Select {#section-select}

| Name                                                                                                                             | Description                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`description`](!code#context.description 'string \| (string & {}) \| undefined')                                                  | The resolved description text for the element.                                                                                                                                                                                                                                                                                                        |
| [`descriptionId`](!code#context.descriptionId 'string')                                                                          | The DOM id for the element's description text region.                                                                                                                                                                                                                                                                                                 |
| [`validation`](!code#context.validation 'ShallowReactive<Record<string, ValidationView>>')                                       |                                                                                                                                                                                                                                                                                                                                                       |
| [`validator`](!code#context.validator 'Validator')                                                                               |                                                                                                                                                                                                                                                                                                                                                       |
| [`shouldValidate`](!code#context.shouldValidate 'boolean')                                                                       |                                                                                                                                                                                                                                                                                                                                                       |
| [`onUserInput()`](!code#context.onUserInput '() => void')                                                                        |                                                                                                                                                                                                                                                                                                                                                       |
| [`isFlatContainer`](!code#context.isFlatContainer 'boolean')                                                                     | Whether the element's data is flattened into the parent container rather than nested under its own `name` key.                                                                                                                                                                                                                                        |
| [`containerModel`](!code#context.containerModel 'unknown')                                                                       | The model ref the element provides to its children via the container context. For flat containers this is the parent's model — children's data lives merged at the parent level, while the public `model` is a scoped projection. For every other element it is the element's own `model`.                                                            |
| [`handleModelUpdate()`](!code#context.handleModelUpdate '(data: Event) => void')                                                 | Handles a native input event and updates the model from the event target. Text and select inputs use `target.value`. Checkboxes and radios use the `checked` state with `trueValue` / `falseValue` when available.                                                                                                                                    |
| [`initValidation()`](!code#context.initValidation '() => void')                                                                  |                                                                                                                                                                                                                                                                                                                                                       |
| [`destroyValidation()`](!code#context.destroyValidation '() => void')                                                            |                                                                                                                                                                                                                                                                                                                                                       |
| [`rootModel`](!code#context.rootModel 'RootModel \| undefined')                                                                   | The root model backing the form when this element operates as the form root (adopting a `useModel` instance from `modelValue` or creating an internal store), `undefined` for every other element.                                                                                                                                                    |
| [`sensitivePaths`](!code#context.sensitivePaths 'string[]')                                                                      | Data paths holding sensitive data (`sensitive: true`) within this element's subtree — excluded from locally stored autosave drafts. A sensitive element marks its whole subtree; containers otherwise aggregate from children. Unavailable elements are included: their data may still linger in the model, and stripping an absent path is harmless. |
| [`groups`](!code#context.groups 'ResolvedGroup<any, Record<string, any>>[]')                                                     | Resolved option groups. Empty when not grouped — use `items` then.                                                                                                                                                                                                                                                                                    |
| [`rawItems`](!code#context.rawItems 'any[]')                                                                                     | Library-friendly items for third-party components. Flat lists are the original raw objects (with `__disabled` injected when conditional disabled resolution is active). Grouped lists are the original group objects with children replaced by the filtered raw items.                                                                                |
| [`resolvedItems`](!code#context.resolvedItems 'ShallowRef<any[], any[]> \| ShallowRef<Record<string, any>, Record<string, any>>') | The raw items data before normalization (from props, endpoint, or function).                                                                                                                                                                                                                                                                          |
| [`normalizedItems`](!code#context.normalizedItems 'NormalizedItem[]')                                                            |                                                                                                                                                                                                                                                                                                                                                       |
| [`selectedLabel`](!code#context.selectedLabel 'string \| string[] \| undefined')                                                   | The resolved label(s) of the currently selected item(s). Returns a single string for single-select, or an array of strings for multi-select. Returns `undefined` (single) or `[]` (multiple) when nothing is selected.                                                                                                                                |
| [`itemLabel`](!code#context.itemLabel 'ComputedRef<string \| ((item: any) => string) \| undefined>')                               | Label accessor to forward to third-party components. Falls back to `'label'` for synthetic items.                                                                                                                                                                                                                                                     |
| [`itemValue`](!code#context.itemValue 'ComputedRef<string \| ((item: any) => any) \| undefined>')                                  | Value accessor to forward to third-party components. Falls back to `'value'` for synthetic items.                                                                                                                                                                                                                                                     |
| [`itemDisabled`](!code#context.itemDisabled 'ComputedRef<string \| ((item: any) => boolean) \| undefined>')                        | Disabled accessor to forward to third-party components. Points at `__disabled` when conditional resolution is required.                                                                                                                                                                                                                               |
| [`grouped`](!code#context.grouped 'boolean')                                                                                     |                                                                                                                                                                                                                                                                                                                                                       |
| [`resolving`](!code#context.resolving 'ShallowRef<boolean, boolean>')                                                            | Whether the items are currently being loaded from an endpoint or an async function.                                                                                                                                                                                                                                                                   |
| [`synthetic`](!code#context.synthetic 'boolean')                                                                                 | Whether the resolved data uses synthetic `{ value, label }` items. True for plain object maps and arrays of primitives — cases where raw values are wrapped into `{ value, label }` objects.                                                                                                                                                          |
| [`resolveItems()`](!code#context.resolveItems '() => void')                                                                      | Resolves the items source: fetches endpoint URLs, invokes functions (awaiting async results), and passes plain data through.                                                                                                                                                                                                                          |
| [`setInputRef()`](!code#context.setInputRef '(el: any) => void')                                                                 | Registers the underlying input element. Bind it as a function ref in custom templates and slots (`:ref="context.setInputRef"`) — the context members are read-only there, so `input` can't be assigned directly. Receives the element (or component instance) on mount and `null` on unmount, like any function ref.                                  |
| [`canonicalDomValue`](!code#context.canonicalDomValue 'boolean')                                                                 | Whether the registered input's DOM value is the model's own serialization (see `MakeInputConfig`). Gates both `handleInput`'s event-value adoption and the DOM recovery listeners.                                                                                                                                                                    |
| [`inputBindings`](!code#context.inputBindings 'object')                                                                          | Spreadable bindings for a native text-like input rendered without `v-model`: `v-bind="context.inputBindings"` wires the ref, the user-input report (which also performs the write — the DOM recovery and write-back watchers complete the two-way sync), and the interaction listeners.                                                               |
| [`componentBindings`](!code#context.componentBindings 'object')                                                                  | Spreadable bindings for a component input rendered without `v-model`: `v-bind="context.componentBindings"` wires `modelValue`, the `update:modelValue` handler (write + user-input report), and the interaction listeners for components that emit focus / blur.                                                                                      |

### Data {#section-data}

| Name                                                                      | Description                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`model`](!code#context.model 'Record<string, any> \| any')                | The element's reactive model value within the form data tree.                                                                                                                                                                     |
| [`value`](!code#context.value 'any')                                      | The current language-aware value of the element. For translatable elements, returns the value for the active language.                                                                                                            |
| [`payload`](!code#context.payload 'object')                               | The element's submission payload. For isContainer.value containers, aggregates from children. For leaf elements, returns own value.                                                                                               |
| [`nullValue`](!code#context.nullValue 'any')                              | The value the element holds when it is considered empty. Determined by `nullValue` / `falseValue` props, element type (container, multiple), and translatable state. For translatable elements a per-language object is returned. |
| [`initialModel`](!code#context.initialModel 'Record<string, any> \| any')  | A snapshot of the model at initialization time, used for dirty checking and reset.                                                                                                                                                |
| [`items`](!code#context.items 'ResolvedItem<any, Record<string, any>>[]') | Resolved flat option items. Empty when grouped — use `groups` then.                                                                                                                                                               |
| [`dataPath`](!code#context.dataPath 'string')                             | The dot-notation path to this element's value within the form data object (e.g. `"address.city"`). Empty string for the root model. Flat containers inherit their parent's data path.                                             |
| [`tracking`](!code#context.tracking 'boolean')                            | Whether the element's `default` expression is currently tracked and auto-updating the value.                                                                                                                                      |
| [`update()`](!code#context.update '(data: any) => void')                  | Updates the element's model value. For isContainer.value containers, performs a deep merge. For leaf elements, sets the value directly and invalidates validation.                                                                |
| [`load()`](!code#context.load '(data: any) => void')                      | Loads data into the element and fires the `load` event, cascading to all children so expression tracking can be stopped per-element.                                                                                              |
| [`reset()`](!code#context.reset '() => void')                             | Resets the element to its initial model state and fires the `reset` event. For isContainer.value containers, delegates to children or resets the model directly for dynamic lists.                                                |
| [`clear()`](!code#context.clear '() => void')                             | Clears the element to its null value and fires the `clear` event. For isContainer.value containers, delegates to children or clears the model for dynamic lists.                                                                  |
| [`track()`](!code#context.track '() => void')                             | Resumes expression tracking after an untrack, immediately re-writing the resolved value.                                                                                                                                          |
| [`untrack()`](!code#context.untrack '() => void')                         | Stops expression tracking, leaving the current value in place.                                                                                                                                                                    |
| [`reinit()`](!code#context.reinit '() => void')                           | Reinitializes the element by rebuilding both its model registration and validation instances.                                                                                                                                     |

### State {#section-state}

| Name                                                     | Description                                                                                                                                                                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`visible`](!code#context.visible 'boolean')             | Whether the element is currently visible, based on availability, container visibility, and pager state.                                                                                                                                                |
| [`available`](!code#context.available 'boolean')         | Whether the element is available (not hidden by conditional logic).                                                                                                                                                                                    |
| [`disabled`](!code#context.disabled 'boolean')           | Whether the element is currently disabled, considering form state, parent container state, local override, and the disabled prop. The prop is evaluated through the conditions pipeline, so sync and async conditional values are supported uniformly. |
| [`focused`](!code#context.focused 'boolean')             | Whether the element is currently focused.                                                                                                                                                                                                              |
| [`touched`](!code#context.touched 'boolean')             | Whether the element has been touched (blurred) by the user.                                                                                                                                                                                            |
| [`visited`](!code#context.visited 'boolean')             | Whether the element has been visited (focused) by the user.                                                                                                                                                                                            |
| [`dirty`](!code#context.dirty 'boolean')                 | Whether the current model value differs from the initial model value.                                                                                                                                                                                  |
| [`loading`](!code#context.loading 'boolean')             | Whether the element is in a loading state, true when pending, explicitly set to loading, or resolved via conditions.                                                                                                                                   |
| [`empty`](!code#context.empty 'boolean')                 | Whether the element's current value is empty. For isContainer.value containers, checks whether all children are empty. For leaf elements, checks whether the value is blank or equals the falseValue.                                                  |
| [`busy`](!code#context.busy 'boolean')                   | Whether the element is busy, meaning it is either debouncing or has pending async validation.                                                                                                                                                          |
| [`hoisted`](!code#context.hoisted 'boolean \| undefined') | Whether this element pushes its errors to its nearest ancestor element instead of displaying and reporting them itself.                                                                                                                                |
| [`enable()`](!code#context.enable '() => void')          | Programmatically enables the element.                                                                                                                                                                                                                  |
| [`disable()`](!code#context.disable '() => void')        | Programmatically disables the element.                                                                                                                                                                                                                 |

### Validation {#section-validation}

| Name                                                                                                                                 | Description                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`invalid`](!code#context.invalid 'boolean')                                                                                         | Whether any of the element's validations (across all languages) are currently invalid, including children.                                                                                                                                                                                                                            |
| [`validated`](!code#context.validated 'boolean')                                                                                     | Whether all of the element's validations (across all languages) have been executed, including children.                                                                                                                                                                                                                               |
| [`completed`](!code#context.completed 'boolean')                                                                                     | Whether the element is completed, meaning it either has no rules or has been validated without errors.                                                                                                                                                                                                                                |
| [`success`](!code#context.success 'boolean')                                                                                         |                                                                                                                                                                                                                                                                                                                                       |
| [`pending`](!code#context.pending 'boolean')                                                                                         | Whether any of the element's validations are currently pending an async check, including children.                                                                                                                                                                                                                                    |
| [`debouncing`](!code#context.debouncing 'boolean')                                                                                   | Whether any of the element's validations are currently debouncing, including children.                                                                                                                                                                                                                                                |
| [`errors`](!code#context.errors 'any[]')                                                                                             | All error messages for this element: its own plus any pushed up by hoisted children.                                                                                                                                                                                                                                                  |
| [`hasError`](!code#context.hasError 'boolean')                                                                                       | Whether the element has any active error messages.                                                                                                                                                                                                                                                                                    |
| [`displayErrors`](!code#context.displayErrors 'any[]')                                                                               | The error messages rendered for this element. Empty when the element pushes its errors to its parent; otherwise errors capped by `maxErrors`.                                                                                                                                                                                         |
| [`ownErrors`](!code#context.ownErrors 'string[]')                                                                                    | The element's own error messages across all languages (validation rules plus custom message bag entries).                                                                                                                                                                                                                             |
| [`formErrors`](!code#context.formErrors 'object')                                                                                    | Error messages propagated to the form, keyed by element path. Empty when the element pushes its errors to its parent.                                                                                                                                                                                                                 |
| [`messages`](!code#context.messages 'string[]')                                                                                      | The list of custom messages from the message bag, including messages from hoisted children.                                                                                                                                                                                                                                           |
| [`messageBag`](!code#context.messageBag 'MessageBagInstance')                                                                        | The element's message bag for managing custom errors, messages, and prepended/appended messages.                                                                                                                                                                                                                                      |
| [`required`](!code#context.required 'boolean')                                                                                       |                                                                                                                                                                                                                                                                                                                                       |
| [`genericName`](!code#context.genericName 'string')                                                                                  | A human-readable name resolved from displayName, label, floating, placeholder, or the element's name prop.                                                                                                                                                                                                                            |
| [`validate()`](!code#context.validate '(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>')                 | Runs validation on the element's own rules and all children, returning whether everything is valid. Elements already validated without errors against their current value are skipped unless `force: true` re-runs everything — for rules whose outcome can change without the value changing (async server checks, date boundaries). |
| [`validateSelf()`](!code#context.validateSelf '() => Promise<boolean>')                                                              |                                                                                                                                                                                                                                                                                                                                       |
| [`validateChildren()`](!code#context.validateChildren '(options: { force?: boolean \| undefined; } \| undefined) => Promise<boolean>') | Validates stateful children, returning whether all are valid. By default only incomplete children run — never-validated, stale, or invalid ones; children validated without errors against their current value keep their result. `force: true` runs every child regardless of prior results.                                         |
| [`invalidate()`](!code#context.invalidate '() => void')                                                                              | Marks all validation instances as invalidated, requiring revalidation. For isContainer.value containers, also delegates to children.                                                                                                                                                                                                  |
| [`unvalidate()`](!code#context.unvalidate '() => void')                                                                              | Resets all validation state. For isContainer.value containers, also delegates to children.                                                                                                                                                                                                                                            |
| [`filled()`](!code#context.filled '(value: any) => boolean')                                                                         | Checks whether a value is considered filled. For isContainer.value containers, delegates to children. For leaf elements, checks the scalar value.                                                                                                                                                                                     |
| [`clean()`](!code#context.clean '() => void')                                                                                        | Marks the element as clean by updating the initial model snapshot. For isContainer.value containers, delegates to children.                                                                                                                                                                                                           |
| [`clearErrors()`](!code#context.clearErrors '() => void')                                                                            | Clears all error messages from the message bag.                                                                                                                                                                                                                                                                                       |
| [`clearMessages()`](!code#context.clearMessages '() => void')                                                                        | Clears all custom messages from the message bag.                                                                                                                                                                                                                                                                                      |
| [`clearMessageBag()`](!code#context.clearMessageBag '() => void')                                                                    | Clears the entire message bag, removing both errors and messages.                                                                                                                                                                                                                                                                     |

### Layout {#section-layout}

| Name                                                                                                                                  | Description                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| [`input`](!code#context.input 'any')                                                                                                  | Ref to the underlying input element.                                                                                                          |
| [`id`](!code#context.id 'string')                                                                                                     | The resolved element id, using the id prop or falling back to the auto-generated uid.                                                         |
| [`label`](!code#context.label 'string \| undefined')                                                                                   | The resolved label text for the element.                                                                                                      |
| [`help`](!code#context.help 'string')                                                                                                 | The resolved help text for the element.                                                                                                       |
| [`placeholder`](!code#context.placeholder 'string \| (string & {}) \| undefined')                                                       | The resolved placeholder text, supporting static strings and dynamic text props.                                                              |
| [`page`](!code#context.page 'PageProp \| undefined')                                                                                   | Page metadata for stepped/tabbed forms.                                                                                                       |
| [`addonable`](!code#context.addonable 'true')                                                                                         | Whether this element supports before/after addons.                                                                                            |
| [`addonsBefore`](!code#context.addonsBefore 'AddonItem[]')                                                                            | Array of resolved before-addons, each an individual `AddonItem` for `VfAddon`.                                                                |
| [`addonsAfter`](!code#context.addonsAfter 'AddonItem[]')                                                                              | Array of resolved after-addons, each an individual `AddonItem` for `VfAddon`.                                                                 |
| [`iconBefore`](!code#context.iconBefore 'string \| undefined')                                                                         | The resolved CSS class string for the icon displayed before the input.                                                                        |
| [`iconAfter`](!code#context.iconAfter 'string \| undefined')                                                                           | The resolved CSS class string for the icon displayed after the input.                                                                         |
| [`classes`](!code#context.classes 'object')                                                                                           | The resolved CSS class map for the component.                                                                                                 |
| [`parts`](!code#context.parts 'object')                                                                                               | The resolved DOM attribute overrides for internal elements.                                                                                   |
| [`viewLoaded`](!code#context.viewLoaded 'boolean')                                                                                    | Whether the element's view has been loaded (used for lazy rendering optimization).                                                            |
| [`$el`](!code#context.$el 'HTMLElement \| null')                                                                                       | Reference to the component's root DOM element.                                                                                                |
| [`resolvedColumns`](!code#context.resolvedColumns 'object')                                                                           | Resolved column sizes per breakpoint, normalized into container/label/wrapper/group values.                                                   |
| [`updateColumns()`](!code#context.updateColumns '(v: any) => any')                                                                    | Updates the column configuration programmatically.                                                                                            |
| [`scrollTo()`](!code#context.scrollTo '(options: ScrollIntoViewOptions \| undefined, force: boolean \| undefined) => Promise<boolean>') | Scrolls the window to this element. If the element belongs to a step or tab, that page is selected first before scrolling.                    |
| [`focus()`](!code#context.focus '(scroll: boolean \| undefined) => Promise<boolean>')                                                  | Focuses the first focusable HTML element (input, select, textarea, button, etc.) within the wrapper. Optionally scrolls to the element first. |

### Tree {#section-tree}

| Name                                                                                          | Description                                                                                  |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`form$`](!code#context.form$ 'VfFormContext<EntryProps<Record<string, any>>> \| undefined')   | The parent form's context, providing access to form-level state and methods.                 |
| [`path`](!code#context.path 'string')                                                         | The element's dot-notation path in the form tree (e.g. "user.name").                         |
| [`componentName`](!code#context.componentName 'keyof ComponentRegistry<Record<string, any>>') | The resolved Vue component name for this element.                                            |
| [`container`](!code#context.container 'ContainerContext \| undefined')                         | The container context providing path, model, and registration methods for child elements.    |
| [`children`](!code#context.children 'VueformChildren')                                        | The child element registry providing registration, unregistration, and reactive child lists. |

### Handlers {#section-handlers}

| Name                                                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`handleInput()`](!code#context.handleInput '(payload: any, e: Event \| undefined) => void') | Handles a user-initiated change end to end. Bind it to the one event that means "the user changed it": `@input` for native text inputs, `@change` for native checkbox / radio / select / file controls, `@update:model-value` for components — alongside `v-model`, or without it. Accepts the new value or the native event carrying it (an event's value is read the way `v-model` reads it); a plain value may pass the originating event as the second argument so composition filtering still applies. Events fired during an IME composition session are ignored — the composed text arrives once, when the session ends. The value is written to the model only when the model doesn't hold it yet — with `v-model` in place this is a pure user-input notification, without it `handleInput` performs the write itself. Values resolved from native events are only adopted while `canonicalDomValue` is on; on formatted inputs (masks) the event carries display text, so only the notification fires, with the current model value as the payload. Either way it reports the input: fires the `input` event with `(value, event, context$)` and triggers `validateOn` / expression untracking. It does **not** touch the interaction states — `visited` and `touched` come from `handleFocus` / `handleBlur`. |
| [`handleBlur()`](!code#context.handleBlur '(e: Event) => void')                             | Fires the blur event on the element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| [`handleFocus()`](!code#context.handleFocus '(e: Event) => void')                           | Handles focus by setting the focused state and firing the focus event.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

### Accessibility {#section-a11y}

| Name                                        | Description                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [`uid`](!code#context.uid 'string')         | A unique auto-generated identifier for the element.                                                                                         |
| [`aria`](!code#context.aria 'object')       | Computed ARIA attributes (describedby, labelledby, invalid, required, busy) derived from element state and props, keyed by aria attr names. |
| [`helpId`](!code#context.helpId 'string')   | The DOM id for the element's help text region.                                                                                              |
| [`errorId`](!code#context.errorId 'string') | The DOM id for the element's error message region.                                                                                          |
| [`labelId`](!code#context.labelId 'string') | The DOM id for the element's label region.                                                                                                  |

<!-- @context-end -->

<!-- @endcollapsible -->
<!-- @endtab -->
<!-- @tab Events -->

## Events

Events emitted by the component. See [Events](/guide/events) for details.

<!-- @events-start -->

| Name                | Params                                                                                                                                                | Description                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `change`            | [`newValue`](!code#events.change.newValue 'T'), [`oldValue`](!code#events.change.oldValue 'T'), [`context$`](!code#events.change.context$ 'TContext') | Emitted when the element value changes.                                            |
| `update:modelValue` | [`value`](!code#events.update:modelValue.value 'T')                                                                                                   | Emitted to update the v-model binding.                                             |
| `load`              | [`value`](!code#events.load.value 'T'), [`context$`](!code#events.load.context$ 'TContext')                                                           | Emitted when the element's value is loaded programmatically via the `load` method. |
| `reset`             | [`context$`](!code#events.reset.context$ 'TContext')                                                                                                  | Emitted when the element is reset to its default value.                            |
| `clear`             | [`context$`](!code#events.clear.context$ 'TContext')                                                                                                  | Emitted when the element's value is cleared.                                       |
| `invalid`           | [`context$`](!code#events.invalid.context$ 'TContext')                                                                                                | Emitted when the element becomes invalid.                                          |
| `valid`             | [`context$`](!code#events.valid.context$ 'TContext')                                                                                                  | Emitted when the element becomes valid after having been invalid.                  |
| `input`             | [`value`](!code#events.input.value 'V'), [`e`](!code#events.input.e 'Event \| undefined'), [`context$`](!code#events.input.context$ 'TContext')        | Emitted when the input value is changed via the UI by the user.                    |
| `focus`             | [`context$`](!code#events.focus.context$ 'TContext')                                                                                                  | Emitted when the element receives focus.                                           |
| `blur`              | [`context$`](!code#events.blur.context$ 'TContext')                                                                                                   | Emitted when the element loses focus.                                              |
| `beforeMount`       | [`context$`](!code#events.beforeMount.context$ 'TContext')                                                                                            | Emitted before the component is mounted.                                           |
| `mounted`           | [`context$`](!code#events.mounted.context$ 'TContext')                                                                                                | Emitted after the component is mounted.                                            |
| `beforeUnmount`     | [`context$`](!code#events.beforeUnmount.context$ 'TContext')                                                                                          | Emitted before the component is unmounted.                                         |
| `unmounted`         | [`context$`](!code#events.unmounted.context$ 'TContext')                                                                                              | Emitted after the component is unmounted.                                          |
| `updated`           | [`context$`](!code#events.updated.context$ 'TContext')                                                                                                | Emitted after the component is updated.                                            |

<!-- @events-end -->

<!-- @endtab -->
<!-- @tab Slots -->

## Slots

Named [Slots](/guide/slots) for replacing parts of the component's rendering.

<!-- @slots-start -->

| Name          | Scope                                                                       | Description                                                                                                        |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `template`    | [`context`](!code#slot.template.context 'TContext')                         | Slot that replaces the entire component rendering. Receives the full component context as a single `context` prop. |
| `label`       | [`label`](!code#slot.label.label 'string')                                  | Slot for customizing the element's label content.                                                                  |
| `required`    | —                                                                           | Slot for customizing the required indicator.                                                                       |
| `help`        | [`help`](!code#slot.help.help 'string')                                     | Slot for customizing the help text.                                                                                |
| `option`      | [`item`](!code#slot.option.item 'ResolvedItem<TValue, TRaw>')               | Slot that replaces the label of each native option.                                                                |
| `addonBefore` | [`addonBefore`](!code#slot.addonBefore.addonBefore 'AddonProp \| undefined') | Slot that replaces the before-addons section.                                                                      |
| `addonAfter`  | [`addonAfter`](!code#slot.addonAfter.addonAfter 'AddonProp \| undefined')    | Slot that replaces the after-addons section.                                                                       |
| `iconBefore`  | [`iconBefore`](!code#slot.iconBefore.iconBefore 'string \| undefined')       | Slot that replaces the icon rendered before the input.                                                             |
| `iconAfter`   | [`iconAfter`](!code#slot.iconAfter.iconAfter 'string \| undefined')          | Slot that replaces the icon rendered after the input.                                                              |
| `description` | [`description`](!code#slot.description.description 'string')                | Slot for customizing the description text.                                                                         |
| `errors`      | [`errors`](!code#slot.errors.errors 'string[]')                             | Slot for customizing the validation errors display.                                                                |
| `messages`    | [`messages`](!code#slot.messages.messages 'string[]')                       | Slot for customizing the info messages display.                                                                    |

<!-- @slots-end -->

<!-- @endtab -->
<!-- @tab Parts -->

## Parts

DOM attribute overrides targeting internal elements. See [Parts](/guide/parts) for details.

<!-- #region viewer -->

<VPParts
component="VfSelect"
:examples="{
default: 'Default',
icons: 'With Icons',
addons: 'With Addons',
}"
:schema="{
label: 'Country',
help: 'Used for shipping and tax calculation',
hint: 'Select your country of residence',
rules: 'required',
default: 'us',
items: { us: 'United States', gb: 'United Kingdom', de: 'Germany' },
showRequired: ['label'],
onMounted: ({ messageBag }) => {
messageBag.append('Country is required', 'error')
messageBag.append('Country updated', 'message')
},
}"
>

<template #example-default="{ schema }">
<VfSelect
      name="default"
      v-bind="schema"
    />
</template>
<template #example-icons="{ schema }">
<VfSelect
      name="icons"
      v-bind="schema"
      icon-before="globe"
      icon-after="check"
    />
</template>
<template #example-addons="{ schema }">
<VfSelect
      name="addons"
      v-bind="schema"
      addon-before="Region:"
      addon-after="*"
    />
</template>
</VPParts>
<!-- #endregion viewer -->

<!-- @parts-start -->

### `panel`

The wrapper around `root` with `display: contents` when the element is a step or a tab.

|             |             |
| ----------- | ----------- |
| **Element** | `<div>`     |
| **Classes** | `.vf-panel` |

### `root`

The element's root wrapper.

|             |                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Element** | `<div>` `<fieldset>`                                                                                                                                                                                        |
| **Classes** | `.vf-element` `.vf-space-top-1?` `.vf-space-top-2?` `.vf-space-top-3?` `.vf-space-bottom-1?` `.vf-space-bottom-2?` `.vf-space-bottom-3?` `.vf-line-top?` `.vf-line-bottom?` `.vf-select` `.vf-align-label?` |

### `labelGroup`

The container holding the label and required indicator.

|             |                                                                               |
| ----------- | ----------------------------------------------------------------------------- |
| **Element** | `<div>`                                                                       |
| **Classes** | `.vf-label-group` `.vf-h1?` `.vf-h2?` `.vf-h3?` `.vf-h4?` `.vf-h5?` `.vf-h6?` |

### `label`

The label element.

|             |                                                              |
| ----------- | ------------------------------------------------------------ |
| **Element** | `<label>` `<span>` `<h1>` `<h2>` `<h3>` `<h4>` `<h5>` `<h6>` |
| **Classes** | `.vf-label`                                                  |

### `required`

The required indicator.

|             |                |
| ----------- | -------------- |
| **Element** | `<div>`        |
| **Classes** | `.vf-required` |

### `elementGroup`

The container wrapping the input and related UI.

|             |                     |
| ----------- | ------------------- |
| **Element** | `<div>`             |
| **Classes** | `.vf-element-group` |

### `elementWrapper`

The wrapper directly around the input control.

|             |                       |
| ----------- | --------------------- |
| **Element** | `<div>`               |
| **Classes** | `.vf-element-wrapper` |

### `help`

The help text area.

|             |            |
| ----------- | ---------- |
| **Element** | `<div>`    |
| **Classes** | `.vf-help` |

### `addonGroup`

The addon group wrapper element.

|             |                   |
| ----------- | ----------------- |
| **Element** | `<div>`           |
| **Classes** | `.vf-addon-group` |

### `input`

The select input element.

|             |                                                                 |
| ----------- | --------------------------------------------------------------- |
| **Element** | `<select>`                                                      |
| **Classes** | `.vf-input` `.vf-select-input` `.vf-placeholder?` `.vf-danger?` |

### `addonBefore`

An individual addon rendered before the input.

|             |                             |
| ----------- | --------------------------- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `addonAfter`

An individual addon rendered after the input.

|             |                             |
| ----------- | --------------------------- |
| **Element** | [`<VfAddon>`](./VfAddon.md) |

### `iconBefore`

The icon rendered before the input.

|             |                           |
| ----------- | ------------------------- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconAfter`

The icon rendered after the input.

|             |                           |
| ----------- | ------------------------- |
| **Element** | [`<VfIcon>`](./VfIcon.md) |

### `iconGroup`

The wrapper element grouping icons and the input.

|             |                  |
| ----------- | ---------------- |
| **Element** | `<div>`          |
| **Classes** | `.vf-icon-group` |

### `description`

The description text area.

|             |                   |
| ----------- | ----------------- |
| **Element** | `<div>`           |
| **Classes** | `.vf-description` |

### `errors`

The validation errors container.

|             |              |
| ----------- | ------------ |
| **Element** | `<div>`      |
| **Classes** | `.vf-errors` |

### `error`

An individual validation error.

|             |             |
| ----------- | ----------- |
| **Element** | `<div>`     |
| **Classes** | `.vf-error` |

### `messages`

The info messages container.

|             |                |
| ----------- | -------------- |
| **Element** | `<div>`        |
| **Classes** | `.vf-messages` |

### `message`

An individual info message.

|             |               |
| ----------- | ------------- |
| **Element** | `<div>`       |
| **Classes** | `.vf-message` |

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
  --vf-input-color: var(--vf-gray-800);
  --vf-input-color-danger: var(--vf-gray-800);
  --vf-input-color-disabled: var(--vf-text-disabled);

  --vf-input-ring-color: var(--vf-brand);
  --vf-input-ring-color-danger: var(--vf-brand);
  --vf-input-ring-offset: -1px;
  --vf-input-ring-shadow: none;
  --vf-input-ring-shadow-danger: none;
  --vf-input-ring-style: solid;
  --vf-input-ring-width: 1px;

  --vf-input-bg: var(--vf-white);
  --vf-input-bg-danger: var(--vf-white);
  --vf-input-bg-disabled: var(--vf-bg-disabled);

  --vf-input-border-color: var(--vf-gray-300);
  --vf-input-border-color-danger: var(--vf-gray-300);
  --vf-input-border-color-disabled: var(--vf-border-disabled);
  --vf-input-border-style: solid;
  --vf-input-border-width-b: var(--vf-border-width-b);
  --vf-input-border-width-l: var(--vf-border-width-l);
  --vf-input-border-width-r: var(--vf-border-width-r);
  --vf-input-border-width-t: var(--vf-border-width-t);
  --vf-input-radius: var(--vf-radius);

  --vf-input-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);

  --vf-input-pb: var(--vf-py);
  --vf-input-pl: var(--vf-px);
  --vf-input-pr: var(--vf-px);
  --vf-input-pt: var(--vf-py);

  --vf-select-icon-height: 0.625rem;
  --vf-select-icon-width: 0.5rem;

  --vf-select-icon-caret: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12' fill='none' stroke='%234b5563' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 4.5L5 1l4 3.5'/%3E%3Cpath d='M1 7.5L5 11l4-3.5'/%3E%3C/svg%3E");

  --vf-select-placeholder-color: var(--vf-gray-500);

  --vf-icon-group-width: 2.5rem;

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
  inputColor: '$gray800',
  inputColorDanger: '$gray800',
  inputColorDisabled: '$textDisabled',

  inputRingColor: '$brand',
  inputRingColorDanger: '$brand',
  inputRingOffset: '-1px',
  inputRingShadow: 'none',
  inputRingShadowDanger: 'none',
  inputRingStyle: 'solid',
  inputRingWidth: '1px',

  inputBg: '$white',
  inputBgDanger: '$white',
  inputBgDisabled: '$bgDisabled',

  inputBorderColor: '$gray300',
  inputBorderColorDanger: '$gray300',
  inputBorderColorDisabled: '$borderDisabled',
  inputBorderStyle: 'solid',
  inputBorderWidthB: '$borderWidthB',
  inputBorderWidthL: '$borderWidthL',
  inputBorderWidthR: '$borderWidthR',
  inputBorderWidthT: '$borderWidthT',
  inputRadius: '$radius',

  inputShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0)',

  inputPb: '$py',
  inputPl: '$px',
  inputPr: '$px',
  inputPt: '$py',

  selectIconHeight: '0.625rem',
  selectIconWidth: '0.5rem',

  selectIconCaret: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 12' fill='none' stroke='%234b5563' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M1 4.5L5 1l4 3.5'/%3E%3Cpath d='M1 7.5L5 11l4-3.5'/%3E%3C/svg%3E\")",

  selectPlaceholderColor: '$gray500',

  iconGroupWidth: '2.5rem',

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
