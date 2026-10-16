---
outline: [2,3]
---

<script setup lang="ts">
  const MyTextTemplate = () => ''
  const IconWithTooltip = () => ''
</script>

# Templates

[Slots](/guide/slots) replace individual pieces of a component's rendering — a label here, an option there. Every Vueform component also has one slot that replaces _all_ of it: **`template`**. Fill it and you own the component's entire markup, while all of its logic — model, validation, conditions, events, accessibility — keeps running untouched underneath.

This chapter starts with the slot itself — inline, and from a schema. Because `template` is the slot you'll reuse across instances and apps, it also has a dedicated route of its own: a **template component** — an SFC of its own — applied through the `template` prop, per instance or app-wide as a [default](/guide/defaults). That's the bulk of the chapter, including what's specific to element templates — the standard element layout (and the `layout` swap that restyles it without a template) and the user-input wiring. Replacing a whole component — logic included — is the step after that; see [Components](/guide/components).

## The `#template` Slot

Like any other slot, `template` can be filled inline with [`#template`](/guide/slots#template-slots). It receives a single slot prop, **`context`** — the component's public context in the unwrapped shape event handlers also receive as `context$` (see [Context](/guide/context)):

```vue
<VfText name="email" label="Email">
  <template #template="{ context }">
    <input
      :id="context.id"
      :class="context.classes.input"
      :value="context.value"
      v-bind="context.parts.input"
      @input="context.handleInput"
    />
  </template>
</VfText>
```

The slot replaces the component's **entire** markup, and it works the same on every Vueform component — `!VfForm`, `VfGroup`, `VfTabs`, not just elements. For an element like the `VfText` above, "entire" includes the standard element layout — label, errors, and the rest — so these examples render nothing but a bare input (the `label` never shows). Wrapping an element template's markup in `<VfLayout>` keeps the layout; that's the norm and covered in [The Standard Layout](#the-standard-layout).

From a schema, the same content goes through the [`slots`](/guide/slots#the-slots-prop) prop as a `template` entry. The entry renders as a component, and `context` arrives as its **prop** — [`defineSlot`](/guide/slots#defineslot) declares and types it:

```ts
import { h } from 'vue'
import { defineSchema, defineSlot } from '@vueform/ui'

const EmailInput = defineSlot('VfText.template', {
  props: ['context'],
  setup: (props) => () =>
    h('input', {
      id: props.context.id,
      class: props.context.classes.input,
      value: props.context.value,
      ...props.context.parts.input,
      onInput: props.context.handleInput,
    }),
})

defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    slots: { template: EmailInput }, // [!code highlight]
  },
})
```

Both are convenient for one-off markup that lives alongside the form. For markup reused across instances — or across apps — the next step is a template component.

## The Template Component

A template component is a normal Vue SFC. Like the `slots.template` entry in the example above, it receives the host's context as a **`context` prop** — declare it with `defineProps`, type it with `ContextOf`, and bind whatever pieces your markup needs:

```vue
<!-- MyTextTemplate.vue -->
<script setup lang="ts">
import type { ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfText'> }>()
</script>

<template>
  <VfLayout>
    <input
      :type="context.props.inputType"
      :name="context.name"
      :id="context.id"
      :class="context.classes.input"
      :value="context.value"
      v-bind="{ ...context.aria, ...context.parts.input }"
      :ref="context.setInputRef"
      @input="context.handleInput"
    />
  </VfLayout>
</template>
```

`ContextOf` takes the name of the host component the template is written for (`!'VfText'`, `!'VfSelect'`, `!'VfCheckbox'`, …) and types the prop as that component's public context — the same object event handlers receive as `context$` (see [Context](/guide/context)).

### Destructuring

The `context` prop behaves like a `reactive` object: property access is live, but plain destructuring copies the current value — `const { value } = context` is a snapshot that never updates. To pull members out, use `toRefs`. The refs stay live and are writable. Methods are stable functions, so they alone destructure directly:

```vue
<script setup lang="ts">
import { toRefs, watch } from 'vue'
import type { ContextOf } from '@vueform/ui'

const { context } = defineProps<{ context: ContextOf<'VfText'> }>()

const { handleInput, setInputRef } = context // methods: destructure directly
const { value, touched } = toRefs(context) // state: take refs

watch(value, (v) => console.log('value is now', v))
value.value = '' // writes through to the component
</script>
```

### Props

`context.props` holds the host component's regular props, [resolved](/guide/defaults#resolution-order). Like `context` itself it behaves as a reactive object: read `context.props.inputType` directly, or take refs with `toRefs`:

```ts
const { inputType, placeholder } = toRefs(context.props)

watch(inputType, (type) => console.log('input type changed to', type))
```

A template can only rely on the props its host component declares. When the markup calls for a prop of its own, declare it on the host component with a plugin — see [Adding Props and Emits](/guide/plugins#adding-props-and-emits).

### Classes

`context.classes` holds the host component's [resolved classes](/guide/classes#override-priority). Each component declares a typed list of class keys, so they autocomplete:

```ts
context.classes.
//              <|*addonGroup@"(property) addonGroup: ClassValue"|description|elementGroup|...
```

<br />
<br />

All the template has to do is bind them at the matching spots of the markup:

```vue
<template>
  <VfLayout>
    <input
      :class="context.classes.input"
      :value="context.value"
      @input="context.handleInput"
    />
  </VfLayout>
</template>
```

To override built-in class values — or add keys of your own — use `useClasses`. A key you set **replaces** the component's own value for that key; keys you leave out keep theirs; and the result still resolves through the regular [override chain](/guide/classes#override-priority), so user props, defaults, and presets apply on top of your values just as they do on the built-in ones. It returns the host's classes object with your keys included and typed:

```vue
<!-- MyTextTemplate.vue -->
<script setup lang="ts">
import { useClasses, type ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfText'> }>()

const classes = useClasses('VfText', {
  input: 'my-input', // replaces the built-in `input` class value
  icon: 'vf-text-icon', // a key of your own
})

classes.i
//       ^|*icon@"(property) icon: ClassValue"|input
</script>

<template>
  <VfLayout>
    <span :class="classes.icon">@</span>
    <input :class="classes.input" />
  </VfLayout>
</template>
```

When a value depends on state, pass a function instead of an object — it receives the host's [context](/guide/context) and re-runs as that state changes:

```ts
const classes = useClasses('VfText', (el$) => ({
  icon: { 'vf-text-icon': true, 'vf-danger': el$.hasError },
}))
```

`useClasses` registers the definitions on the **host component**, so at runtime the new keys behave like built-in ones everywhere: `context.classes.icon` resolves outside the template too, and users can style it with `:classes="{ icon: '...' }"`, `:reclass="{ icon: '...' }"`, or the `class:icon` / `reclass:icon` shorthands. What stays local is the typing — only the object returned by `useClasses` knows about template-only keys, so `classes.icon` read off the host's context types as `any` (it still works at runtime).

If the template is meant as a global replacement — every `VfText` in the app renders it — extend the host component's types too by augmenting its `Classes` interface, right in the template's SFC. Ambient module declarations aren't allowed inside `<script setup>` (its body compiles into function scope), so the augmentation goes into a plain `<script lang="ts">` block alongside it:

```vue
<!-- MyTextTemplate.vue -->
<script lang="ts">
import type { ClassValue } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextClasses {
    icon: ClassValue
  }
}
</script>

<script setup lang="ts">
// ...
</script>
```

Now `icon` is typed everywhere class keys show up: `context.classes.icon`, the `classes` and `reclass` props, and the `class:icon` / `reclass:icon` shorthands all derive from the `Vf*Classes` interface, so the single augmentation covers them. Every component exposes its interfaces this way — `VfSelectClasses`, `VfCheckboxClasses`, and so on — from its `@vueform/ui/components/Vf*` entry.

Because the augmentation lives in the template's SFC, it ships with the template and only applies when the template is imported. The two script blocks share one module scope — a type imported in the plain block is usable from `<script setup>` (and its `generic` attribute) too, but importing the same name in both blocks is a duplicate-identifier error. Keep in mind that it extends the class list of **all** `VfText` (or `type: 'text'`) components — not just the instances rendering this template.

### Parts

The [Parts](/guide/parts) are available via `context.parts` — one attribute bag per part, built from the user's `parts` prop and `part:` shorthands. The available keys come typed the same way:

```ts
context.parts.i
//             <|...|iconBefore?|iconGroup?|*input?@"(property) DomAttrsOf<“input”>| undefined"
```

<br />
<br />

In an element template, `<VfLayout>` binds most parts automatically — label, description, errors, addons, icons. What's left for the template are the parts belonging to its _own_ markup — like `input` for `VfText` — spread onto the node with `v-bind`:

```vue
<template>
  <VfLayout>
    <input
      :class="context.classes.input"
      :value="context.value"
      v-bind="context.parts.input"
      @input="context.handleInput"
    />
  </VfLayout>
</template>
```

Skipping the binding means the `parts.input` / `part:input` attributes users define silently never reach the `<input>` tag.

A node of your own needs no runtime registration — `context.parts` resolves any key the user supplies. What it needs is a type: augment the component's `Parts` interface:

```vue
<!-- MyTextTemplate.vue -->
<script lang="ts">
import type { DomAttrsOf } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextParts {
    icon: DomAttrsOf<'span'>
  }
}
</script>

<template>
  <VfLayout>
    <span v-bind="context.parts.icon">@</span>
    <input v-bind="context.parts.input" />
  </VfLayout>
</template>
```

```vue
<VfText name="email" :parts="{ icon: { title: 'Email address' } }" />
```

`DomAttrsOf` accepts any HTML tag and types the part as that tag's attribute set; for a part that renders a registered Vueform component, use `PartOf<'ComponentName'>` instead, which resolves to a partial prop list of that component. The `part:icon` shorthand follows from the interface too – no need to define it separately. For a node rendered in a loop, declare the part as a function of its runtime args and call it before spreading — see [Callable Parts](/guide/parts#callable-parts).

### Slots

[Slots](/guide/slots) can be filled two ways in Vueform: inline [template slots](/guide/slots#template-slots) and the [`slots` prop](/guide/slots#the-slots-prop). A custom template sees both through a common surface Vueform calls **outlets** — `context.outlets` holds an entry for every filled slot, whichever way it was defined (when both fill the same slot, the inline one wins). The keys are typed:

```ts
context.outlets.
//              <|*addonAfter@"(property) addonAfter?: ((props: { addonAfte..."|addonBefore|description|...
```

<br />
<br />

Inside a custom template the conventional `<slot name="...">` can't reach the host's slots — the template is a component of its own. Render outlets as dynamic components instead: an outlet only exists when something fills the slot, so `v-if` on it, keep the default markup as the `v-else` branch, and pass the slot's payload as props.

For elements most slots are rendered by `<VfLayout>` — label, help, description, errors, messages, addons, icons — so the template only renders the slots specific to the component's own markup: `VfText` has none of its own, while `VfGroup` has `default` and `wrapper`. A `VfGroup` template rendering its `default` outlet — the bound `resolved-schema` is the payload its slot type declares:

```vue
<!-- MyGroupTemplate.vue -->
<script setup lang="ts">
import type { ContextOf } from '@vueform/ui'

defineProps<{ context: ContextOf<'VfGroup'> }>()
</script>

<template>
  <VfLayout>
    <div :class="context.classes.wrapper" v-bind="context.parts.wrapper">
      <component
        v-if="context.outlets.default"
        :is="context.outlets.default"
        :resolved-schema="context.resolvedSchema"
      />
      <template v-else>
        <component
          v-for="el in context.resolvedSchema"
          :is="el.component"
          v-bind="el.props"
          :key="el.props.name"
        />
      </template>
    </div>
  </VfLayout>
</template>
```

To give the host component a **new** slot, augment its `Slots` interface — outlets resolve any slot users fill, so once again only the type is missing:

```vue
<!-- MyTextTemplate.vue -->
<script lang="ts">
import type { VNode } from 'vue'
import type { LanguagesProp } from '@vueform/ui'

declare module '@vueform/ui/components/VfText' {
  interface VfTextSlots<
    TTranslate extends boolean = boolean,
    TLanguages extends LanguagesProp = LanguagesProp,
  > {
    prefix: (props: { label: string }) => VNode[]
  }
}
</script>

<template>
  <VfLayout>
    <span :class="classes.icon" v-bind="context.parts.icon">
      <component
        v-if="context.outlets.prefix"
        :is="context.outlets.prefix"
        :label="context.label"
      />
      <template v-else>@</template>
    </span>
    <input :class="classes.input" v-bind="context.parts.input" />
  </VfLayout>
</template>
```

The slot is now part of the component's type surface — the inline `#prefix` slot and `slots: { prefix }` entries typecheck with the declared payload, and the props bound when rendering the outlet are what the slot receives:

::: usage nolive

```vue [Preview]
<VfText name="email" label="Email" :template="MyTextTemplate">
  <template #prefix="{ label }">
    <IconWithTooltip :text="label" />
  </template>
</VfText>
```

```vue [Template]
<script setup lang="ts">
import MyTextTemplate from './MyTextTemplate.vue'
import IconWithTooltip from './IconWithTooltip.vue'
</script>

<template>
  <VfText name="email" label="Email" :template="MyTextTemplate">
    <template #prefix="{ label }">
      <IconWithTooltip :text="label" />
    </template>
  </VfText>
</template>
```

```vue [Schema]
<script setup lang="ts">
import { h } from 'vue'
import { defineSchema, defineSlot, useForm } from '@vueform/ui'
import MyTextTemplate from './MyTextTemplate.vue'
import IconWithTooltip from './IconWithTooltip.vue'

const PrefixIcon = defineSlot('VfText.prefix', {
  props: ['label'],
  setup: (props) => () => h(IconWithTooltip, { text: props.label }),
})

const schema = defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    template: MyTextTemplate, // [!code highlight]
    slots: { prefix: PrefixIcon }, // [!code highlight]
  },
})

const [Form] = useForm({ schema })
</script>

<template>
  <Form />
</template>
```

:::

### Logic Inside the Template

A template is a regular SFC, so you're free to write logic in it — computeds, watchers, render helpers, anything that serves the markup. What matters is its **reach**: everything defined inside a template lives only there. It doesn't become part of the component's context, isn't reachable through refs, events, or `find`, and doesn't appear in the types. That's fine for helpers only the markup uses. When the template needs the _component_ to grow — a prop to read, an event to fire, state other code should reach — declare the extension on the host with [Plugins](/guide/plugins), and consume it from the template like any built-in member.

## Element Templates

Everything so far applies to a template for **any** component — `!VfForm`, `VfText`, `VfTabs`, and the rest. An element's template carries two extra responsibilities: the layout around the control, and the wiring that turns DOM events into the element's value and interaction state. Templates for non-element components can skip this whole section.

### The Standard Layout

The `<VfLayout>` at the template's root is the shared [element layout](/guide/element-layout) — label, help, description, columns, errors, messages, ARIA wiring. Keep it and your element behaves like every other Vueform field; the examples throughout this chapter do:

```vue
<template>
  <VfLayout>
    <input
      :value="context.value"
      :class="context.classes.input"
      v-bind="context.parts.input"
      @input="context.handleInput"
    />
  </VfLayout>
</template>
```

Omit it for raw markup with none of the standard chrome:

```vue
<template>
  <input
    :value="context.value"
    :class="context.classes.input"
    v-bind="context.parts.input"
    @input="context.handleInput"
  />
</template>
```

If all you want to change is the layout itself, there's no need to replace the element's template — use the `layout` prop instead. Where `template` replaces the entire rendered tree, `layout` swaps **only** the `VfLayout` part; the element's own control still renders inside it.

The `layout` prop accepts a component (or a registered component name — allowlisted in [`$security.allowComponents`](/guide/configuration#security) like a [named template](#by-name)), plus two boolean shortcuts: `true` (default) renders the original layout, `false` renders the element with **no layout wrapper at all** — handy for a bare input in a toolbar:

::: code-group

```ts [Schema]
import { defineSchema } from '@vueform/ui'
import MyElementLayout from './MyElementLayout.vue'

defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    layout: MyElementLayout, // [!code highlight]
  },
  search: {
    type: 'text',
    layout: false, // no layout wrapper at all // [!code highlight]
  },
})
```

```vue [Template]
<VfText name="email" label="Email" :layout="MyElementLayout" />
<VfText name="search" :layout="false" />
```

:::

To swap the layout for **every** element, set it as a default for the `'*element'` wildcard:

```ts
createVueform({
  defaults: {
    '*element': { layout: MyElementLayout },
  },
})
```

A layout component is authored like a template component — it receives a `context` prop, typed `ContextOf<'VfLayout'>` (not the wrapped element's name). The best reference is the [original `VfLayout`](https://github.com/vueform/next/blob/main/packages/core/src/components/VfLayout/VfLayout.vue) itself — start from a copy and adjust.

### Interaction States

Elements track how far the user has gotten with them — three states, fed purely by the template's wiring:

- `focused` — the input has focus right now.
- `visited` — the input has been focused at least once.
- `touched` — the input has been blurred at least once.

They're normally fed by two handlers bound in the template — `handleFocus` sets `focused` and `visited`, `handleBlur` clears `focused` and sets `touched`. But they're also plain writable state: setting `context.touched = true` directly works just as well, say for a component input that never emits a blur.

Validation timing builds on them: with `validateOn: ['blur']` it's the blur itself that validates, and such an element keeps re-validating live only once it's `touched`. A blur that merely moves focus between nodes _inside_ the element doesn't count — `touched` means the user actually left it.

### User Input

Writing `context.value` — or calling `context.update()` — is a _programmatic_ update: the value changes, but nothing marks the element interacted with. What turns a change into **user** input is the template's wiring.

The straightforward version is `v-model` for the value plus three listeners. Take the value as a `toRef` so `v-model` has a writable target — it also keeps the template clear of writes into the `context` prop, which `vue/no-mutating-props` would flag:

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import type { ContextOf } from '@vueform/ui'

const { context } = defineProps<{ context: ContextOf<'VfText'> }>()

const value = toRef(context, 'value')
</script>

<template>
  <VfLayout>
    <input
      v-model="value"
      :ref="context.setInputRef"
      @input="context.handleInput"
      @focus="context.handleFocus"
      @blur="context.handleBlur"
    />
  </VfLayout>
</template>
```

Each listener has its own job:

- **`@input="handleInput"`** — `v-model` only moves the value, and a value write alone is indistinguishable from a programmatic one. `handleInput` reports _"the user did this"_: it fires the `input` event, lets `validateOn` react to the change, and untracks [expressions](/guide/expressions) per `untrackOn`. With `v-model` already syncing the value it's a pure notification (it only writes the value itself when nothing else has — see below); events fired mid-IME-composition are ignored, so the composed text counts once, when the session ends. Skip the listener and the input still edits the value — but change-driven validation and expression untracking never happen.
- **`@focus="handleFocus"`** — sets `focused` and `visited` and fires the `focus` event.
- **`@blur="handleBlur"`** — clears `focused`, sets `touched`, and fires the `blur` event — which is also what runs blur-mode validation. Skip it and `validateOn: ['blur']` never validates.

`:ref="context.setInputRef"` registers the DOM node as the element's underlying input (`context.input`) — and it's more than a ref: on registered native inputs Vueform also watches for value changes that no bound event reported (a password manager or autofill that fires only `change`, for example) and adopts them as user input, so don't skip the binding.

The same shape covers every kind of control — bind `handleInput` to whatever event means _"the user changed it"_:

| Markup                           | Value             | Report                              |
| -------------------------------- | ----------------- | ----------------------------------- |
| Native text-like input           | `v-model="value"` | `@input="handleInput"`              |
| Native checkbox / radio / select | `v-model="value"` | `@change="handleInput"`             |
| Vue component                    | `v-model="value"` | `@update:model-value="handleInput"` |

Without `v-model` — a render function, a `:value`-bound input — the same `handleInput` also performs the write: it accepts the new value directly or the native event carrying it (read the way `v-model` reads it: `checked` mapped onto the true/false values for checkboxes, the bound `:value` of radios and options, numbers for `type="number"`), and writes it to the model only when the model doesn't hold it yet:

```vue
<template>
  <VfLayout>
    <input
      :value="context.value"
      :ref="context.setInputRef"
      @input="context.handleInput"
      @focus="context.handleFocus"
      @blur="context.handleBlur"
    />
  </VfLayout>
</template>
```

A component that emits something other than the plain value can be adapted inline — pass the value first and the originating event second: `@change="(e) => handleInput(e.value, e.originalEvent)"`.

### Binding Bags

The wiring above is a fixed recipe, so the context also ships it pre-assembled as two spreadable bags. For a native **text-like** input, `context.inputBindings` bundles the whole contract — `@input="handleInput"`, `@focus` / `@blur`, and the `setInputRef` ref — with no `v-model` needed: user edits flow in through `handleInput`'s write, and programmatic model changes are written back into the DOM for you:

```vue
<template>
  <VfLayout>
    <input :class="context.classes.input" v-bind="context.inputBindings" />
  </VfLayout>
</template>
```

For a **component** input, `context.componentBindings` carries `modelValue`, an `update:modelValue` handler (write + report), and the focus / blur listeners for components that emit them:

```vue
<template>
  <VfLayout>
    <DatePicker v-bind="context.componentBindings" />
  </VfLayout>
</template>
```

The bags are the low-ceremony default; the individual handlers remain the escape hatch. Reach for hand-wiring when the markup doesn't fit a bag's assumptions: a native checkbox, radio, or select (their model → DOM sync needs `v-model`, so wire `v-model` + `@change="handleInput"` as in the table above), a component that emits a payload object instead of the plain value (adapt it inline), or listeners you want to intercept. Spreading a bag _and_ binding `v-model` on the same node would double-wire the value — pick one.

## Applying a Template

The most direct route is the `template` prop on a single instance — only that field is affected:

::: code-group

```ts [Schema]
import { defineSchema } from '@vueform/ui'
import MyTextTemplate from './MyTextTemplate.vue'

defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    template: MyTextTemplate, // [!code highlight]
  },
})
```

```vue [Template]
<script setup lang="ts">
import MyTextTemplate from './MyTextTemplate.vue'
</script>

<template>
  <VfText name="email" label="Email" :template="MyTextTemplate" />
</template>
```

:::

### Globally, as a Default

`template` is a prop like any other, so restyling _every_ instance of a component is a [default](/guide/defaults) keyed by the component's name:

```ts
import { createVueform } from '@vueform/ui/origin'
import MyTextTemplate from './MyTextTemplate.vue'

createVueform({
  defaults: {
    VfText: { template: MyTextTemplate }, // [!code highlight]
  },
})
```

Every `VfText` in the app now renders `MyTextTemplate`. The same works for any component — `!VfForm`, `VfLayout`, `VfTabs`, `VfNav`, and the rest — and everything `defaults` offers applies: the `'*'` / `'*element'` wildcards, and [Presets](/guide/presets) for templates that only some instances opt into. A per-instance `template` prop still wins, and `:template="null"` opts a single instance back to the built-in markup:

```vue
<VfText name="email" :template="null" />
```

### By Name

A serialized schema — JSON from a CMS, an API, a form builder — can't carry an imported component, only its **name**. For that case `template` also accepts a string, resolved the way Vue resolves any component name: against the app's global registrations. Two steps make a name resolvable:

1. **Register the component globally with Vue** — `app.component()`. Vueform isn't involved in this step; it doesn't need to know the template.
2. **Allow the name** in [`$security.allowComponents`](/guide/configuration#security). Without this the string is ignored and the built-in markup renders, with a development warning.

```ts
import { createApp } from 'vue'
import { createVueform } from '@vueform/ui/origin'
import MyTextTemplate from './MyTextTemplate.vue'

const app = createApp(App)

app.component('MyTextTemplate', MyTextTemplate) // 1. global in Vue // [!code highlight]

app.use(
  createVueform({
    $security: {
      allowComponents: ['MyTextTemplate'], // 2. allowed by name // [!code highlight]
    },
  })
)
```

::: code-group

```ts [Schema]
defineSchema({
  email: {
    type: 'text',
    label: 'Email',
    template: 'MyTextTemplate', // [!code highlight]
  },
})
```

```vue [Template]
<VfText name="email" label="Email" template="MyTextTemplate" />
```

:::

The second step exists because the schema is exactly the kind of input that might not be yours: without an allowlist, a schema from outside the app could name _any_ registered component — including ones never meant to render inside a form. The same allowlist covers string `layout` and `slots` values; see [Slot Content](/guide/security#slot-content) in the Security chapter.

## Resolution Order

When a component decides what to render, the first match wins:

1. The `#template` slot on the instance.
2. The `template` prop (component, or registered component name) — as resolved through [Defaults](/guide/defaults) and [Presets](/guide/presets), so a global default counts here.
3. A `slots.template` entry from the `slots` prop.
4. The component's built-in markup.

The mechanism is identical for every Vueform component — what you learn on `VfText` applies to `!VfForm`, `VfLayout`, `VfTabs`, and the rest.

## Beyond Templates

If markup alone isn't enough — the component needs different logic, new props, its own model behavior — the next step replaces or creates the **component** itself: registering a modified copy of a built-in under its name, embedding one-off inputs with `VfField`, or authoring a brand-new element type. All of that is covered in [Components](/guide/components).
