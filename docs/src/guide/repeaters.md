---
outline: [2,3]
---

# Repeaters

Some parts of a form repeat: contact lists, invoice line items, team members, tags. The user decides how many there are — adding, removing, and reordering entries at runtime. Vueform's repeater is `VfList`: you describe **one row**, and the list turns it into as many rows as the data needs, with add and remove controls built in.

This chapter walks through defining row content, shaping the data model, controlling the built-in buttons, drag-and-drop sorting, and the patterns that build on top — validation, per-row conditions, and nested repeaters.

## Basic Usage

A list needs a `schema` describing the elements of each row — the same element definitions you'd use inside a `VfGroup` or a `!VfForm`:

::: usage model

```vue [Preview]
<VfList
  name="contacts"
  label="Contacts"
  :schema="{
    name: { type: 'text', placeholder: 'Name' },
    email: { type: 'text', placeholder: 'Email' },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    schema: {
      name: { type: 'text', placeholder: 'Name' },
      email: { type: 'text', placeholder: 'Email' },
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

The list starts with one row, renders an **add** button below the rows, and a **remove** button next to each one. Internally each row is wrapped in a nested `VfGroup`, so the model is an **array of objects**: `[{ name: null, email: null }]` — add a row and the array grows, remove one and it shrinks.

## Defining Rows in the Template

In template syntax the row can be defined with the `#default` slot instead of the `schema` prop. The slot provides an `index`, and passing it as the child's `name` is what maps each row to its position in the array. For multi-element rows, wrap the elements in a `VfGroup` with `nested` and give the **group** the index as its name:

::: usage

```vue [Preview]
<VfList name="team" label="Team members">
  <template #default="{ index }">
    <VfGroup :name="index" nested>
      <VfText name="name" placeholder="Name" />
      <VfText name="role" placeholder="Role" />
    </VfGroup>
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'

const CustomRow = defineSlot('VfList.default', {
  props: ['index'],
  setup: (props) => {
    const VfGroup = resolveComponent('VfGroup')
    const VfText = resolveComponent('VfText')

    return () => h(VfGroup, { name: props.index, nested: true }, () => [
      h(VfText, { name: 'name', placeholder: 'Name' }),
      h(VfText, { name: 'role', placeholder: 'Role' }),
    ])
  },
})

const schema = defineSchema({
  team: {
    type: 'list',
    label: 'Team members',
    slots: {
      default: CustomRow,
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

::: warning
Only **one** direct child element is allowed inside the slot — for multiple elements, use a single nested `VfGroup` as shown. A single-element row can skip the wrapper entirely — see [Flat Lists](#flat-lists).
:::

## Flat Lists

When each row is a **single value** — a tag, a URL, a task — an array of objects is more structure than the data deserves. The `flat` prop collapses each row's object into the value itself, producing a plain array:

::: usage model

```vue [Preview]
<VfList
  name="without_flat"
  label="Without flat"
  :schema="{ tag: { type: 'text', placeholder: 'Tag' } }"
/>
<VfList
  name="with_flat"
  label="With flat"
  flat
  :schema="{ tag: { type: 'text', placeholder: 'Tag' } }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  without_flat: {
    type: 'list',
    label: 'Without flat',
    schema: {
      tag: { type: 'text', placeholder: 'Tag' },
    },
  },
  with_flat: {
    type: 'list',
    label: 'With flat',
    flat: true, // [!code highlight]
    schema: {
      tag: { type: 'text', placeholder: 'Tag' },
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

The form data for the example above is `{ without_flat: [{ tag: null }], with_flat: [null] }` — with `flat`, each new row contributes the inner element's value directly to the array.

::: warning
`flat` requires the list schema to contain exactly one element. With multiple elements the list warns and falls back to the default nested behavior.
:::

In template syntax, the same flat shape happens naturally: place a single element directly in the `#default` slot — no `VfGroup` wrapper — with `index` as its `name`:

::: usage model

```vue [Preview]
<VfList name="tags" label="Tags">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Tag" />
  </template>
</VfList>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  tags: {
    type: 'list',
    label: 'Tags',
    flat: true,
    schema: {
      tag: { type: 'text', placeholder: 'Tag' },
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

## Wrapped Rows

Rows render without decoration by default. Set the `wrap` prop to put each row in a visual container — border, background, padding — which helps multi-field rows read as units:

::: usage

```vue [Preview]
<VfList
  name="contacts"
  label="Contacts"
  wrap
  :schema="{
    name: { type: 'text', placeholder: 'Name' },
    email: { type: 'text', placeholder: 'Email' },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    wrap: true, // [!code highlight]
    schema: {
      name: { type: 'text', placeholder: 'Name' },
      email: { type: 'text', placeholder: 'Email' },
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

The container's look comes from the same `groupWrapped*` theming tokens as [Wrapped Groups](/guide/form-structure#wrapped-groups) — customize border, background, padding, and radius there.

## Initial Rows

The `initial` prop sets how many rows the list starts with. The default is `1`:

::: usage

```vue [Preview]
<VfList
  name="items"
  label="Items"
  :initial="3"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  items: {
    type: 'list',
    label: 'Items',
    initial: 3, // [!code highlight]
    schema: {
      name: { type: 'text', placeholder: 'Name' },
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

### Empty Lists

With `:initial="0"` the list starts empty — and an empty list is a blank space unless you say what belongs there. The `placeholder` prop renders a styled message whenever the list has no rows (whether it started empty or the user removed them all):

::: usage

```vue [Preview]
<VfList
  name="items"
  label="Items"
  :initial="0"
  placeholder="No items added yet. Click the button below to add one."
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  items: {
    type: 'list',
    label: 'Items',
    initial: 0,
    placeholder: 'No items added yet. Click the button below to add one.', // [!code highlight]
    schema: {
      name: { type: 'text', placeholder: 'Name' },
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

`placeholder` is a `TextProp` — a plain string, a locale map, or a function. For a fully custom empty state, the `#placeholder` slot **replaces** the placeholder element; it receives the part's resolved `bindings` — the default styling class, the `status` role, and the `id` the add button's `aria-describedby` points at — if you'd rather extend than replace:

```vue
<VfList name="items" label="Items" :initial="0">
  <template #placeholder="{ bindings }">
    <div v-bind="bindings">
      📋 Your list is empty — add an item to get started.
    </div>
  </template>
  <template #default="{ index }">
    <VfText :name="index" placeholder="Name" />
  </template>
</VfList>
```

## Pre-filling Data

`VfList` has no `default` prop — `default` belongs to input elements. To start a list with data, pass `modelValue`:

::: usage model

```vue [Preview]
<VfList
  name="tags"
  label="Tags"
  flat
  :schema="{ tag: { type: 'text', placeholder: 'Tag' } }"
  :model-value="['Vue', 'React', 'Angular']"
/>
```

```vue [Template]
<VfList name="tags" label="Tags"
  :model-value="['Vue', 'React', 'Angular']"
>
  <template #default="{ index }">
    <VfText :name="index" placeholder="Tag" />
  </template>
</VfList>
```

```vue [Live]
<VfList
  name="tags"
  label="Tags"
  flat
  :schema="{ tag: { type: 'text', placeholder: 'Tag' } }"
  :model-value="['Vue', 'React', 'Angular']"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  tags: {
    type: 'list',
    label: 'Tags',
    flat: true,
    schema: { tag: { type: 'text', placeholder: 'Tag' } },
    modelValue: ['Vue', 'React', 'Angular'], // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

Used this way, `modelValue` is a **one-time seed**, not a binding: it provides the rows when the list mounts, and afterwards neither direction syncs. When the form (or the list) is bound with `v-model`, the initial rows come from the bound data instead and `modelValue` isn't needed — see [Model](/guide/model).

## Adding and Removing Rows

The built-in controls are configurable from every angle.

### Row Limits

`min` and `max` constrain the row count. At `max`, the add button disappears; at `min`, the remove buttons do:

::: usage

```vue [Preview]
<VfList
  name="items"
  label="Items"
  :initial="2"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
  :min="1"
  :max="3"
/>
```

```vue [Template]
<VfList name="items" label="Items" :initial="2" :min="1" :max="3">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Name" />
  </template>
</VfList>
```

```vue [Live]
<VfList
  name="items"
  label="Items"
  :initial="2"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
  :min="1"
  :max="3"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  items: {
    type: 'list',
    label: 'Items',
    initial: 2,
    min: 1, // [!code highlight]
    max: 3, // [!code highlight]
    schema: { name: { type: 'text', placeholder: 'Name' } },
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

### Button Labels and Icons

The add and remove buttons render as icons by default. `addLabel` and `removeLabel` give them text — both `TextProp`s, so they localize:

::: usage

```vue [Preview]
<VfList
  name="items"
  label="Items"
  add-label="Add item"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
/>
```

```vue [Template]
<VfList name="items" label="Items" add-label="Add item">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Name" />
  </template>
</VfList>
```

```vue [Live]
<VfList
  name="items"
  label="Items"
  add-label="Add item"
  :schema="{ name: { type: 'text', placeholder: 'Name' } }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  items: {
    type: 'list',
    label: 'Items',
    addLabel: 'Add item', // [!code highlight]
    schema: {
      name: { type: 'text', placeholder: 'Name' },
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

The icons themselves are swappable too, via `addIcon`, `removeIcon`, and `sortIcon`.

### Disabling Controls

Each control can be turned off on its own, or the whole list disabled:

- `add: false` — hides the add button; removal and sorting still work.
- `remove: false` — hides the remove buttons; adding and sorting still work.
- `disabled` — prevents adding, removing, and sorting altogether. Accepts a boolean or a [conditional value](/guide/conditions#conditional-props) for dynamic disabling.

::: code-group

```ts [Schema]
defineSchema({
  items: {
    type: 'list',
    label: 'Items',
    add: false, // [!code highlight]
    remove: false, // [!code highlight]
    // disabled: true,
    schema: {
      name: { type: 'text', placeholder: 'Name' },
    },
  },
})
```

```vue [Template]
<VfList name="items" label="Items" :add="false" :remove="false">
  <template #default="{ index }">
    <VfText :name="index" placeholder="Name" />
  </template>
</VfList>
```

:::

## Sorting

The `sort` prop enables drag-and-drop reordering — each row gets a drag handle the user can grab:

::: usage

```vue [Preview]
<VfList
  name="tasks"
  label="Tasks"
  sort
  flat
  :model-value="['Buy groceries', 'Walk the dog', 'Write docs']"
  :schema="{ task: { type: 'text', placeholder: 'Task' } }"
/>
```

```vue [Template]
<VfList
  name="tasks"
  label="Tasks"
  sort
  :model-value="['Buy groceries', 'Walk the dog', 'Write docs']"
>
  <template #default="{ index }">
    <VfText :name="index" placeholder="Task" />
  </template>
</VfList>
```

```vue [Live]
<VfList
  name="tasks"
  label="Tasks"
  sort
  flat
  :model-value="['Buy groceries', 'Walk the dog', 'Write docs']"
  :schema="{ task: { type: 'text', placeholder: 'Task' } }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  tasks: {
    type: 'list',
    label: 'Tasks',
    flat: true,
    sort: true, // [!code highlight]
    schema: {
      task: { type: 'text', placeholder: 'Task' },
    },
    modelValue: [
      'Buy groceries',
      'Walk the dog',
      'Write docs',
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

Reordering moves the underlying data with the row. Sorting combines freely with the other options — multi-field rows, `wrap`, `min`/`max` — the handle simply appears alongside each row.

## Validation

Rules apply at two levels. Rules on the **list itself** validate the array — for instance requiring at least two entries:

```ts
defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    rules: 'required|min:2', // [!code highlight]
    schema: {
      name: { type: 'text', placeholder: 'Name' },
      email: { type: 'text', placeholder: 'Email' },
    },
  },
})
```

Rules on the **row elements** validate each row independently — every row checks its own fields, and errors render inside the row they belong to:

::: usage validate

```vue [Preview]
<VfList
  name="contacts"
  label="Contacts"
  :schema="{
    name: { type: 'text', placeholder: 'Name', rules: 'required' },
    email: { type: 'text', placeholder: 'Email', rules: 'required|email' },
  }"
/>
```

```vue [Template]
<VfList name="contacts" label="Contacts">
  <template #default="{ index }">
    <VfGroup :name="index" nested>
      <VfText name="name" placeholder="Name"
        rules="required"
      />
      <VfText name="email" placeholder="Email"
        rules="required|email"
      />
    </VfGroup>
  </template>
</VfList>
```

```vue [Live]
<VfList
  name="contacts"
  label="Contacts"
  :schema="{
    name: { type: 'text', placeholder: 'Name', rules: 'required' },
    email: { type: 'text', placeholder: 'Email', rules: 'required|email' },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    schema: {
      name: { type: 'text', placeholder: 'Name',
        rules: 'required', // [!code highlight]
      },
      email: { type: 'text', placeholder: 'Email',
        rules: 'required|email', // [!code highlight]
      },
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

The list's `invalid` state aggregates its children — if any row has an error, the list is invalid. See [Validation](/guide/validation) for rules, messages, and triggers.

## Conditions Inside Rows

Elements inside a list can have [Conditions](/guide/conditions) referencing their **own row** via the `*` wildcard, which resolves to the current row's index at evaluation time:

::: usage

```vue [Preview]
<VfList
  name="contacts"
  label="Contacts"
  :schema="{
    type: {
      type: 'radios',
      items: { email: 'Email', phone: 'Phone' },
      default: 'email',
    },
    email: {
      type: 'text',
      placeholder: 'Email',
      conditions: [['contacts.*.type', '==', 'email']],
    },
    phone: {
      type: 'text',
      placeholder: 'Phone',
      conditions: [['contacts.*.type', '==', 'phone']],
    },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  contacts: {
    type: 'list',
    label: 'Contacts',
    schema: {
      type: {
        type: 'radios',
        items: { email: 'Email', phone: 'Phone' },
        default: 'email',
      },
      email: { type: 'text', placeholder: 'Email',
        conditions: [['contacts.*.type', '==', 'email']], // [!code highlight]
      },
      phone: { type: 'text', placeholder: 'Phone',
        conditions: [['contacts.*.type', '==', 'phone']], // [!code highlight]
      },
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

Each row evaluates its conditions against its own values — switching one row's radio doesn't affect the others. See [Wildcard Paths](/guide/conditions#wildcard-paths) for the full syntax.

## Nesting Lists

Lists nest inside other lists for multi-level repeating structures. Each inner list is a complete `VfList` with its own add, remove, and sort controls:

::: usage model

```vue [Preview]
<VfList
  name="categories"
  label="Categories"
  wrap
  :schema="{
    name: { type: 'text', placeholder: 'Category name' },
    tasks: {
      type: 'list',
      label: 'Tasks',
      schema: {
        task: { type: 'text', placeholder: 'Task' },
      },
    },
  }"
/>
```

```vue [Template]
<VfList name="categories" label="Categories" wrap>
  <template #default="{ index }">
    <VfGroup :name="index" nested>
      <VfText name="name" placeholder="Category name" />
      <VfList name="tasks" label="Tasks">
        <template #default="{ index: taskIndex }">
          <VfText :name="taskIndex" placeholder="Task" />
        </template>
      </VfList>
    </VfGroup>
  </template>
</VfList>
```

```vue [Live]
<VfList
  name="categories"
  label="Categories"
  wrap
  :schema="{
    name: { type: 'text', placeholder: 'Category name' },
    tasks: {
      type: 'list',
      label: 'Tasks',
      schema: {
        task: { type: 'text', placeholder: 'Task' },
      },
    },
  }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  categories: {
    type: 'list',
    label: 'Categories',
    wrap: true,
    schema: {
      name: { type: 'text', placeholder: 'Category name' },
      tasks: {
        type: 'list',
        label: 'Tasks',
        schema: {
          task: { type: 'text', placeholder: 'Task' },
        },
      },
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

The model follows the nesting: an array of objects, each with a `name` and its own `tasks` array.

## Customizing Controls

Beyond labels and icons, every piece of the list UI has a slot: `#add` and `#remove` replace the buttons (receiving `handleAdd` / `handleRemove` to call), `#sort` replaces the drag handle, `#item` takes over an entire row including its controls, and `#placeholder` the empty state. See [VfList](/components/VfList) for the slot props and part structure, and [Slots](/guide/slots) for passing slots in schemas.

## Matrix Repeater

When repeating rows should line up under **shared column headers** — line items, order tables, structured data entry — `VfMatrix` can be the better repeater. In its dynamic mode (when `rows` is a number or omitted), users add and remove rows just like in a list, but the layout is a labeled grid:

::: usage model

```vue [Preview]
<VfMatrix
  name="line_items"
  :rows="2"
  :min="1"
  :max="5"
  :cols="{ item: 'Item', qty: 'Qty', price: 'Price' }"
/>
```

```vue [Template]
<VfForm>
  <VfMatrix
    name="line_items"
    :rows="2"
    :min="1"
    :max="5"
    :cols="{
      item: 'Item',
      qty: 'Qty',
      price: 'Price',
    }"
  />
</VfForm>
```

```vue [Live]
<VfMatrix
  name="line_items"
  :rows="2"
  :min="1"
  :max="5"
  :cols="{ item: 'Item', qty: 'Qty', price: 'Price' }"
/>
```

```vue [Schema]
<script setup lang="ts">
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  line_items: {
    type: 'matrix',
    rows: 2,
    min: 1,
    max: 5,
    cols: {
      item: 'Item',
      qty: 'Qty',
      price: 'Price',
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

The dynamic matrix supports `min` / `max`, `addLabel` / `removeLabel`, drag-and-drop `sort`, per-column cell types, and the `tabular` table styling — the matrix itself is introduced in [Matrix Layout](/guide/form-structure#matrix-layout), and [VfMatrix](/components/VfMatrix) documents every option.

Rule of thumb: reach for `VfList` when each row is a little form of its own; reach for `VfMatrix` when the rows are records in a table.
