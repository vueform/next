---
outline: [2,3]
---

# Themes & Tokens

Every Vueform UI stylesheet reads its colors, spacing, borders, and typography from `--vf-*` CSS variables and defines none of them itself. A **theme** is the JavaScript map of **tokens** that fills those variables in, injected into the page when Vueform installs. The stylesheets are identical across themes and only the token values differ, so restyling means changing values, never fighting selectors — to change which classes components render instead, see [classes](/guide/classes).

## Tokens

Open any Vueform stylesheet and the contract is visible — every visual decision is a variable:

```css
.vf-input {
  color: var(--vf-input-color);
  background: var(--vf-input-bg);
  border-radius: var(--vf-input-radius);
}
```

Token keys are camelCase and map one-to-one to those variables — `inputColor` becomes `--vf-input-color`, with digits splitting into their own segment (`gray300` → `--vf-gray-300`). Kebab-case keys and full `--vf-*` names are accepted as-is too, and values are strings or numbers.

The resolved global tokens are written as `:root` declarations into a single `<style id="vueform-theme">` tag at the start of `<head>` — the same tag that carries the grid utilities — or handed to `@unhead/vue` when the app uses it. Because the tag comes first in `<head>`, any stylesheet of yours overrides it, so declaring a `--vf-*` variable in your own CSS is a valid override too, useful when the value already lives in a stylesheet.

The tag's id is configurable via [`build.styleId`](/guide/configuration#build), a CSP nonce is attached as described in [style tag nonce](/guide/security#style-tag-nonce), and server rendering extracts the same CSS via [style injection](/guide/ssr#style-injection).

## Choosing a Theme

The entry you import `createVueform` from picks the theme — `@vueform/ui/origin` bundles Origin, `@vueform/ui/material` bundles Material:

```ts
import { createVueform } from '@vueform/ui/origin'

app.use(createVueform())
```

The `theme` option replaces the entry's bundled theme wholesale, `dark` block included:

```ts
import { createVueform } from '@vueform/ui/origin'
import { material as theme } from '@vueform/ui/themes'

app.use(createVueform({ theme }))
```

In a [modular setup](/guide/code-splitting#modular-setup) the `theme` option is the only way a theme gets in, and the `theme` module from `@vueform/ui/modules` must be registered — without it no CSS is generated or injected, and `tokens` props warn once in dev.

There are no CSS imports to manage in either setup — each component entry carries its own stylesheet chunks, while `<link>` and CDN setups use the flattened `@vueform/ui/theme.css`. Bundle sizes live in [code-splitting](/guide/code-splitting#theme).

### Available Themes

| Name | Identifier | Description |
| --- | --- | --- |
| Origin | `origin` | Vueform's default look. |
| Material | `material` | In progress — currently shares Origin's token set as a placeholder. |

The identifier names both the pre-configured entry (`@vueform/ui/origin`) and the theme's export from `@vueform/ui/themes`.

## Overriding Tokens

Most projects don't need a new theme, just a handful of different values. The `tokens` option overrides individual tokens of whichever theme is active:

```ts
createVueform({
  tokens: {
    brand: '#0ea5e9',
    gutter: '1.5rem',
  },
})
```

Top-level keys replace the theme's value, omitted keys keep it, and a `dark` block merges separately with the theme's own `dark` block. The option works the same on a pre-configured entry and next to a `theme` option in a modular setup, and its reference entry lives at [`tokens`](/guide/configuration#tokens).

## Token Tiers

The built-in token set is organized in three tiers — primitive, semantic, and component — each built from [references](#token-references) to the tier below, so a change low down ripples up through everything that references it.

### Primitives

Primitives are raw values with no references — the color scale, spacing, radii, typography. Overriding one moves every token built on it. `gutter` is the motivating case — `elementsGutterY`, `elementsGutterX`, `groupGutterY`, and `listGutterY` all default to `$gutter`, so the single override [above](#overriding-tokens) moves every gap between elements, groups, and list rows, while any of the specific tokens can still be set on top.

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

Semantic tokens are purpose-named and reference primitives — `bgDisabled` feeds the disabled backgrounds of inputs and choices, `textSoft` feeds help and description text. Overriding one restyles that purpose everywhere it appears, written like any other key in the `tokens` map.

<!-- @token-table:semantic start -->
<VPSubtabs>
<VPSubtab title="Disabled Colors">

| CSS Variable | Description |
| --- | --- |
| <a id="--vf-text-disabled"></a>`--vf-text-disabled` | Text color of disabled controls. |
| <a id="--vf-bg-disabled"></a>`--vf-bg-disabled` | Background of disabled inputs and choices. |
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

### Component Tokens

Component tokens are scoped to one component group — input, button, list, and so on — and reference primitives and semantic tokens. They are the place to restyle a single component without touching the rest, and each component's reference page lists its own under a **Tokens** tab — see [`VfList`](/components/VfList#tokens) for an example.

The tiers are a convention, not a mechanism. Primitives are concrete, semantic tokens reference primitives, and component tokens reference the two tiers below them — nothing enforces the layering, but following it in your own overrides and [custom tokens](#custom-tokens) keeps every override's reach predictable.

## Token References

A `$name` inside a token value becomes `var(--vf-name)` in the generated CSS, so references compose anywhere CSS accepts a value — inside `calc()`, `color-mix()`, or nested expressions. The built-in set uses them throughout:

```ts
{
  inputBorderColor: '$gray300',
  fileGutterX: 'calc($gutter / 2)',
  btnBgPrimaryHover: 'color-mix(in srgb, $brand 100%, black 15%)',
}
```

```css
:root {
  --vf-input-border-color: var(--vf-gray-300);
  --vf-file-gutter-x: calc(var(--vf-gutter) / 2);
  --vf-btn-bg-primary-hover: color-mix(in srgb, var(--vf-brand) 100%, black 15%);
}
```

References are written in camelCase — `$borderWidthT`, never `$border-width-t` — and are accepted wherever a token value is, be it the `tokens` option, a theme, the [`tokens` prop](#per-form-and-per-element-tokens), or a [custom token](#custom-tokens).

Scoped overrides cascade through references too. CSS resolves `var()` where a variable is declared, so a `:root`-level reference would ignore a form-level override of the token it points at — Vueform therefore re-declares every dependent token on the overriding element. Set `gutter` on one form and `elementsGutterY` moves inside that form, exactly as it does globally.

The one hard rule is that references must not form a cycle — cyclic variables are invalid CSS and the browser discards them.

## Per-Form and Per-Element Tokens

The same token maps work scoped. `!VfForm` and every element — buttons included — accept a `tokens` prop that affects the component and everything rendered inside it, with a nested element's own `tokens` winning over an inherited override:

```vue
<template>
  <VfForm :tokens="{ inputBg: '#f8fafc' }">
    <VfText name="name" label="Name" />
    <VfText name="email" label="Email" :tokens="{ inputBg: '#ffffff' }" />
  </VfForm>
</template>
```

Under the hood the overrides become a per-instance `vf-t-*` class plus a small `<style>` tag rendered by the component — never inline `style` attributes — with the [CSP nonce](/guide/security#style-tag-nonce) applied when configured.

Only forms and elements take the prop. Sub-components such as `VfNav`, `VfTabs`, or `VfSteps` inherit their tokens from the surrounding form.

Because the prop is schema-reachable, keys or values that could break out of the scoped rule — a key that doesn't normalize to a plain `--vf-*` name, a value containing `{` or `}` — are dropped with a dev warning. The policy is part of security's [always-on guards](/guide/security#always-on-guards).

## Dark Mode

Each built-in theme carries a `dark` block — overrides for the gray scale and the component colors that must flip, from inputs and choices to buttons and tabular cells — emitted as a separate CSS block that applies while dark mode is active. The `darkMode` option decides when that is. The default `'system'` wraps the block in a `prefers-color-scheme: dark` media query, while a subselector emits it as `:root<subselector>`, following however your app toggles dark mode:

```ts
createVueform({
  darkMode: '.dark', // dark while <html> has the class
})
```

The selector is matched against `<html>` itself — the block becomes `:root.dark`, not a descendant rule — which fits the class-on-`html` convention of Tailwind and most theme switchers, and `'[data-theme="dark"]'` works the same way. The option reference lives at [`darkMode`](/guide/configuration#darkmode).

One caveat applies to live switching. The global block is pure CSS and follows any selector, but scoped `tokens.dark` overrides switch through a JS watcher that observes only the `class` and `data-theme` attributes of `<html>` — a selector on any other attribute leaves scoped dark overrides stuck in one mode.

Any `tokens` map — the config option, a theme, a `tokens` prop — takes a `dark` block of its own:

```ts
createVueform({
  tokens: {
    brand: '#0f766e',
    dark: {
      brand: '#14b8a6',
    },
  },
})
```

How the light and dark values relate differs by level. Globally, a light override never reaches into dark mode — the theme's own `dark` block still wins there — so a token the theme also defines under `dark` (the gray scale, for instance) needs both overrides. On forms and elements it's the reverse — the light override stays in effect in dark mode too, and the `dark` block only layers on top.

### Per-Form Dark Mode

The `dark` prop on `!VfForm` forces a single form dark (`true`) or light (`false`) regardless of the environment — a dark sidebar form in a light app, or a side-by-side preview of both modes. It requires `build.scopedDarkMode`, which emits extra `.vf-dark` and `.vf-light` CSS blocks re-declaring every token (class names configurable via `build.darkClass` and `build.lightClass`):

```ts
createVueform({
  build: { scopedDarkMode: true },
})
```

With the blocks in place, `<VfForm dark>` renders dark anywhere, and the form's own `tokens.dark` follows the prop as well. The CSS cost and the full option table live at [`build`](/guide/configuration#build).

## Custom Tokens

Token keys are open — an unknown key becomes a `--vf-*` variable on `:root` just like the built-ins, which makes the theme a natural home for app-specific values:

```ts
createVueform({
  tokens: {
    brandAccent: '#f59e0b',
    inputBorderColor: '$brandAccent',
  },
})
```

`brandAccent` is now a real variable — built-in tokens can reference it, and your own stylesheets can read it:

```css
.badge { background: var(--vf-brand-accent); }
```

### Type Augmentation

`ThemeTokens` — the type behind the `theme` and `tokens` options and the `tokens` prop — has an open index signature, so custom keys are accepted as-is. Augmenting it adds autocompletion and value typing on top, and one augmentation covers all three places:

```ts
// vueform-tokens.d.ts
declare module '@vueform/core' {
  interface ThemeTokens {
    brandAccent?: string
  }
}
```

## Custom Themes

When overrides grow into a reusable look shared across apps, package them as a theme and pass it to the [`theme` option](#choosing-a-theme).

### Extending a Theme

`!extendTheme` layers overrides on top of an existing theme and returns a new one without mutating the base — the same merge the `tokens` option performs, for when the result should live in its own module:

```ts
import { extendTheme, origin } from '@vueform/ui/themes'

export const corporate = extendTheme(origin, {
  brand: '#0f766e',
  radius: '0px',
  dark: {
    brand: '#14b8a6',
  },
})
```

Pass the result to the `theme` option like any built-in theme.

### Creating a Theme from Scratch

The `defineTheme` helper exported from `@vueform/ui/themes` types a complete theme. Every built-in token is required — a mistyped key surfaces as the real one missing — values are `string | number`, and an explicit `dark` block is required, with `{}` opting out of a dark variant. Extra custom tokens are accepted alongside the built-in set:

```ts
import { defineTheme } from '@vueform/ui/themes' // [!code unlink:defineTheme]

export const slate = defineTheme({ // [!code unlink:defineTheme]
  brand: '#334155',
  gutter: '1rem',
  // …the rest of the token set
  dark: {},
})
```

### Custom Token Structures

The root `!defineTheme` from `@vueform/ui` accepts any token vocabulary and only requires the `dark` block — for a visual layer of your own stylesheets rather than the built-in ones. It also keeps the built-in keys out of autocompletion, so nothing suggests tokens your stylesheets never read. For a theme the built-in stylesheets consume, prefer the `/themes` variant, whose completeness check guarantees no variable is left undefined.

Teach the editor your structure with `!InferThemeTokens` — the [type augmentation](#type-augmentation) technique, derived from the theme itself. Declaring it in the theme's module means importing the theme brings the typing along:

```ts
import { defineTheme, type InferThemeTokens } from '@vueform/ui'

export const visual = defineTheme({
  surface: '#ffffff',
  accent: '#f59e0b',
  dark: {
    surface: '#111827',
  },
})

declare module '@vueform/core' {
  interface ThemeTokens extends InferThemeTokens<typeof visual> {}
}
```

This is the same augmentation the `@vueform/ui/themes` entry performs for the built-in token structure.
