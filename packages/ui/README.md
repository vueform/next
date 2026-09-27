# Vueform UI

Official adapter for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-09-27T07:05:36.357Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform).

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.43`
- `vite@7.3.6`
- `@vueform/core@2.0.0-alpha.1`
- `@vueform/ui@2.0.0-alpha.1`

## How to interpret results

In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.

## Core

The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.

|  | JS |
| --- | --- |
| Gzip | 4.59&nbsp;kB |
| Brotli | 4.13&nbsp;kB |
| Raw | 11.72&nbsp;kB |

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 5.66&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.07&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 2.95&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 2.40&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 1.54&nbsp;kB | 0.00&nbsp;kB |
| `VfFile` | 1.54&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 1.03&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.99&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxes` | 0.78&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.70&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 0.66&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.65&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.63&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 0.52&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.49&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.48&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.42&nbsp;kB | 0.00&nbsp;kB |
| `VfLanguages` | 0.34&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.28&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.28&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.22&nbsp;kB | 0.00&nbsp;kB |
| `VfSteps` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.12&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.10&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.10&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 51.75&nbsp;kB | 0.00&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 4.32&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.19&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 2.31&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 1.59&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 1.00&nbsp;kB | 0.00&nbsp;kB |
| `VfFile` | 0.97&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 0.78&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.73&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxes` | 0.12&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.23&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 0.24&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.00&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.31&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 0.20&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.29&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.27&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.24&nbsp;kB | 0.00&nbsp;kB |
| `VfLanguages` | 0.19&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.13&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.14&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.10&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.05&nbsp;kB | 0.00&nbsp;kB |
| `VfSteps` | -0.08&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | -0.07&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | -0.03&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | -0.08&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 42.48&nbsp;kB | 0.00&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 18.34&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 17.72&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 11.93&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 7.81&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 8.06&nbsp;kB | 0.00&nbsp;kB |
| `VfFile` | 6.26&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 5.27&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.73&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxes` | 5.22&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 4.67&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 4.62&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 5.05&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.45&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 4.00&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 4.07&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 4.21&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 3.28&nbsp;kB | 0.00&nbsp;kB |
| `VfLanguages` | 1.72&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 2.11&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 2.72&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.41&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.60&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 1.17&nbsp;kB | 0.00&nbsp;kB |
| `VfSteps` | 1.66&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.75&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 1.53&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.73&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 195.96&nbsp;kB | 0.00&nbsp;kB |

</details>

## Themes

What a theme's token definitions add to the bundle.

<details open>
<summary><h3>Gzip</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 4.02&nbsp;kB |
| `origin` | 4.02&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 3.43&nbsp;kB |
| `origin` | 3.42&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 17.40&nbsp;kB |
| `origin` | 17.39&nbsp;kB |

</details>

<!--@size-end-->