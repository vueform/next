---
outline: [2,3]
---

# Themes & Tokens

Vueform UI is the default adapter of Vueform — instead of wrapping an external UI library, it ships its own form components built on native HTML inputs (`<input>`, `<textarea>`, `<select>`, etc.) plus structural components for layout, grouping, repeating, and multi-step navigation. This chapter covers how to style them — picking a **theme**, then customizing it through **tokens**, from single-value overrides to complete custom themes. To change _which classes_ the components render — rather than the values behind them — see [Classes](/guide/classes).

## What Are Themes?

A theme is a set of [**tokens**](#tokens) — named values that fill in the CSS variables Vueform's stylesheets are built on.

Every Vueform component ships its own CSS, and that CSS delegates everything you might want to customize — colors, spacing, borders, typography — to `--vf-*` CSS variables:

```css
.vf-input {
  color: var(--vf-input-color);
  background: var(--vf-input-bg);
  border-color: var(--vf-input-border-color);
  border-radius: var(--vf-input-radius);
  /* ... */
}
```

The variables are undefined on their own — the theme's tokens are what give them values. Tokens are set in the config when installing Vueform:

```ts
createVueform({
  tokens: {
    inputColor: '#334155',
    inputBg: '#ffffff',
    inputBorderColor: '#cbd5e1',
    inputRadius: '0.375rem',
  },
})
```

…or, since they end up as ordinary CSS variables, in plain CSS:

```css
:root {
  --vf-input-color: #334155;
  --vf-input-bg: #ffffff;
  --vf-input-border-color: #cbd5e1;
  --vf-input-radius: 0.375rem;
}
```

The two are equivalent because at runtime Vueform transforms the JS tokens into exactly these CSS variables and injects them in a `<style>` tag at the start of `<head>` — placed there so your own stylesheets can always override them.

## Choosing a Theme

Themes are selected by the entry point `createVueform` is imported from. Importing it from `@vueform/ui/origin` sets up Vueform with the **Origin** theme:

```ts nolink=createVueform
import App from './App.vue'
import { createApp } from 'vue'
import { createVueform } from '@vueform/ui/origin' // [!code highlight]

const app = createApp(App)
app.use(createVueform())
app.mount('#app')
```

With a modular setup — assembling `createVueform` from individual subpaths instead of a pre-configured entry point — the same choice is made by passing a theme to the `theme` option:

```ts
import { createVueform } from '@vueform/ui'
import { material as theme } from '@vueform/ui/themes'

createVueform({
  theme,
  // components, modules, rules, locales…
})
```

The `theme` option also works on the pre-configured entries: it replaces the entry's bundled theme wholesale, so passing `material` to the `@vueform/ui/origin` entry switches themes without changing the import.

::: tip No CSS imports?
None needed — the CSS ships with the components: each one imports exactly the chunks its markup needs. The stylesheets are identical across themes; only the token values differ. Non-bundler setups (`<link>` tags, the CDN build) can use the flattened `@vueform/ui/theme.css` instead.
:::

### Available Themes

Two built-in themes ship today:

| Name         | Identifier | Description                                      |
| ------------ | ---------- | ------------------------------------------------ |
| **Origin**   | `origin`   | Carries forward the look and feel of Vueform v1. |
| **Material** | `material` | A Material Design–inspired look.                 |

The identifier is how a theme is selected in either setup: it names the pre-configured entry point (`@vueform/ui/identifier`) as well as the theme's export from `@vueform/ui/themes` (`import { identifier } from '@vueform/ui/themes'`).

## Tokens

Tokens are the JS counterpart of CSS variables — typed camelCase keys that map one-to-one to the `--vf-*` variables (`gutter` becomes `--vf-gutter`, `formErrorsColor` becomes `--vf-form-errors-color`, and so on):

```ts
{
  formErrorsColor: '#ef4444',
  formErrorsBg: '#fee2e2',
  // ...
}
```

At runtime, Vueform converts them into CSS variables and injects them into the page:

```css
:root {
  --vf-form-errors-color: #ef4444;
  --vf-form-errors-bg: #fee2e2;
}
```

This lets you drive the entire visual surface from JS — build presets, store them in a database, swap them per user — without writing CSS.

### Overriding Tokens

Most projects need to tweak only a handful of tokens — a brand color, a gutter, a border radius. Pass those overrides to the `tokens` config option and the rest of the bundled theme stays in place:

```ts
import { createVueform } from '@vueform/ui/origin'

createVueform({
  tokens: {
    brand: '#5b21b6',
    gutter: '1.5rem',
    elementsGutterY: '2rem',
  },
})
```

The `tokens` object is shallow-merged on top of the theme's defaults — every key you provide replaces its default, every key you omit keeps the theme's value. Being plain JS, the overrides are type-checked and travel with your config.

With a modular setup there is no bundled theme to merge onto — pass the base map via the `theme` option and your overrides work exactly the same way:

```ts
import { createVueform } from '@vueform/ui'
import { origin as theme } from '@vueform/ui/themes'

createVueform({
  theme,
  tokens: {
    brand: '#5b21b6',
    gutter: '1.5rem',
    elementsGutterY: '2rem',
  },
})
```

Since tokens end up as ordinary CSS variables, the equivalent CSS override works just as well — useful when the value already lives in your stylesheet:

```css
:root {
  --vf-brand: #5b21b6;
  --vf-gutter: 1.5rem;
  --vf-elements-gutter-y: 2rem;
}
```

## Token Tiers

Vueform organizes its tokens into three tiers — **primitive**, **semantic**, and **component** tokens. Each tier builds on the one below it, creating a cascade where changing a single value at a lower tier ripples through every token that references it.

### Primitives

Most layout values share a sensible default. The vertical gap between elements (`--vf-elements-gutter-y`), the horizontal gap (`--vf-elements-gutter-x`), the gap inside `VfGroup` (`--vf-group-gutter-y`), the gap between list rows (`--vf-list-gutter-y`) — they all start out at the same value, because in most apps they should match.

Instead of overriding every one of those variables individually, you can change a single **primitive** — a base token that the more specific variables reference. The general gutter primitive is `--vf-gutter`, and updating it cascades to every place that uses it as a default:

```ts
createVueform({
  tokens: {
    gutter: '1.5rem',
  },
})
```

The component-specific variables still take precedence when set explicitly, so you can override the global gutter and still bump `--vf-elements-gutter-y` separately.

The full list of primitives is below, grouped by purpose.

<!-- @token-table:primitives start -->
<VPSubtabs>
<VPSubtab title="Color">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-brand"></a>`--vf-brand` | Brand primary color. |
| <a id="--vf-red"></a>`--vf-red` | Red accent color used for danger and error states. |
| <a id="--vf-green"></a>`--vf-green` | Green accent color used for success states. |
| <a id="--vf-sky"></a>`--vf-sky` | Sky blue accent color used for info states. |
| <a id="--vf-orange"></a>`--vf-orange` | Orange accent color used for warning states. |
| <a id="--vf-purple"></a>`--vf-purple` | Purple accent color used for help states. |
| <a id="--vf-white"></a>`--vf-white` | White. |
| <a id="--vf-black"></a>`--vf-black` | Black. |
| <a id="--vf-gray-50"></a>`--vf-gray-50` | Neutral gray, 5% dark. |
| <a id="--vf-gray-100"></a>`--vf-gray-100` | Neutral gray, 10% dark. |
| <a id="--vf-gray-200"></a>`--vf-gray-200` | Neutral gray, 20% dark. |
| <a id="--vf-gray-300"></a>`--vf-gray-300` | Neutral gray, 30% dark. |
| <a id="--vf-gray-400"></a>`--vf-gray-400` | Neutral gray, 40% dark. |
| <a id="--vf-gray-500"></a>`--vf-gray-500` | Neutral gray, 50% dark. |
| <a id="--vf-gray-600"></a>`--vf-gray-600` | Neutral gray, 60% dark. |
| <a id="--vf-gray-700"></a>`--vf-gray-700` | Neutral gray, 70% dark. |
| <a id="--vf-gray-800"></a>`--vf-gray-800` | Neutral gray, 80% dark. |
| <a id="--vf-gray-900"></a>`--vf-gray-900` | Neutral gray, 90% dark. |

</VPSubtab>
<VPSubtab title="Spacing">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-gutter"></a>`--vf-gutter` | Default gutter used between elements, groups, list rows, and grid cells. |
| <a id="--vf-space-1"></a>`--vf-space-1` | Small spacing unit. |
| <a id="--vf-space-2"></a>`--vf-space-2` | Medium spacing unit. |
| <a id="--vf-space-3"></a>`--vf-space-3` | Large spacing unit. |
| <a id="--vf-space-hr"></a>`--vf-space-hr` | Vertical spacing around horizontal rules. |
| <a id="--vf-px"></a>`--vf-px` | Default horizontal padding for inputs and buttons. |
| <a id="--vf-py"></a>`--vf-py` | Default vertical padding for inputs and buttons. |

</VPSubtab>
<VPSubtab title="Border">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-border-width-t"></a>`--vf-border-width-t` | Top border width. |
| <a id="--vf-border-width-r"></a>`--vf-border-width-r` | Right border width. |
| <a id="--vf-border-width-b"></a>`--vf-border-width-b` | Bottom border width. |
| <a id="--vf-border-width-l"></a>`--vf-border-width-l` | Left border width. |
| <a id="--vf-radius"></a>`--vf-radius` | Default border radius. |
| <a id="--vf-radius-sm"></a>`--vf-radius-sm` | Smaller border radius for tight elements. |
| <a id="--vf-radius-lg"></a>`--vf-radius-lg` | Larger border radius for loose elements. |

</VPSubtab>
<VPSubtab title="Icons">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-icon-add"></a>`--vf-icon-add` | SVG used for "add" affordances (e.g. list add buttons). |
| <a id="--vf-icon-remove"></a>`--vf-icon-remove` | SVG used for "remove" affordances. |
| <a id="--vf-icon-sort"></a>`--vf-icon-sort` | SVG used for the list sort handle. |
| <a id="--vf-icon-loading"></a>`--vf-icon-loading` | SVG used for the loading spinner. |

</VPSubtab>
</VPSubtabs>
<!-- @token-table:primitives end -->

### Semantic Tokens

Sitting between primitives and components is a tier of **semantic tokens**. They describe a purpose ("the disabled background", "the color of links") rather than a raw value, and they reference primitives — never component variables.

Semantic tokens let you change every place that shares a role at once, without touching individual components. Updating `--vf-text-disabled` reflows through every component that renders disabled text — inputs, choices, and buttons alike.

The full list of semantic tokens:

<!-- @token-table:semantic start -->
<VPSubtabs>
<VPSubtab title="Disabled Colors">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-text-disabled"></a>`--vf-text-disabled` | Text color of disabled controls. |
| <a id="--vf-bg-disabled"></a>`--vf-bg-disabled` | Background of disabled inputs, choices, and buttons. |
| <a id="--vf-border-disabled"></a>`--vf-border-disabled` | Border color of disabled inputs and choices. |

</VPSubtab>
<VPSubtab title="Text Colors">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-text-soft"></a>`--vf-text-soft` | Muted text color used by help and description. |
| <a id="--vf-link-color"></a>`--vf-link-color` | Color used for links inside form text. |

</VPSubtab>
<VPSubtab title="Size">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-icon-width"></a>`--vf-icon-width` | Default width for inline icons. |
| <a id="--vf-icon-height"></a>`--vf-icon-height` | Default height for inline icons. |

</VPSubtab>
</VPSubtabs>
<!-- @token-table:semantic end -->

Override semantic tokens the same way as primitives:

```ts
createVueform({
  tokens: {
    textSoft: '#8b8b8b',
    linkColor: '#5b21b6',
  },
})
```

### Component Tokens

Component tokens are scoped to a single Vueform component — `VfForm`, `VfList`, `VfGroup`, and so on. They reference semantic and primitive tokens (never other components' tokens), which lets you customize a single component without rippling through the rest of the form.

Component tokens are listed on each component's reference page under its **Tokens** tab. For the form-level layout tokens (errors box, messages box, elements gutter, etc.) see [VfForm Tokens](/components/VfForm#tokens). For the gap and dragging behavior of repeaters see [VfList Tokens](/components/VfList#tokens). The same pattern applies to every component.

## Token References

Tokens can reference other tokens with the `$tokenName` syntax. Each `$ref` is rewritten to the matching `var(--vf-*)` at generation time, which means references compose anywhere a CSS value is allowed — including inside `calc()`, `color-mix()`, `min()`, `max()`, and nested expressions:

```ts
createVueform({
  tokens: {
    inputBorderColor: '$gray300',
    fileGutterX: 'calc($gutter / 2)',
    addonRadius: 'calc($radius - $borderWidthT)',
    btnBgPrimaryHover: 'color-mix(in srgb, $brand 100%, black 15%)',
    labelGroupHPadding: 'calc($py + $borderWidthT) 0 0 0',
  },
})
```

Vueform replaces every `$name` with `var(--vf-name)` when it emits the CSS, so the generated rules read exactly as you'd write them by hand:

```css
:root {
  --vf-input-border-color: var(--vf-gray-300);
  --vf-file-gutter-x: calc(var(--vf-gutter) / 2);
  --vf-addon-radius: calc(var(--vf-radius) - var(--vf-border-width-t));
  --vf-btn-bg-primary-hover: color-mix(in srgb, var(--vf-brand) 100%, black 15%);
  --vf-label-group-h-padding: calc(var(--vf-py) + var(--vf-border-width-t)) 0 0 0;
}
```

The `$` syntax also works in custom tokens you add yourself and in `tokens` overrides on forms or elements — anywhere a token value is accepted.

::: warning Convention, not a constraint
Vueform's own tokens follow a one-way hierarchy:

- **Primitives** are concrete values. They never reference other tokens.
- **Semantic tokens** only reference primitives.
- **Component tokens** only reference primitives and semantic tokens — never other component tokens (not even ones in the same group).

Nothing enforces this — references resolve at any tier, and overriding a token cascades into every token that references it, in global and per-form/per-element overrides alike. Treat the hierarchy as a convention worth following in your own tokens: it keeps an override's blast radius predictable (changing an input token restyles inputs, not buttons). The one hard rule is that references must never form a cycle — circular references make the affected CSS variables invalid.
:::

## Per-Form and Per-Element Tokens

The same shape can be set on `VfForm` and on individual elements via the `tokens` prop. Tokens applied this way affect the component they are set on and everything rendered inside it — for input elements that's just the element itself, while for `VfForm` and container elements (groups, lists, grids) the override cascades to every nested element. A nested element's own `tokens` still wins over an inherited override:

::: code-group

```ts [Schema]
import { defineSchema, useForm } from '@vueform/ui'

const schema = defineSchema({
  name: { type: 'text', label: 'Name' },
  email: {
    type: 'text',
    label: 'Email',
    tokens: { inputBorderColor: '#5b21b6' },
  },
})

const [MyForm] = useForm({
  schema,
  tokens: { elementsGutterY: '2rem' },
})
```

```vue [Template]
<VfForm :tokens="{ elementsGutterY: '2rem' }">
  <VfText name="name" label="Name" />
  <VfText
    name="email"
    label="Email"
    :tokens="{ inputBorderColor: '#5b21b6' }"
  />
</VfForm>
```

:::

Under the hood, global tokens are converted to CSS variables and injected as a single `<style id="vueform-theme">` tag at the _start_ of `<head>`, so your own stylesheets can always override them.

Form- and element-level tokens generate a **scoped class** on that instance instead, keeping the override local. If your app runs under a strict Content Security Policy, pass a [`nonce`](/guide/configuration#nonce) for the injected tag — see [Style Tag Nonce](/guide/security#style-tag-nonce).

::: tip
JS tokens are accepted on **forms and elements only**. Sub-components (`VfNav`, `VfTabs`, `VfSteps`, etc.) inherit from the surrounding form. This keeps the surface small — every Vueform component is meant to live inside a form or element, so those two levels are enough to drive the styling.
:::

## Dark Mode

Vueform's theme has a built-in dark variant. How dark mode is detected is controlled by the `darkMode` config option:

```ts
createVueform({
  darkMode: 'system',
})
```

- `'system'` (default) — follows the OS preference via `prefers-color-scheme: dark`. The dark CSS block is emitted inside an `@media` query.
- A CSS subselector (`'.dark'`, `'[data-theme="dark"]'`, etc.) — Vueform watches `<html>` for that class or attribute and switches when it appears.

```ts
createVueform({
  darkMode: '.dark',
})
```

When dark mode is active, every level that accepts `tokens` (global config, form, element) can supply a `dark` block. Tokens inside `dark` override their light values for that scope:

```ts
createVueform({
  tokens: {
    brand: '#5b21b6',
    dark: {
      brand: '#a78bfa',
    },
  },
})
```

The same shape applies to a form's `tokens` prop or an element's `tokens` prop. The `dark` block is merged separately from the light tokens, so you can extend either side independently — but overrides on a token's light value do **not** automatically apply to its dark value.

The base theme already provides dark counterparts for many tokens, and they keep shining through unless you override them inside `dark` too. For example, replacing the gray palette only takes effect in light mode — the original dark grays from the theme are still in use.

Whenever a token has both a light and a dark default, override both.

## Custom Tokens

The `tokens` option does not enforce a closed list of keys. Any extra token you add is generated as a `--vf-*` CSS variable on `:root`, alongside the built-in ones. Use this for tokens that are specific to your app's UI — page-level brand colors, custom spacings, semantic accents, anything.

Add the token in your config:

```ts
createVueform({
  tokens: {
    brandAccent: '#f59e0b',
  },
})
```

Vueform emits the corresponding CSS variable — camelCase becomes kebab-case with the `--vf-` prefix:

```css
:root {
  --vf-brand-accent: #f59e0b;
}
```

You can now reference it from any CSS in your project:

```css
.my-banner {
  background: var(--vf-brand-accent);
}
```

…and from other tokens via the `$` reference syntax:

```ts
createVueform({
  tokens: {
    brandAccent: '#f59e0b',
    inputBorderColor: '$brandAccent',
  },
})
```

### Type Augmentation

Custom tokens are accepted at runtime out of the box, but your editor will not know about them by default. To get autocompletion and type checking for custom keys, augment the `ThemeTokens` interface in a `.d.ts` file:

```ts
declare module '@vueform/core' {
  interface ThemeTokens {
    brandAccent?: string
    inputBorderBrand?: string
  }
}
```

`ThemeTokens` describes the full theme shape — primitives, semantic, and component tokens. It types the `theme` and `tokens` config options on `createVueform` as well as the `tokens` prop on forms and elements, so one augmentation covers every place a token can be set.

## Custom Themes

The `tokens` option covers per-project tweaks. When the overrides grow into something reusable — a company-wide look shared by several apps — capture them as a **theme**: a complete token set passed to the `theme` config option.

### Extending a Theme

The `!extendTheme` helper layers overrides on top of an existing theme and returns a new one, without mutating the base:

```ts
import { createVueform } from '@vueform/ui'
import { extendTheme } from '@vueform/ui'
import { origin } from '@vueform/ui/themes'

const corporate = extendTheme(origin, {
  brand: '#5b21b6',
  radius: '0.5rem',
  dark: {
    brand: '#a78bfa',
  },
})

createVueform({
  theme: corporate,
})
```

In fact, the `tokens` option is exactly this — internally Vueform calls `extendTheme` with your overrides on top of the base theme. Reaching for `extendTheme` yourself only becomes interesting when the result should live in its own module and be shared as a theme of its own.

### Creating a Theme from Scratch

To author a theme from scratch — every token defined by you, no base — use `!defineTheme` from the adapter's `/themes` entry. It **enforces completeness**: every token of the built-in themes must be defined (a missing or mistyped key is a type error — mistyping a key means the real one goes missing), and an explicit `dark` block is required (pass `{}` to opt out of a dark variant). Custom tokens beyond the built-in set are accepted:

```ts
import { createVueform } from '@vueform/ui'
import { defineTheme } from '@vueform/ui/themes'

const corporate = defineTheme({
  brand: '#5b21b6',
  gutter: '1rem',
  radius: '0.375rem',
  inputColor: '$gray900',
  // …the rest of the token set
  dark: {
    inputColor: '$gray100',
    // …dark overrides
  },
})

createVueform({
  theme: corporate,
})
```

### Custom Token Structures

For the advanced case where you replace the visual layer entirely — your own stylesheets, defining their own tokens — the root entry (`@vueform/ui`) exports a structure-agnostic `defineTheme`. It accepts any token vocabulary and only requires the explicit `dark` block. Since you're not using the built-in tokens, the root import also keeps them out of your editor: no `brand` or `inputColor` suggestions mixed into your own vocabulary. For a theme that the adapter's built-in stylesheets will consume, always prefer the `/themes` variant — its completeness check is what guarantees no CSS variable is left undefined.

Out of the box your editor won't know your custom keys either — no autocompletion or type checking on the `tokens` config option or the per-component `tokens` prop. To teach it your structure, extend `ThemeTokens` with the keys inferred from your theme via `!InferThemeTokens` — the same [type augmentation](#type-augmentation) technique used for custom tokens, only derived from the theme instead of written by hand:

```ts
import { createVueform, defineTheme, type InferThemeTokens } from '@vueform/ui'

const custom = defineTheme({
  surface: '#ffffff',
  ink: '#111827',
  spacing: '1rem',
  dark: {
    surface: '#111827',
    ink: '#f9fafb',
  },
})

declare module '@vueform/core' {
  interface ThemeTokens extends InferThemeTokens<typeof custom> {}
}

createVueform({
  theme: custom,
})
```

This is exactly what the built-in `/themes` entries do for `origin` and `material` — that block is why their token keys show up in your editor in the first place; here you repeat the pattern for your own structure. Keep the theme and its `declare module` block in the same file (e.g. `theme.ts`): everything that imports your theme then gets the editor support along with it.
