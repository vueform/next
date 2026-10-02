# Vueform UI

Official adapter for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-10-02T15:19:05.194Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform).

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

## Modules

What each module adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.78&nbsp;kB |
| `validation` | 6.72&nbsp;kB |
| `conditions` | 2.19&nbsp;kB |
| `theme` | 2.00&nbsp;kB |
| `autosave` | 1.86&nbsp;kB |
| `expression` | 1.25&nbsp;kB |
| `security` | 1.18&nbsp;kB |
| `http` | 1.08&nbsp;kB |
| `router` | 0.61&nbsp;kB |
| `locale` | 0.32&nbsp;kB |
| `date` | 0.17&nbsp;kB |
| `devtools` | 0.07&nbsp;kB |
| **Total** | 24.41&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.11&nbsp;kB |
| `validation` | 5.98&nbsp;kB |
| `conditions` | 1.93&nbsp;kB |
| `theme` | 1.73&nbsp;kB |
| `autosave` | 1.66&nbsp;kB |
| `expression` | 1.15&nbsp;kB |
| `security` | 1.02&nbsp;kB |
| `http` | 0.94&nbsp;kB |
| `router` | 0.53&nbsp;kB |
| `locale` | 0.27&nbsp;kB |
| `date` | 0.13&nbsp;kB |
| `devtools` | 0.09&nbsp;kB |
| **Total** | 21.72&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 23.58&nbsp;kB |
| `validation` | 19.97&nbsp;kB |
| `conditions` | 6.81&nbsp;kB |
| `theme` | 5.49&nbsp;kB |
| `autosave` | 5.04&nbsp;kB |
| `expression` | 3.34&nbsp;kB |
| `security` | 3.04&nbsp;kB |
| `http` | 2.79&nbsp;kB |
| `router` | 1.62&nbsp;kB |
| `locale` | 0.91&nbsp;kB |
| `date` | 0.38&nbsp;kB |
| `devtools` | 0.24&nbsp;kB |
| **Total** | 70.41&nbsp;kB |

</details>

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 5.70&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.07&nbsp;kB | 0.18&nbsp;kB |
| `VfLayout` | 2.94&nbsp;kB | 0.54&nbsp;kB |
| `VfGrid` | 2.45&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.97&nbsp;kB | 1.00&nbsp;kB |
| `VfList` | 1.54&nbsp;kB | 0.17&nbsp;kB |
| `VfFile` | 1.57&nbsp;kB | 0.04&nbsp;kB |
| `VfNav` | 1.02&nbsp;kB | 0.07&nbsp;kB |
| `VfSteps` | 0.14&nbsp;kB | 0.63&nbsp;kB |
| `VfCheckboxes` | 0.77&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.25&nbsp;kB | 0.47&nbsp;kB |
| `VfCheckbox` | 0.70&nbsp;kB | -0.01&nbsp;kB |
| `VfCol` | 0.66&nbsp;kB | 0.01&nbsp;kB |
| `VfRadio` | 0.65&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.65&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 0.52&nbsp;kB | 0.08&nbsp;kB |
| `VfSelect` | 0.48&nbsp;kB | 0.12&nbsp;kB |
| `VfTextarea` | 0.49&nbsp;kB | 0.04&nbsp;kB |
| `VfGroup` | 0.42&nbsp;kB | 0.08&nbsp;kB |
| `VfLanguages` | 0.33&nbsp;kB | 0.13&nbsp;kB |
| `VfContent` | 0.28&nbsp;kB | 0.05&nbsp;kB |
| `VfField` | 0.30&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.25&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.10&nbsp;kB | 0.12&nbsp;kB |
| `VfRow` | 0.22&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.12&nbsp;kB | 0.01&nbsp;kB |
| `VfIcon` | 0.10&nbsp;kB | -0.04&nbsp;kB |
| **Total** | 51.84&nbsp;kB | 6.49&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 4.50&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.34&nbsp;kB | 0.15&nbsp;kB |
| `VfLayout` | 2.54&nbsp;kB | 0.43&nbsp;kB |
| `VfGrid` | 1.91&nbsp;kB | -0.02&nbsp;kB |
| `VfButton` | 0.88&nbsp;kB | 0.78&nbsp;kB |
| `VfList` | 1.29&nbsp;kB | 0.14&nbsp;kB |
| `VfFile` | 1.14&nbsp;kB | 0.03&nbsp;kB |
| `VfNav` | 1.00&nbsp;kB | 0.04&nbsp;kB |
| `VfSteps` | 0.31&nbsp;kB | 0.54&nbsp;kB |
| `VfCheckboxes` | 0.16&nbsp;kB | 0.01&nbsp;kB |
| `VfAddon` | 0.29&nbsp;kB | 0.42&nbsp;kB |
| `VfCheckbox` | 0.37&nbsp;kB | -0.03&nbsp;kB |
| `VfCol` | 0.48&nbsp;kB | 0.01&nbsp;kB |
| `VfRadio` | 0.66&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.28&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 0.44&nbsp;kB | 0.07&nbsp;kB |
| `VfSelect` | 0.49&nbsp;kB | 0.10&nbsp;kB |
| `VfTextarea` | 0.45&nbsp;kB | 0.03&nbsp;kB |
| `VfGroup` | 0.44&nbsp;kB | 0.05&nbsp;kB |
| `VfLanguages` | 0.35&nbsp;kB | 0.10&nbsp;kB |
| `VfContent` | 0.24&nbsp;kB | 0.04&nbsp;kB |
| `VfField` | 0.29&nbsp;kB | -0.02&nbsp;kB |
| `VfHidden` | 0.24&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.21&nbsp;kB | 0.12&nbsp;kB |
| `VfRow` | 0.30&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.04&nbsp;kB | -0.01&nbsp;kB |
| `VfIcon` | 0.07&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 42.73&nbsp;kB | 5.62&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 18.34&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 17.72&nbsp;kB | 1.16&nbsp;kB |
| `VfLayout` | 11.91&nbsp;kB | 3.20&nbsp;kB |
| `VfGrid` | 7.97&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.73&nbsp;kB | 7.74&nbsp;kB |
| `VfList` | 8.06&nbsp;kB | 1.41&nbsp;kB |
| `VfFile` | 6.26&nbsp;kB | 0.26&nbsp;kB |
| `VfNav` | 5.27&nbsp;kB | 0.30&nbsp;kB |
| `VfSteps` | 1.66&nbsp;kB | 4.32&nbsp;kB |
| `VfCheckboxes` | 5.22&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.41&nbsp;kB | 3.87&nbsp;kB |
| `VfCheckbox` | 4.67&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.60&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 4.62&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 5.05&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 4.00&nbsp;kB | 0.53&nbsp;kB |
| `VfSelect` | 4.21&nbsp;kB | 0.78&nbsp;kB |
| `VfTextarea` | 4.07&nbsp;kB | 0.27&nbsp;kB |
| `VfGroup` | 3.28&nbsp;kB | 0.98&nbsp;kB |
| `VfLanguages` | 1.72&nbsp;kB | 1.05&nbsp;kB |
| `VfContent` | 2.11&nbsp;kB | 0.23&nbsp;kB |
| `VfField` | 2.72&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.60&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 1.53&nbsp;kB | 0.99&nbsp;kB |
| `VfRow` | 1.17&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.75&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.73&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 196.26&nbsp;kB | 48.63&nbsp;kB |

</details>

## Rules

What each rule adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.63&nbsp;kB |
| `ip` | 0.47&nbsp;kB |
| `url` | 0.46&nbsp;kB |
| `before_or_equal` | 0.45&nbsp;kB |
| `after_or_equal` | 0.45&nbsp;kB |
| `before` | 0.44&nbsp;kB |
| `after` | 0.44&nbsp;kB |
| `ipv6` | 0.41&nbsp;kB |
| `not_regex` | 0.37&nbsp;kB |
| `regex` | 0.34&nbsp;kB |
| `gte` | 0.31&nbsp;kB |
| `lte` | 0.31&nbsp;kB |
| `gt` | 0.30&nbsp;kB |
| `lt` | 0.30&nbsp;kB |
| `email` | 0.30&nbsp;kB |
| `image` | 0.30&nbsp;kB |
| `date_format` | 0.27&nbsp;kB |
| `mimes` | 0.26&nbsp;kB |
| `different` | 0.26&nbsp;kB |
| `mimetypes` | 0.26&nbsp;kB |
| `ipv4` | 0.26&nbsp;kB |
| `same` | 0.26&nbsp;kB |
| `in_array` | 0.26&nbsp;kB |
| `between` | 0.25&nbsp;kB |
| `digits_between` | 0.24&nbsp;kB |
| `file` | 0.24&nbsp;kB |
| `date` | 0.24&nbsp;kB |
| `numeric` | 0.24&nbsp;kB |
| `max` | 0.23&nbsp;kB |
| `min` | 0.23&nbsp;kB |
| `distinct` | 0.23&nbsp;kB |
| `size` | 0.23&nbsp;kB |
| `timezone` | 0.22&nbsp;kB |
| `digits` | 0.22&nbsp;kB |
| `confirmed` | 0.21&nbsp;kB |
| `integer` | 0.21&nbsp;kB |
| `date_equals` | 0.21&nbsp;kB |
| `uuid` | 0.21&nbsp;kB |
| `json` | 0.21&nbsp;kB |
| `accepted` | 0.21&nbsp;kB |
| `alpha_dash` | 0.21&nbsp;kB |
| `alpha` | 0.21&nbsp;kB |
| `alpha_num` | 0.21&nbsp;kB |
| `captcha` | 0.21&nbsp;kB |
| `boolean` | 0.20&nbsp;kB |
| `required` | 0.19&nbsp;kB |
| `filled` | 0.19&nbsp;kB |
| `in` | 0.19&nbsp;kB |
| `nullable` | 0.19&nbsp;kB |
| `array` | 0.18&nbsp;kB |
| `string` | 0.18&nbsp;kB |
| `not_in` | 0.18&nbsp;kB |
| **Total** | 3.14&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.53&nbsp;kB |
| `ip` | 0.49&nbsp;kB |
| `url` | 0.37&nbsp;kB |
| `before_or_equal` | 0.42&nbsp;kB |
| `after_or_equal` | 0.44&nbsp;kB |
| `before` | 0.37&nbsp;kB |
| `after` | 0.37&nbsp;kB |
| `ipv6` | 0.33&nbsp;kB |
| `not_regex` | 0.33&nbsp;kB |
| `regex` | 0.26&nbsp;kB |
| `gte` | 0.27&nbsp;kB |
| `lte` | 0.22&nbsp;kB |
| `gt` | 0.28&nbsp;kB |
| `lt` | 0.27&nbsp;kB |
| `email` | 0.33&nbsp;kB |
| `image` | 0.24&nbsp;kB |
| `date_format` | 0.28&nbsp;kB |
| `mimes` | 0.18&nbsp;kB |
| `different` | 0.33&nbsp;kB |
| `mimetypes` | 0.20&nbsp;kB |
| `ipv4` | 0.29&nbsp;kB |
| `same` | 0.29&nbsp;kB |
| `in_array` | 0.19&nbsp;kB |
| `between` | 0.22&nbsp;kB |
| `digits_between` | 0.21&nbsp;kB |
| `file` | 0.18&nbsp;kB |
| `date` | 0.30&nbsp;kB |
| `numeric` | 0.21&nbsp;kB |
| `max` | 0.18&nbsp;kB |
| `min` | 0.20&nbsp;kB |
| `distinct` | 0.21&nbsp;kB |
| `size` | 0.20&nbsp;kB |
| `timezone` | 0.18&nbsp;kB |
| `digits` | 0.20&nbsp;kB |
| `confirmed` | 0.15&nbsp;kB |
| `integer` | 0.14&nbsp;kB |
| `date_equals` | 0.20&nbsp;kB |
| `uuid` | 0.27&nbsp;kB |
| `json` | 0.21&nbsp;kB |
| `accepted` | 0.19&nbsp;kB |
| `alpha_dash` | 0.18&nbsp;kB |
| `alpha` | 0.16&nbsp;kB |
| `alpha_num` | 0.17&nbsp;kB |
| `captcha` | 0.18&nbsp;kB |
| `boolean` | 0.19&nbsp;kB |
| `required` | 0.16&nbsp;kB |
| `filled` | 0.15&nbsp;kB |
| `in` | 0.17&nbsp;kB |
| `nullable` | 0.15&nbsp;kB |
| `array` | 0.17&nbsp;kB |
| `string` | 0.16&nbsp;kB |
| `not_in` | 0.20&nbsp;kB |
| **Total** | 2.79&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 1.86&nbsp;kB |
| `ip` | 1.90&nbsp;kB |
| `url` | 1.08&nbsp;kB |
| `before_or_equal` | 1.40&nbsp;kB |
| `after_or_equal` | 1.40&nbsp;kB |
| `before` | 1.38&nbsp;kB |
| `after` | 1.38&nbsp;kB |
| `ipv6` | 1.70&nbsp;kB |
| `not_regex` | 1.04&nbsp;kB |
| `regex` | 0.91&nbsp;kB |
| `gte` | 0.89&nbsp;kB |
| `lte` | 0.89&nbsp;kB |
| `gt` | 0.89&nbsp;kB |
| `lt` | 0.89&nbsp;kB |
| `email` | 0.79&nbsp;kB |
| `image` | 0.85&nbsp;kB |
| `date_format` | 0.88&nbsp;kB |
| `mimes` | 0.79&nbsp;kB |
| `different` | 0.76&nbsp;kB |
| `mimetypes` | 0.78&nbsp;kB |
| `ipv4` | 0.70&nbsp;kB |
| `same` | 0.75&nbsp;kB |
| `in_array` | 0.75&nbsp;kB |
| `between` | 0.71&nbsp;kB |
| `digits_between` | 0.72&nbsp;kB |
| `file` | 0.75&nbsp;kB |
| `date` | 0.80&nbsp;kB |
| `numeric` | 0.67&nbsp;kB |
| `max` | 0.67&nbsp;kB |
| `min` | 0.67&nbsp;kB |
| `distinct` | 0.70&nbsp;kB |
| `size` | 0.68&nbsp;kB |
| `timezone` | 0.65&nbsp;kB |
| `digits` | 0.67&nbsp;kB |
| `confirmed` | 0.63&nbsp;kB |
| `integer` | 0.63&nbsp;kB |
| `date_equals` | 0.64&nbsp;kB |
| `uuid` | 0.64&nbsp;kB |
| `json` | 0.63&nbsp;kB |
| `accepted` | 0.62&nbsp;kB |
| `alpha_dash` | 0.61&nbsp;kB |
| `alpha` | 0.61&nbsp;kB |
| `alpha_num` | 0.60&nbsp;kB |
| `captcha` | 0.62&nbsp;kB |
| `boolean` | 0.61&nbsp;kB |
| `required` | 0.60&nbsp;kB |
| `filled` | 0.59&nbsp;kB |
| `in` | 0.57&nbsp;kB |
| `nullable` | 0.58&nbsp;kB |
| `array` | 0.59&nbsp;kB |
| `string` | 0.59&nbsp;kB |
| `not_in` | 0.55&nbsp;kB |
| **Total** | 10.62&nbsp;kB |

</details>

## Locales

What each locale adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.74&nbsp;kB |
| `de_DE` | 1.60&nbsp;kB |
| `en_US` | 1.30&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.54&nbsp;kB |
| `de_DE` | 1.40&nbsp;kB |
| `en_US` | 1.14&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 7.40&nbsp;kB |
| `de_DE` | 6.62&nbsp;kB |
| `en_US` | 6.45&nbsp;kB |

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