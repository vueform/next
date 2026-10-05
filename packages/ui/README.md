# Vueform UI

Official adapter for Vueform.

## Bundle Size

<!--@size-start-->

Generated at 2026-10-05T12:41:00.824Z. Sizes are the emitted JS and CSS assets of a production Vite build with default settings (esbuild minification for JS and CSS, no custom config), measured as deltas against a baseline (Vite app only, no Vueform).

Measured with:

- Node v26.8.2
- `pnpm@10.20.0`
- `vue@3.5.43`
- `vite@8.3.2`
- `@vueform/core@2.0.0-alpha.1`
- `@vueform/ui@2.0.0-alpha.1`

## How to interpret results

In tables with a **Total** row, the individual rows show the size that removing that item saves from the bundle, while the **Total** row is measured with all items added — it also contains code shared between items, so it can exceed the sum of the individual rows.

## Core

The size of the bare `createVueform` import — the smallest possible Vueform footprint. Modules, components, rules, locales and themes extend this size; for their numbers see the tables below.

|  | JS |
| --- | --- |
| Gzip | 4.26&nbsp;kB |
| Brotli | 3.85&nbsp;kB |
| Raw | 11.35&nbsp;kB |

## Modules

What each module adds to the bundle when registered.

<details open>
<summary><h3>Gzip</h3></summary>

| Module | JS |
| --- | --- |
| `devtools` | 20.34&nbsp;kB |
| `model` | 7.50&nbsp;kB |
| `validation` | 5.98&nbsp;kB |
| `theme` | 2.06&nbsp;kB |
| `conditions` | 2.01&nbsp;kB |
| `autosave` | 1.99&nbsp;kB |
| `security` | 1.60&nbsp;kB |
| `expression` | 1.25&nbsp;kB |
| `http` | 0.97&nbsp;kB |
| `router` | 0.59&nbsp;kB |
| `locale` | 0.28&nbsp;kB |
| `date` | 0.14&nbsp;kB |
| **Total** | 44.04&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Module | JS |
| --- | --- |
| `devtools` | 16.29&nbsp;kB |
| `model` | 6.90&nbsp;kB |
| `validation` | 5.42&nbsp;kB |
| `theme` | 1.76&nbsp;kB |
| `conditions` | 1.78&nbsp;kB |
| `autosave` | 1.79&nbsp;kB |
| `security` | 1.48&nbsp;kB |
| `expression` | 1.15&nbsp;kB |
| `http` | 0.89&nbsp;kB |
| `router` | 0.47&nbsp;kB |
| `locale` | 0.18&nbsp;kB |
| `date` | 0.09&nbsp;kB |
| **Total** | 37.28&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Module | JS |
| --- | --- |
| `devtools` | 58.47&nbsp;kB |
| `model` | 23.77&nbsp;kB |
| `validation` | 19.13&nbsp;kB |
| `theme` | 5.84&nbsp;kB |
| `conditions` | 6.68&nbsp;kB |
| `autosave` | 5.53&nbsp;kB |
| `security` | 4.31&nbsp;kB |
| `expression` | 3.58&nbsp;kB |
| `http` | 2.72&nbsp;kB |
| `router` | 1.58&nbsp;kB |
| `locale` | 0.90&nbsp;kB |
| `date` | 0.37&nbsp;kB |
| **Total** | 130.47&nbsp;kB |

</details>

## Components

What each component adds to the bundle when registered, split into **JS** and **CSS** — a component imports exactly the theme chunks it needs, so its stylesheet cost is part of it.

Values near zero — even slightly negative, within ±0.2 kB — are compression noise: removing the item can make the compression slightly more effective, and that improvement can exceed the few bytes the item itself adds.

<details open>
<summary><h3>Gzip</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 5.65&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.96&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 2.97&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 2.36&nbsp;kB | 0.00&nbsp;kB |
| `VfFile` | 1.60&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 1.52&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 1.07&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.99&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxes` | 0.75&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.70&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.68&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 0.66&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.60&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.48&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.43&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.42&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 0.39&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.37&nbsp;kB | 0.00&nbsp;kB |
| `VfLanguages` | 0.34&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.32&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.31&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.27&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.23&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.17&nbsp;kB | 0.00&nbsp;kB |
| `VfSteps` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.11&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 49.21&nbsp;kB | 0.00&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 4.11&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 3.03&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 2.41&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 1.60&nbsp;kB | 0.00&nbsp;kB |
| `VfFile` | 1.06&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 1.17&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 0.85&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 0.87&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxes` | 0.20&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 0.45&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 0.44&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 0.45&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 0.21&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 0.48&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 0.33&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 0.41&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 0.34&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 0.26&nbsp;kB | 0.00&nbsp;kB |
| `VfLanguages` | 0.18&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 0.29&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 0.29&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 0.27&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 0.15&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.17&nbsp;kB | 0.00&nbsp;kB |
| `VfSteps` | 0.22&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 0.08&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | -0.04&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 40.03&nbsp;kB | 0.00&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Component | JS | CSS |
| --- | --- | --- |
| `VfForm` | 18.01&nbsp;kB | 0.00&nbsp;kB |
| `VfMatrix` | 17.39&nbsp;kB | 0.00&nbsp;kB |
| `VfLayout` | 11.86&nbsp;kB | 0.00&nbsp;kB |
| `VfGrid` | 7.74&nbsp;kB | 0.00&nbsp;kB |
| `VfFile` | 6.17&nbsp;kB | 0.00&nbsp;kB |
| `VfList` | 7.96&nbsp;kB | 0.00&nbsp;kB |
| `VfNav` | 5.22&nbsp;kB | 0.00&nbsp;kB |
| `VfButton` | 4.72&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckboxes` | 5.17&nbsp;kB | 0.00&nbsp;kB |
| `VfCol` | 2.58&nbsp;kB | 0.00&nbsp;kB |
| `VfCheckbox` | 4.63&nbsp;kB | 0.00&nbsp;kB |
| `VfRadio` | 4.56&nbsp;kB | 0.00&nbsp;kB |
| `VfRadios` | 5.01&nbsp;kB | 0.00&nbsp;kB |
| `VfTextarea` | 4.00&nbsp;kB | 0.00&nbsp;kB |
| `VfGroup` | 3.25&nbsp;kB | 0.00&nbsp;kB |
| `VfSelect` | 4.14&nbsp;kB | 0.00&nbsp;kB |
| `VfText` | 3.90&nbsp;kB | 0.00&nbsp;kB |
| `VfField` | 2.70&nbsp;kB | 0.00&nbsp;kB |
| `VfLanguages` | 1.69&nbsp;kB | 0.00&nbsp;kB |
| `VfContent` | 2.09&nbsp;kB | 0.00&nbsp;kB |
| `VfAddon` | 1.40&nbsp;kB | 0.00&nbsp;kB |
| `VfHidden` | 1.59&nbsp;kB | 0.00&nbsp;kB |
| `VfRow` | 1.14&nbsp;kB | 0.00&nbsp;kB |
| `VfIcon` | 0.72&nbsp;kB | 0.00&nbsp;kB |
| `VfSteps` | 1.64&nbsp;kB | 0.00&nbsp;kB |
| `VfTabs` | 1.50&nbsp;kB | 0.00&nbsp;kB |
| `VfElements` | 0.74&nbsp;kB | 0.00&nbsp;kB |
| **Total** | 193.46&nbsp;kB | 0.00&nbsp;kB |

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
| `not_regex` | 0.43&nbsp;kB |
| `before_or_equal` | 0.42&nbsp;kB |
| `after_or_equal` | 0.42&nbsp;kB |
| `before` | 0.41&nbsp;kB |
| `regex` | 0.41&nbsp;kB |
| `after` | 0.41&nbsp;kB |
| `ipv6` | 0.39&nbsp;kB |
| `email` | 0.29&nbsp;kB |
| `gte` | 0.29&nbsp;kB |
| `lte` | 0.29&nbsp;kB |
| `gt` | 0.28&nbsp;kB |
| `lt` | 0.28&nbsp;kB |
| `image` | 0.28&nbsp;kB |
| `mimes` | 0.26&nbsp;kB |
| `mimetypes` | 0.26&nbsp;kB |
| `date_format` | 0.25&nbsp;kB |
| `ipv4` | 0.25&nbsp;kB |
| `different` | 0.25&nbsp;kB |
| `same` | 0.24&nbsp;kB |
| `in_array` | 0.24&nbsp;kB |
| `date` | 0.23&nbsp;kB |
| `between` | 0.22&nbsp;kB |
| `file` | 0.22&nbsp;kB |
| `numeric` | 0.22&nbsp;kB |
| `digits_between` | 0.22&nbsp;kB |
| `distinct` | 0.21&nbsp;kB |
| `timezone` | 0.21&nbsp;kB |
| `max` | 0.21&nbsp;kB |
| `min` | 0.21&nbsp;kB |
| `size` | 0.20&nbsp;kB |
| `digits` | 0.20&nbsp;kB |
| `uuid` | 0.20&nbsp;kB |
| `alpha_dash` | 0.20&nbsp;kB |
| `confirmed` | 0.20&nbsp;kB |
| `in` | 0.20&nbsp;kB |
| `accepted` | 0.20&nbsp;kB |
| `alpha_num` | 0.19&nbsp;kB |
| `captcha` | 0.19&nbsp;kB |
| `integer` | 0.19&nbsp;kB |
| `json` | 0.19&nbsp;kB |
| `date_equals` | 0.19&nbsp;kB |
| `boolean` | 0.19&nbsp;kB |
| `alpha` | 0.19&nbsp;kB |
| `not_in` | 0.19&nbsp;kB |
| `required` | 0.18&nbsp;kB |
| `filled` | 0.18&nbsp;kB |
| `array` | 0.17&nbsp;kB |
| `nullable` | 0.17&nbsp;kB |
| `string` | 0.17&nbsp;kB |
| **Total** | 3.20&nbsp;kB |

</details>

<details>
<summary><h3>Brotli</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 0.50&nbsp;kB |
| `ip` | 0.40&nbsp;kB |
| `url` | 0.40&nbsp;kB |
| `not_regex` | 0.37&nbsp;kB |
| `before_or_equal` | 0.35&nbsp;kB |
| `after_or_equal` | 0.40&nbsp;kB |
| `before` | 0.40&nbsp;kB |
| `regex` | 0.34&nbsp;kB |
| `after` | 0.35&nbsp;kB |
| `ipv6` | 0.30&nbsp;kB |
| `email` | 0.19&nbsp;kB |
| `gte` | 0.24&nbsp;kB |
| `lte` | 0.26&nbsp;kB |
| `gt` | 0.29&nbsp;kB |
| `lt` | 0.21&nbsp;kB |
| `image` | 0.22&nbsp;kB |
| `mimes` | 0.24&nbsp;kB |
| `mimetypes` | 0.22&nbsp;kB |
| `date_format` | 0.18&nbsp;kB |
| `ipv4` | 0.19&nbsp;kB |
| `different` | 0.20&nbsp;kB |
| `same` | 0.20&nbsp;kB |
| `in_array` | 0.25&nbsp;kB |
| `date` | 0.22&nbsp;kB |
| `between` | 0.19&nbsp;kB |
| `file` | 0.15&nbsp;kB |
| `numeric` | 0.20&nbsp;kB |
| `digits_between` | 0.16&nbsp;kB |
| `distinct` | 0.11&nbsp;kB |
| `timezone` | 0.17&nbsp;kB |
| `max` | 0.17&nbsp;kB |
| `min` | 0.14&nbsp;kB |
| `size` | 0.16&nbsp;kB |
| `digits` | 0.18&nbsp;kB |
| `uuid` | 0.13&nbsp;kB |
| `alpha_dash` | 0.19&nbsp;kB |
| `confirmed` | 0.18&nbsp;kB |
| `in` | 0.14&nbsp;kB |
| `accepted` | 0.15&nbsp;kB |
| `alpha_num` | 0.17&nbsp;kB |
| `captcha` | 0.16&nbsp;kB |
| `integer` | 0.09&nbsp;kB |
| `json` | 0.12&nbsp;kB |
| `date_equals` | 0.17&nbsp;kB |
| `boolean` | 0.18&nbsp;kB |
| `alpha` | 0.20&nbsp;kB |
| `not_in` | 0.16&nbsp;kB |
| `required` | 0.08&nbsp;kB |
| `filled` | 0.16&nbsp;kB |
| `array` | 0.18&nbsp;kB |
| `nullable` | 0.16&nbsp;kB |
| `string` | 0.14&nbsp;kB |
| **Total** | 2.85&nbsp;kB |

</details>

<details>
<summary><h3>Raw</h3></summary>

| Rule | JS |
| --- | --- |
| `dimensions` | 1.83&nbsp;kB |
| `ip` | 1.90&nbsp;kB |
| `url` | 1.08&nbsp;kB |
| `not_regex` | 1.22&nbsp;kB |
| `before_or_equal` | 1.39&nbsp;kB |
| `after_or_equal` | 1.39&nbsp;kB |
| `before` | 1.37&nbsp;kB |
| `regex` | 1.09&nbsp;kB |
| `after` | 1.36&nbsp;kB |
| `ipv6` | 1.71&nbsp;kB |
| `email` | 0.79&nbsp;kB |
| `gte` | 0.88&nbsp;kB |
| `lte` | 0.88&nbsp;kB |
| `gt` | 0.88&nbsp;kB |
| `lt` | 0.88&nbsp;kB |
| `image` | 0.85&nbsp;kB |
| `mimes` | 0.85&nbsp;kB |
| `mimetypes` | 0.84&nbsp;kB |
| `date_format` | 0.86&nbsp;kB |
| `ipv4` | 0.71&nbsp;kB |
| `different` | 0.75&nbsp;kB |
| `same` | 0.75&nbsp;kB |
| `in_array` | 0.74&nbsp;kB |
| `date` | 0.80&nbsp;kB |
| `between` | 0.70&nbsp;kB |
| `file` | 0.76&nbsp;kB |
| `numeric` | 0.67&nbsp;kB |
| `digits_between` | 0.71&nbsp;kB |
| `distinct` | 0.70&nbsp;kB |
| `timezone` | 0.65&nbsp;kB |
| `max` | 0.67&nbsp;kB |
| `min` | 0.67&nbsp;kB |
| `size` | 0.67&nbsp;kB |
| `digits` | 0.66&nbsp;kB |
| `uuid` | 0.64&nbsp;kB |
| `alpha_dash` | 0.61&nbsp;kB |
| `confirmed` | 0.63&nbsp;kB |
| `in` | 0.64&nbsp;kB |
| `accepted` | 0.62&nbsp;kB |
| `alpha_num` | 0.61&nbsp;kB |
| `captcha` | 0.62&nbsp;kB |
| `integer` | 0.63&nbsp;kB |
| `json` | 0.64&nbsp;kB |
| `date_equals` | 0.63&nbsp;kB |
| `boolean` | 0.61&nbsp;kB |
| `alpha` | 0.60&nbsp;kB |
| `not_in` | 0.62&nbsp;kB |
| `required` | 0.60&nbsp;kB |
| `filled` | 0.60&nbsp;kB |
| `array` | 0.59&nbsp;kB |
| `nullable` | 0.59&nbsp;kB |
| `string` | 0.60&nbsp;kB |
| **Total** | 10.98&nbsp;kB |

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
| `hu_HU` | 1.46&nbsp;kB |
| `de_DE` | 1.32&nbsp;kB |
| `en_US` | 1.08&nbsp;kB |

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