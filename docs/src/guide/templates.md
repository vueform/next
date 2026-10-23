---
outline: [2,3]
---

# Templates

Every Vueform component renders through a single, replaceable template. Filling it hands you the component's entire markup, while its logic — model, validation, conditions, events, accessibility state — keeps running underneath. The template receives the component's context, the same object event handlers get as `context$`, and that context is the whole contract between your markup and the component.

## The `#template` Slot

The quickest route is the inline `#template` [slot](/guide/slots#template-slots), which receives one slot prop — the component's [context](/guide/context):

```vue
<template>
  <VfText name="email" label="Email">
    <template #template="{ context }">
      <input
        :class="context.classes.input"
        v-bind="context.bindings.input()"
        :value="context.value"
        @input="context.handleInput"
      />
    </template>
  </VfText>
</template>
```

The slot replaces the **entire** markup, and it exists on every Vueform component — `!VfForm`, `!VfGroup`, `!VfTabs`, not just elements. For an element the markup includes the layout, which is why the _Email_ label above never shows. `<VfLayout>` restores it — see [The Standard Layout](#the-standard-layout).

From a schema the same content goes through a `slots: { template }` entry. The entry renders as a component with `context` arriving as its prop, which [`!defineSlot`](/guide/slots#defineSlot) declares and types:

```ts
{
  email: {
    type: 'text',
    label: 'Email',
    slots: {
      template: defineSlot('VfText.template', {
        props: ['context'],
        template: `
          <input
            :class="context.classes.input"
            v-bind="context.bindings.input()"
            :value="context.value"
            @input="context.handleInput"
          />
        `,
      }),
    },
  },
}
```

The `template` string in the entry needs Vue's runtime-compiler build — the entry takes any component definition, with the shapes covered under [the `slots` prop](/guide/slots#the-slots-prop).

Both routes suit one-off markup. Markup reused across instances — or shipped across apps — becomes a template component.

## The Template Component

A template component is a normal SFC with a single `context` prop, typed with `ContextOf` of the host component's name:

```vue
<script setup lang="ts">
import type { ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfText'> }>()
</script>

<template>
  <VfLayout :loading="context.loading">
    <input
      :class="context.classes.input"
      v-bind="context.bindings.input()"
      :value="context.value"
      :ref="context.setInputRef"
      @input="context.handleInput"
    />
  </VfLayout>
</template>
```

An optional second argument narrows prop generics the same way SFC generics do — `ContextOf<'VfSelect', { items: typeof items }>`. How the component reaches an instance — one, all, or by name from a serialized schema — is covered in [Applying a Template](#applying-a-template).

### Reading the Context

Property access on `context` is live — the template re-renders as the members it reads change. Plain destructuring in the script snapshots values instead, so destructure state through `toRefs`. Methods are stable functions and destructure directly:

```vue
<script setup lang="ts">
import { toRefs } from 'vue'
import type { ContextOf } from '@vueform/ui'

const props = defineProps<{ context: ContextOf<'VfText'> }>()

const { value, focused } = toRefs(props.context) // live, writable refs
const { update, handleInput } = props.context // methods are stable
</script>
```

`context.props` holds the host's resolved props — [defaults](/guide/defaults#resolution-order) and presets applied — and supports `toRefs` the same way. The props are read-only; a write warns in development.

A template can only rely on props the host declares. A prop of its own is declared on the host through a plugin — see [adding props and emits](/guide/plugins#adding-props-and-emits).

Components nested inside the template reach the host without prop drilling via [`!useTemplateContext`](/api/composables/useTemplateContext), whose home is [context](/guide/context). It returns the **nearest** Vueform component, so content placed inside `<VfLayout>` gets the layout's context, not the element's — pass `context` down as a prop there.

### Bindings

`context.bindings` holds one **resolver per part** — call it and spread the result, as every example above does with `v-bind="context.bindings.input()"`. The returned bag merges the part's ARIA attributes, its `data-*` [state attributes](/guide/parts#state-attributes), and the user's [`parts` / `part:` overrides](/guide/parts), with the user's overrides applied last.

Classes are **not** in the bag. Bind `:class="context.classes.input"` separately on the same node.

Per-item parts take their runtime arguments — a file element's `context.bindings.item(file, index)` — see [callable parts](/guide/parts#callable-parts). Some class keys are callable the same way, like the layout's `root(props)`.

Skipping the bag silently drops the user's part attributes and the node's ARIA wiring. Skipping `:class` drops the theme classes. `context.parts.input()` returns only the user's raw override (or `undefined`), and `'input' in context.parts` answers whether the user overrode the part at all — rarely needed in a template.

The part keys autocomplete, resolver shapes included:

```ts
context.bindings.
//               ^|*input|root|label|errors|addonBefore@"(addon, index) => …"|iconGroup
```

### Classes

`!useClasses` registers class definitions on the host from inside the template. Per key, your value replaces the component's own value, and keys you leave out keep theirs:

```vue
<script setup lang="ts">
import { useClasses, type ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfText'> }>()

const classes = useClasses('VfText', {
  input: 'my-input', // replaces the component's own `input` value
  icon: 'my-input-icon', // a new key
})
</script>

<template>
  <VfLayout :loading="context.loading">
    <span :class="classes.icon" />
    <input :class="classes.input" v-bind="context.bindings.input()" />
  </VfLayout>
</template>
```

The user's `classes` / `reclass` props, shorthands, defaults, and presets still apply on top — see [override priority](/guide/classes#override-priority). Layout-owned keys (`root`, `label`, `errors`, …) keep the layout's base class under a template override; to replace those outright, use `reclass` or [layout classes](/guide/classes#layout-classes).

A definition may also be a factory, which receives `(context$, propRefs)` and re-runs as the state it reads changes — and `!useClasses` accepts several definitions in one call:

```ts
const classes = useClasses('VfText', (context$) => ({
  input: ['my-input', { 'my-input-focused': context$.focused }],
}))
```

New keys register on the host, so they resolve everywhere at runtime — `context.classes.icon`, the `classes` / `reclass` props, `class:icon` shorthands. Only the object `!useClasses` returns knows their *types*; to type them on the component's own surfaces, see [Typing New Keys](#typing-new-keys).

### Slots

`context.outlets` has an entry for every slot the user filled — inline or through the `slots` prop, with inline winning — keyed by the kebab-case slot name.

A template component can't reach the host's slots with `<slot name="…">` — that would read its *own* slots. Render the outlet with `<component :is>` under `v-if`, keep the default markup as `v-else`, and bind the slot's payload as props.

For elements, `<VfLayout>` already renders the layout slots — label, help, description, errors, messages, addons, icons. The template renders only the slots specific to the control. `!VfText` has none; `!VfGroup` has `default` and `wrapper`:

```vue
<script setup lang="ts">
import type { ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfGroup'> }>()
</script>

<template>
  <VfLayout>
    <div :class="context.classes.wrapper" v-bind="context.bindings.wrapper()">
      <component
        v-if="context.outlets.default"
        :is="context.outlets.default"
        :resolved-schema="context.resolvedSchema"
      />
      <template v-else>
        <component
          v-for="el in context.resolvedSchema"
          :key="el.props.name"
          :is="el.component"
          v-bind="el.props"
        />
      </template>
    </div>
  </VfLayout>
</template>
```

A new slot needs no runtime registration — the outlets resolve any slot a user fills. What it needs is a type, which the next section covers.

### Typing New Keys

Parts, classes, and slots a template introduces need no runtime declaration. The `bindings` and `parts` resolvers accept any key the user supplies, `!useClasses` registers class keys, and the outlets resolve any filled slot. What's missing is the type — without it, users get no completion and no checking on the keys your template added.

Augment the host's interfaces in a plain `<script lang="ts">` block next to `<script setup>` — ambient declarations can't live in `<script setup>`, because its body compiles into function scope:

```vue
<script lang="ts">
import type { VNode } from 'vue'
import type { ClassValue, DomAttrsOf } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextParts {
    icon?: DomAttrsOf<'span'>
  }
  interface VfTextClasses {
    icon: ClassValue
  }
  interface VfTextSlots {
    prefix: (props: { label?: string }) => VNode[]
  }
}
</script>

<script setup lang="ts">
// the template component's own setup
</script>
```

A DOM part is typed `DomAttrsOf<'span'>`, a part rendered by a component `PartOf<'VfAddon'>`, a per-item part as a function of its runtime arguments, and a slot as a function of its payload returning `VNode[]`. `VfTextSlots` is generic, but every parameter has a default, so the list may be omitted — repeat it verbatim only when a member references a parameter. The augmentation mechanics are the same as a plugin's — see [augmenting a single component](/guide/plugins#a-single-component).

The two script blocks share one module scope — a type imported in the plain block is usable in `<script setup>`, and importing the same name in both is a duplicate-identifier error.

The augmentation ships with the template and applies wherever the SFC is imported. It is interface-wide — every `VfText` / `type: 'text'` gains the keys, not only the instances rendering this template. From then on `:parts="{ icon: { title: 'Email' } }"` and an inline `#prefix="{ label }"` slot are fully typed.

### Logic Inside the Template

A template is a regular SFC, so computeds, watchers, and helper functions are all fine. Everything defined there is local, though — it isn't on the context, isn't reachable through template refs, `find()`, or events, and doesn't appear in the types. When the component itself must grow — a prop, an event, state other code reads — declare it on the host with a [plugin](/guide/plugins) and consume it from the template like any built-in member.

## Element Templates

An element's template has two extra jobs — the layout around the control, and the wiring that turns DOM events into the element's value and interaction state. Templates for non-element components can skip this section.

### The Standard Layout

`<VfLayout>` at the template root is the shared [element layout](/guide/element-layout) — label, help, description, errors, messages, columns, and the region ids the input's ARIA attributes point at. Omit it and only your markup renders.

`!VfLayout` takes boolean toggles a template passes through. `loading` matters most — pass `context.loading`, or the loading indicator disappears (the built-in `!VfText` template does exactly this). `label`, `addons`, `languages`, and `hideErrors` switch their regions off the same way — see [`!VfLayout`](/components/VfLayout) for the list.

To change only the layout and keep the control, use the `layout` prop instead of a template — see [replacing the layout](/guide/element-layout#replacing-the-layout).

### Interaction States

Elements track three interaction states:

| State | Meaning |
| --- | --- |
| `focused` | The element currently holds focus. |
| `visited` | The element has been focused at least once. |
| `touched` | The element has been blurred at least once. |

They're fed by two handlers. `handleFocus` sets `focused` and `visited`; `handleBlur` clears `focused` and sets `touched`. A blur that moves focus to another node inside the element doesn't count, and a focus while already focused is ignored.

The states are plain writable state — `context.touched = true` works for a control that never emits blur.

Skip `handleBlur` and blur-triggered validation never runs — see [element triggers](/guide/validation#element-triggers).

### User Input

Writing `context.value` — or calling `context.update()` — is a programmatic update. Only the template's wiring turns a change into *user input*. The canonical wiring:

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import type { ContextOf } from '@vueform/ui'

const props = defineProps<{ context: ContextOf<'VfText'> }>()

const value = toRef(props.context, 'value')
</script>

<template>
  <VfLayout :loading="context.loading">
    <input
      v-model="value"
      :class="context.classes.input"
      v-bind="context.bindings.input()"
      :ref="context.setInputRef"
      @input="context.handleInput"
      @focus="context.handleFocus"
      @blur="context.handleBlur"
    />
  </VfLayout>
</template>
```

`v-model` targets `toRef(context, 'value')` — a writable target, which also keeps `vue/no-mutating-props` quiet.

`handleInput` does three things. It fires the `input` event, triggers `validateOn` change validation, and stops expression tracking per `untrackOn` (see [when tracking stops](/guide/expressions#when-tracking-stops)). Events fired mid-IME-composition are ignored, and it never touches the interaction states. Without the listener the input still edits the value, but none of that happens.

`setInputRef` registers `context.inputRef`. On a native `input` / `textarea` / `select` (not file) it also picks up value changes no bound event reported — change-only autofill, password managers — as user input.

Bind `handleInput` to the one event that means "the user changed it":

| Control | Event |
| --- | --- |
| Text-like native input | `@input` |
| Native checkbox / radio / select | `@change` |
| Native file input | `@change` — reads `files`, an array with `multiple` |
| Vue component | `@update:model-value` |

Without `v-model`, `handleInput` performs the write itself. It takes a value or the native event carrying it — read the way `v-model` reads it — and writes only when the model doesn't already hold the value. A component that emits a payload object adapts inline — `@change="(e) => context.handleInput(e.value, e.originalEvent)"`.

### Binding Bags

For the two most common wirings the context carries ready-made bags. `context.inputBindings` bundles the native text-like contract — `onInput`, `onFocus` / `onBlur`, and the `ref`. No `v-model` is needed, because programmatic model changes are written back into the DOM:

```vue
<template>
  <VfLayout :loading="context.loading">
    <input
      :class="context.classes.input"
      v-bind="{ ...context.bindings.input(), ...context.inputBindings }"
    />
  </VfLayout>
</template>
```

`context.componentBindings` wires a component input the same way — `modelValue`, an `update:modelValue` handler that writes and reports, and the focus / blur listeners — `<DatePicker v-bind="context.componentBindings" />`.

Hand-wire instead when the markup doesn't fit. That covers native checkbox / radio / select / file controls (the DOM write-back is text-like only), payload-object components, and listeners you want to intercept. Never spread a bag and bind `v-model` on the same node.

The same bags power one-off inputs in `!VfField` — see [wrapping a widget with VfField](/guide/components#wrapping-a-widget-with-VfField).

## Applying a Template

The `template` prop applies a template component to one instance — `template: MyTextTemplate` in a schema entry, or `:template="MyTextTemplate"` inline.

### Globally, as a Default

`template` is a prop like any other, so a [default](/guide/defaults) restyles every instance of a component:

```ts
createVueform({
  defaults: {
    VfText: { template: MyTextTemplate },
  },
})
```

Wildcard targets work as they do for any default, and [presets](/guide/presets) fit templates only some instances opt into.

A per-instance `template` still wins over the default. `:template="null"` restores the built-in markup and also ignores any `slots.template` entry — only an inline `#template` slot still renders.

### By Name

A serialized schema can't carry a component — only its **name**. A string `template` resolves against the app's global registrations, in two steps — register the component and allow its name in the [`$security` config](/guide/configuration#security):

```ts
app.component('MyTextTemplate', MyTextTemplate)

app.use(
  createVueform({
    $security: {
      allowComponents: ['MyTextTemplate'],
    },
  })
)
```

From then on a schema entry renders through it with `template: 'MyTextTemplate'`. The allowlist is what keeps an untrusted schema from instantiating arbitrary application components — what happens to an unlisted name, and the dev warning it raises, is covered in [component names](/guide/security#component-names).

## Resolution Order

When several routes supply a template, the first match wins:

1. The inline `#template` slot.
2. The `template` prop, as resolved through defaults and presets.
3. The `slots.template` entry.
4. The built-in markup.

Under the default [`lazy`](/guide/configuration#lazy) option, an element renders its template — by any route — only once the element's view has loaded.

Templates end where markup ends. When the logic itself must differ — different model behavior, different events, a whole new element type — replace the component instead of its template; see [components](/guide/components).
