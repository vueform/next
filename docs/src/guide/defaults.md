---
outline: [2,3]
---

# Defaults

A **default** is a prop value declared once, app-wide, for a component. Every instance of that component starts from it — whether written inline in a template or coming from a schema — and a prop set on the instance still wins. Forms that share a validation trigger, a request format, or a column layout shouldn't have to repeat it on every instance.

## Setting Defaults

Defaults live under the `defaults` key of `createVueform`, keyed by component name. Each entry holds that component's props:

```ts
createVueform({
  defaults: {
    VfForm: {
      validateOn: ['change', 'submit'],
    },
  },
})
```

Every `!VfForm` in the app now validates on change and submit, unless an instance sets its own `validateOn`.

Keys inside an entry are camelCase prop names, exactly as in a schema entry — a kebab-case key like `'validate-on'` is silently ignored.

Any prop can be defaulted, including component-valued ones like `template` or `layout` (see [templates](/guide/templates#globally-as-a-default)) and namespaced [`part:<key>`](/guide/parts#the-part-shorthand) overrides. The `class:<key>` / `reclass:<key>` shorthands are the exception — they're only read from the instance, so default them through the `classes` / `reclass` object props instead.

Defaults belong to components. They resolve when a component instance is created, so a headless `!useModel` instance never reads them — a `!VfForm` default like `json: true` shapes mounted forms' submissions, not `model.submit()` on an unattached model (see [submitting through a model](/guide/submit#through-a-model)).

Defaults are also app-wide and fixed at `createVueform`. For prop bundles that only some instances or one subtree should get, use [presets](/guide/presets).

## Wildcard Targets

Two keys target groups of components instead of one. `'*'` targets every component, and `'*element'` targets every **element** — components flagged `element: true` in their definition, which covers every field plus containers like `!VfGroup` and `!VfList`, as well as [custom components](/guide/components) that carry the flag. What `'*element'` skips is the short list — `!VfForm`, `!VfTabs`, `!VfSteps`, `!VfNav`, and the layout pieces (`!VfLayout`, `!VfRow`, `!VfCol`, `!VfAddon`).

A wildcard value only affects components that declare the prop; elsewhere it has no effect. Be careful with `'*'` though — it reaches `!VfForm` too, so a `'*': { disabled: true }` disables whole forms. Prefer `'*element'` for field-level props.

Wildcards and component keys layer freely:

```ts
createVueform({
  defaults: {
    '*element': {
      columns: 6,
    },
    VfText: {
      placeholder: 'Type here...',
    },
  },
})
```

A `!VfText` gets both values, a `!VfSelect` only `columns`, and `!VfForm` neither. Layers combine per prop in the order `'*'` → `'*element'` → component key, following the rules of [Merging Behavior](#merging-behavior) — a later layer overrides a primitive, shallow-merges into a plain object, and concatenates `presets`.

## Resolution Order

For each prop of an instance, sources apply from lowest to highest priority:

1. **Built-in default** — the value the component itself declares. It only participates when the instance doesn't set the prop; a local value never merges with it.
2. **`'*'`** — the all-components wildcard.
3. **`'*element'`** — skipped for non-elements.
4. **Component key** — `VfText`, `!VfForm`, ….
5. **[Presets](/guide/presets)** — from the instance's `presets` prop or cascaded from an ancestor.
6. **Local prop** — what the instance sets.

## Merging Behavior

The rule is **closer wins**:

- A local value overrides even when falsy — `false`, `0`, `''`, and `null` are real values.
- `undefined` counts as not set, so the default applies.
- Arrays, primitives, non-plain objects (`Date`, `Map`, `Set`, `File`, refs and other class instances), and component definitions (a `template`, `layout`, or slot component) replace whole.

Plain objects are the refinement — they shallow-merge, so a default keeps contributing the keys the instance doesn't set:

```ts
createVueform({
  defaults: {
    VfForm: {
      headers: { 'X-App-Version': '1.0.0' },
    },
  },
})
```

```vue
<VfForm endpoint="/api/save" :headers="{ Authorization: 'Bearer xyz' }" />
```

This form's requests carry both headers — `Authorization` from the instance and `X-App-Version` from the default. To make local objects replace defaults instead, set [`mergeObjectProps: false`](/guide/configuration#mergeobjectprops).

### Merging `presets`

The `presets` prop concatenates instead of replacing. Presets arriving from defaults apply first, then the instance's own list, and a name that arrives from both applies once:

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

Both presets apply to this element, `compact` first. What presets are and how they stack among themselves is covered in [presets](/guide/presets).

### Merging `class` and `classes`

The `classes` prop merges across every level — defaults, presets, and the local prop all contribute. The full class resolution chain, `reclass` included, lives at [override priority](/guide/classes#override-priority).

`class` follows closer-wins like any other string prop, so a local `class` replaces a default one. For root classes that should survive a local `class`, default `classes: { root: '…' }` instead.

## TypeScript

The `defaults` object is fully typed with no helper needed. Component keys autocomplete against the registered components, and each entry is checked against that component's props — a misspelled prop name or a wrong value type fails at compile time.

Wildcard entries are looser by necessity. Known prop names autocomplete and their values are checked (`'*element'` against the element prop surface), but unknown keys are accepted, since a wildcard spans components with different props.
