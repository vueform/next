# Vueform UI

Official adapter for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-10-16T07:41:53.887Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform).

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.43`
- `vite@8.3.2`
- `@vueform/core@2.0.0-0.7`
- `@vueform/ui@2.0.0-0.7`

## How to interpret results

In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.

## Core

The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.

|  | JS |
| --- | --- |
| Gzip | 4.26&nbsp;kB |
| Brotli | 3.82&nbsp;kB |
| Raw | 11.35&nbsp;kB |

## Modules

What each module adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 7.50&nbsp;kB |
| `validation` | 5.99&nbsp;kB |
| `theme` | 2.06&nbsp;kB |
| `conditions` | 2.01&nbsp;kB |
| `autosave` | 1.98&nbsp;kB |
| `security` | 1.60&nbsp;kB |
| `expression` | 1.25&nbsp;kB |
| `http` | 0.97&nbsp;kB |
| `router` | 0.59&nbsp;kB |
| `locale` | 0.28&nbsp;kB |
| `date` | 0.14&nbsp;kB |
| **Total** | 23.64&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 6.94&nbsp;kB |
| `validation` | 5.37&nbsp;kB |
| `theme` | 1.71&nbsp;kB |
| `conditions` | 1.79&nbsp;kB |
| `autosave` | 1.79&nbsp;kB |
| `security` | 1.39&nbsp;kB |
| `expression` | 1.08&nbsp;kB |
| `http` | 0.88&nbsp;kB |
| `router` | 0.46&nbsp;kB |
| `locale` | 0.17&nbsp;kB |
| `date` | 0.04&nbsp;kB |
| **Total** | 21.04&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Module | JS |
| --- | --- |
| `model` | 23.77&nbsp;kB |
| `validation` | 19.13&nbsp;kB |
| `theme` | 5.85&nbsp;kB |
| `conditions` | 6.68&nbsp;kB |
| `autosave` | 5.51&nbsp;kB |
| `security` | 4.31&nbsp;kB |
| `expression` | 3.58&nbsp;kB |
| `http` | 2.72&nbsp;kB |
| `router` | 1.58&nbsp;kB |
| `locale` | 0.90&nbsp;kB |
| `date` | 0.37&nbsp;kB |
| **Total** | 71.97&nbsp;kB |

</details>

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 5.72&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 4.08&nbsp;kB | 0.18&nbsp;kB |
| `VfLayout` | 2.97&nbsp;kB | 0.55&nbsp;kB |
| `VfGrid` | 2.37&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 1.02&nbsp;kB | 0.99&nbsp;kB |
| `VfList` | 1.54&nbsp;kB | 0.17&nbsp;kB |
| `VfFile` | 1.61&nbsp;kB | 0.04&nbsp;kB |
| `VfNav` | 1.05&nbsp;kB | 0.07&nbsp;kB |
| `VfSteps` | 0.17&nbsp;kB | 0.63&nbsp;kB |
| `VfCheckboxes` | 0.79&nbsp;kB | -0.01&nbsp;kB |
| `VfAddon` | 0.29&nbsp;kB | 0.47&nbsp;kB |
| `VfCheckbox` | 0.75&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.72&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 0.66&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.60&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.44&nbsp;kB | 0.12&nbsp;kB |
| `VfText` | 0.43&nbsp;kB | 0.09&nbsp;kB |
| `VfGroup` | 0.44&nbsp;kB | 0.08&nbsp;kB |
| `VfTextarea` | 0.48&nbsp;kB | 0.04&nbsp;kB |
| `VfLanguages` | 0.37&nbsp;kB | 0.13&nbsp;kB |
| `VfField` | 0.39&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.32&nbsp;kB | 0.04&nbsp;kB |
| `VfHidden` | 0.27&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.25&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.13&nbsp;kB | 0.12&nbsp;kB |
| `VfIcon` | 0.14&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 49.21&nbsp;kB | 6.48&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 4.32&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.23&nbsp;kB | 0.16&nbsp;kB |
| `VfLayout` | 2.44&nbsp;kB | 0.47&nbsp;kB |
| `VfGrid` | 1.70&nbsp;kB | 0.02&nbsp;kB |
| `VfButton` | 0.87&nbsp;kB | 0.79&nbsp;kB |
| `VfList` | 1.16&nbsp;kB | 0.16&nbsp;kB |
| `VfFile` | 1.03&nbsp;kB | 0.04&nbsp;kB |
| `VfNav` | 0.92&nbsp;kB | 0.08&nbsp;kB |
| `VfSteps` | 0.14&nbsp;kB | 0.57&nbsp;kB |
| `VfCheckboxes` | 0.24&nbsp;kB | 0.02&nbsp;kB |
| `VfAddon` | 0.24&nbsp;kB | 0.45&nbsp;kB |
| `VfCheckbox` | 0.32&nbsp;kB | 0.01&nbsp;kB |
| `VfCol` | 0.42&nbsp;kB | 0.01&nbsp;kB |
| `VfRadio` | 0.41&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.13&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.39&nbsp;kB | 0.12&nbsp;kB |
| `VfText` | 0.31&nbsp;kB | 0.09&nbsp;kB |
| `VfGroup` | 0.32&nbsp;kB | 0.08&nbsp;kB |
| `VfTextarea` | 0.46&nbsp;kB | 0.04&nbsp;kB |
| `VfLanguages` | 0.29&nbsp;kB | 0.13&nbsp;kB |
| `VfField` | 0.22&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.30&nbsp;kB | 0.03&nbsp;kB |
| `VfHidden` | 0.14&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.19&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.12&nbsp;kB | 0.10&nbsp;kB |
| `VfIcon` | 0.24&nbsp;kB | 0.01&nbsp;kB |
| `VfElements` | 0.05&nbsp;kB | 0.02&nbsp;kB |
| **Total** | 40.42&nbsp;kB | 5.63&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 18.05&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 17.63&nbsp;kB | 1.16&nbsp;kB |
| `VfLayout` | 11.87&nbsp;kB | 3.18&nbsp;kB |
| `VfGrid` | 7.76&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.73&nbsp;kB | 7.67&nbsp;kB |
| `VfList` | 7.96&nbsp;kB | 1.38&nbsp;kB |
| `VfFile` | 6.17&nbsp;kB | 0.26&nbsp;kB |
| `VfNav` | 5.22&nbsp;kB | 0.30&nbsp;kB |
| `VfSteps` | 1.65&nbsp;kB | 4.31&nbsp;kB |
| `VfCheckboxes` | 5.17&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.40&nbsp;kB | 3.92&nbsp;kB |
| `VfCheckbox` | 4.63&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.58&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 4.56&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 5.01&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 4.14&nbsp;kB | 0.76&nbsp;kB |
| `VfText` | 3.90&nbsp;kB | 0.83&nbsp;kB |
| `VfGroup` | 3.25&nbsp;kB | 0.97&nbsp;kB |
| `VfTextarea` | 4.00&nbsp;kB | 0.25&nbsp;kB |
| `VfLanguages` | 1.70&nbsp;kB | 1.05&nbsp;kB |
| `VfField` | 2.70&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 2.10&nbsp;kB | 0.23&nbsp;kB |
| `VfHidden` | 1.59&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 1.14&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 1.51&nbsp;kB | 0.99&nbsp;kB |
| `VfIcon` | 0.72&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.74&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 193.90&nbsp;kB | 48.88&nbsp;kB |

</details>

## Rules

What each rule adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.60&nbsp;kB |
| `ip` | 0.46&nbsp;kB |
| `url` | 0.45&nbsp;kB |
| `not_regex` | 0.42&nbsp;kB |
| `before_or_equal` | 0.42&nbsp;kB |
| `after_or_equal` | 0.42&nbsp;kB |
| `regex` | 0.41&nbsp;kB |
| `before` | 0.41&nbsp;kB |
| `after` | 0.41&nbsp;kB |
| `ipv6` | 0.40&nbsp;kB |
| `email` | 0.29&nbsp;kB |
| `gte` | 0.29&nbsp;kB |
| `image` | 0.29&nbsp;kB |
| `lte` | 0.29&nbsp;kB |
| `gt` | 0.28&nbsp;kB |
| `lt` | 0.28&nbsp;kB |
| `mimes` | 0.27&nbsp;kB |
| `mimetypes` | 0.26&nbsp;kB |
| `date_format` | 0.25&nbsp;kB |
| `ipv4` | 0.25&nbsp;kB |
| `different` | 0.25&nbsp;kB |
| `same` | 0.24&nbsp;kB |
| `in_array` | 0.24&nbsp;kB |
| `date` | 0.23&nbsp;kB |
| `file` | 0.23&nbsp;kB |
| `between` | 0.22&nbsp;kB |
| `digits_between` | 0.22&nbsp;kB |
| `numeric` | 0.22&nbsp;kB |
| `distinct` | 0.21&nbsp;kB |
| `timezone` | 0.21&nbsp;kB |
| `max` | 0.21&nbsp;kB |
| `min` | 0.21&nbsp;kB |
| `size` | 0.20&nbsp;kB |
| `digits` | 0.20&nbsp;kB |
| `alpha_dash` | 0.20&nbsp;kB |
| `uuid` | 0.20&nbsp;kB |
| `confirmed` | 0.20&nbsp;kB |
| `accepted` | 0.20&nbsp;kB |
| `json` | 0.20&nbsp;kB |
| `alpha_num` | 0.19&nbsp;kB |
| `captcha` | 0.19&nbsp;kB |
| `in` | 0.19&nbsp;kB |
| `integer` | 0.19&nbsp;kB |
| `date_equals` | 0.19&nbsp;kB |
| `boolean` | 0.19&nbsp;kB |
| `alpha` | 0.19&nbsp;kB |
| `not_in` | 0.19&nbsp;kB |
| `required` | 0.18&nbsp;kB |
| `filled` | 0.18&nbsp;kB |
| `array` | 0.17&nbsp;kB |
| `nullable` | 0.17&nbsp;kB |
| `string` | 0.17&nbsp;kB |
| **Total** | 3.19&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.46&nbsp;kB |
| `ip` | 0.39&nbsp;kB |
| `url` | 0.33&nbsp;kB |
| `not_regex` | 0.32&nbsp;kB |
| `before_or_equal` | 0.37&nbsp;kB |
| `after_or_equal` | 0.34&nbsp;kB |
| `regex` | 0.31&nbsp;kB |
| `before` | 0.37&nbsp;kB |
| `after` | 0.33&nbsp;kB |
| `ipv6` | 0.30&nbsp;kB |
| `email` | 0.23&nbsp;kB |
| `gte` | 0.23&nbsp;kB |
| `image` | 0.21&nbsp;kB |
| `lte` | 0.22&nbsp;kB |
| `gt` | 0.18&nbsp;kB |
| `lt` | 0.19&nbsp;kB |
| `mimes` | 0.15&nbsp;kB |
| `mimetypes` | 0.21&nbsp;kB |
| `date_format` | 0.26&nbsp;kB |
| `ipv4` | 0.21&nbsp;kB |
| `different` | 0.20&nbsp;kB |
| `same` | 0.23&nbsp;kB |
| `in_array` | 0.15&nbsp;kB |
| `date` | 0.19&nbsp;kB |
| `file` | 0.19&nbsp;kB |
| `between` | 0.15&nbsp;kB |
| `digits_between` | 0.18&nbsp;kB |
| `numeric` | 0.16&nbsp;kB |
| `distinct` | 0.11&nbsp;kB |
| `timezone` | 0.15&nbsp;kB |
| `max` | 0.14&nbsp;kB |
| `min` | 0.22&nbsp;kB |
| `size` | 0.14&nbsp;kB |
| `digits` | 0.14&nbsp;kB |
| `alpha_dash` | 0.14&nbsp;kB |
| `uuid` | 0.19&nbsp;kB |
| `confirmed` | 0.18&nbsp;kB |
| `accepted` | 0.17&nbsp;kB |
| `json` | 0.11&nbsp;kB |
| `alpha_num` | 0.15&nbsp;kB |
| `captcha` | 0.15&nbsp;kB |
| `in` | 0.18&nbsp;kB |
| `integer` | 0.14&nbsp;kB |
| `date_equals` | 0.11&nbsp;kB |
| `boolean` | 0.15&nbsp;kB |
| `alpha` | 0.19&nbsp;kB |
| `not_in` | 0.21&nbsp;kB |
| `required` | 0.18&nbsp;kB |
| `filled` | 0.17&nbsp;kB |
| `array` | 0.09&nbsp;kB |
| `nullable` | 0.17&nbsp;kB |
| `string` | 0.13&nbsp;kB |
| **Total** | 2.84&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 1.83&nbsp;kB |
| `ip` | 1.90&nbsp;kB |
| `url` | 1.08&nbsp;kB |
| `not_regex` | 1.20&nbsp;kB |
| `before_or_equal` | 1.39&nbsp;kB |
| `after_or_equal` | 1.39&nbsp;kB |
| `regex` | 1.09&nbsp;kB |
| `before` | 1.37&nbsp;kB |
| `after` | 1.36&nbsp;kB |
| `ipv6` | 1.71&nbsp;kB |
| `email` | 0.79&nbsp;kB |
| `gte` | 0.88&nbsp;kB |
| `image` | 0.85&nbsp;kB |
| `lte` | 0.88&nbsp;kB |
| `gt` | 0.88&nbsp;kB |
| `lt` | 0.88&nbsp;kB |
| `mimes` | 0.85&nbsp;kB |
| `mimetypes` | 0.84&nbsp;kB |
| `date_format` | 0.86&nbsp;kB |
| `ipv4` | 0.71&nbsp;kB |
| `different` | 0.75&nbsp;kB |
| `same` | 0.75&nbsp;kB |
| `in_array` | 0.74&nbsp;kB |
| `date` | 0.80&nbsp;kB |
| `file` | 0.76&nbsp;kB |
| `between` | 0.70&nbsp;kB |
| `digits_between` | 0.71&nbsp;kB |
| `numeric` | 0.67&nbsp;kB |
| `distinct` | 0.70&nbsp;kB |
| `timezone` | 0.65&nbsp;kB |
| `max` | 0.67&nbsp;kB |
| `min` | 0.67&nbsp;kB |
| `size` | 0.67&nbsp;kB |
| `digits` | 0.66&nbsp;kB |
| `alpha_dash` | 0.61&nbsp;kB |
| `uuid` | 0.64&nbsp;kB |
| `confirmed` | 0.63&nbsp;kB |
| `accepted` | 0.62&nbsp;kB |
| `json` | 0.64&nbsp;kB |
| `alpha_num` | 0.61&nbsp;kB |
| `captcha` | 0.62&nbsp;kB |
| `in` | 0.63&nbsp;kB |
| `integer` | 0.63&nbsp;kB |
| `date_equals` | 0.63&nbsp;kB |
| `boolean` | 0.61&nbsp;kB |
| `alpha` | 0.60&nbsp;kB |
| `not_in` | 0.62&nbsp;kB |
| `required` | 0.60&nbsp;kB |
| `filled` | 0.60&nbsp;kB |
| `array` | 0.59&nbsp;kB |
| `nullable` | 0.59&nbsp;kB |
| `string` | 0.60&nbsp;kB |
| **Total** | 10.95&nbsp;kB |

</details>

## Locales

What each locale adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.71&nbsp;kB |
| `de_DE` | 1.56&nbsp;kB |
| `en_US` | 1.27&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 1.50&nbsp;kB |
| `de_DE` | 1.36&nbsp;kB |
| `en_US` | 1.07&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Locale | JS |
| --- | --- |
| `hu_HU` | 7.39&nbsp;kB |
| `de_DE` | 6.61&nbsp;kB |
| `en_US` | 6.45&nbsp;kB |

</details>

## Themes

What a theme's token definitions add to the bundle.

<details open>
<summary><h3>Gzip</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 3.95&nbsp;kB |
| `origin` | 3.95&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 3.38&nbsp;kB |
| `origin` | 3.36&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Theme | JS |
| --- | --- |
| `material` | 17.40&nbsp;kB |
| `origin` | 17.39&nbsp;kB |

</details>

<!--@size-end-->