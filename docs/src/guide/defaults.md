---
outline: [2,3]
---

# Defaults

When every form in an app validates the same way, or every text input shares a placeholder style, repeating those props on each instance is noise. **Defaults** declare prop values once — keyed by component name, or by the wildcards `'*'` (every component) and `'*element'` (every element) — and every instance picks them up unless it overrides them locally.

## Basic Usage

Pass a `defaults` object to `createVueform`, keyed by component name:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import { createVueform } from '@vueform/ui/origin'

const app = createApp(App)

app.use(createVueform({
  defaults: {
    VfForm: {
      validateOn: ['change', 'submit'],
    },
  },
}))

app.mount('#app')
```

Every `VfForm` now validates on change and submit — unless an individual form says otherwise. The keys of `defaults` autocomplete to the registered components, and each value is typed as a partial of that component's props.

## Wildcard Targets

`'*'` targets **every** component:

```ts
createVueform({
  defaults: {
    '*': {
      disabled: true,
    },
  },
})
```

A wildcard default is read per component — components without the prop simply ignore it. The `disabled` above affects everything that has a `disabled` prop and is a no-op on the rest.

`'*element'` targets only **elements** — components flagged `element: true` in their definition. Structural and form-level components (`VfForm`, `VfTabs`, `VfNav`) are left untouched:

```ts
createVueform({
  defaults: {
    '*element': {
      columns: 6,
    },
  },
})
```

All three shapes combine, layered in order — `'*'`, then `'*element'`, then the component-specific entry:

```ts
createVueform({
  defaults: {
    '*': {
      class: 'my-base-class',      // every component
    },
    '*element': {
      columns: 6,                  // every element
    },
    VfText: {
      placeholder: 'Type here...', // only VfText
    },
  },
})
```

A `VfText` instance ends up with all three; a `VfForm` only sees the `class`.

## Merging Behavior

When a default and a local prop meet, the general rule is **closer wins** — with one refinement: plain objects are shallow-merged rather than replaced, so a default can contribute keys the instance doesn't set:

```ts
createVueform({
  defaults: {
    VfForm: {
      headers: {
        'X-App-Version': '1.0.0',
      },
    },
  },
})
```

```vue
<VfForm
  endpoint="/api/save"
  :headers="{ Authorization: 'Bearer xyz' }"
/>
```

The resolved `headers` carries both keys:

```ts
{
  'X-App-Version': '1.0.0',
  Authorization: 'Bearer xyz',
}
```

Primitives, arrays, and non-plain values (Dates, Files, refs) are replaced outright — the local value wins whole. And if you'd rather objects replaced too, set the [`mergeObjectProps`](/guide/configuration#mergeobjectprops) config option to `false` — locally passed objects then override defaults entirely (arrays and primitives already do).

::: tip
If global merging isn't precise enough — you want overrides scoped to one form or subtree instead of the whole app — reach for [Presets](/guide/presets). They apply the same kind of prop bundles, but opt-in and cascade-controlled.
:::

### Merging `presets`

The `presets` prop is special-cased: arrays **concatenate** across levels instead of replacing. A default can attach presets that compose with whatever an instance requests:

```ts
createVueform({
  defaults: {
    '*element': {
      presets: ['compact'],
    },
  },
})
```

```vue
<VfText name="email" :presets="['branded']" />
```

The element applies both — `['compact', 'branded']`.

### Merging `class` and `classes`

`class` and `classes` always **merge** across every level — built-in defaults, global defaults, presets, and local props all contribute, nothing is dropped:

```ts
createVueform({
  defaults: {
    VfText: {
      class: 'border',   // appended to every VfText root
      classes: {
        input: 'p-2',    // appended to the input part
      },
    },
  },
})
```

```vue
<VfText
  name="email"
  class="rounded"
  :classes="{ input: 'text-lg' }"
/>
```

The rendered element carries `border rounded` on its root and `p-2 text-lg` on the input part. To _replace_ classes instead of appending, use [`reclass`](/guide/classes#adding-and-replacing-classes).

## Resolution Order

For any component instance, props resolve from lowest to highest priority:

1. **Built-in component defaults** — what the component itself declares.
2. **Global `'*'`** — every component.
3. **Global `'*element'`** — every element (skipped for non-elements).
4. **Component-specific** — `VfForm`, `VfText`, ….
5. **[Presets](/guide/presets)** — from the component's `presets` prop or inherited from an ancestor.
6. **Local props** — what you write on the component.

Local props win for primitives and arrays; plain objects shallow-merge downward through the chain (unless [`mergeObjectProps`](/guide/configuration#mergeobjectprops) is `false`); `class` / `classes` merge everywhere; `presets` arrays concatenate.

## TypeScript

The `defaults` object is fully typed with no extra helper: component keys autocomplete against the registered components, `'*element'` against the shared element prop surface, and mistyped prop names or value shapes fail at compile time:

```ts
createVueform({
  defaults: {
    VfForm: {
      validateOn: ['change', 'submit'],
    },
    VfText: {
      placeholder: 'Start typing...',
      columns: 6,
    },
  },
})
```

For splitting defaults across files or composing them programmatically, wrap the pieces in [`defineConfig`](/api/helpers/defineConfig).
